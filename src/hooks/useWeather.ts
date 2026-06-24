import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useEffect, useState } from 'react';
import * as Haptics from 'expo-haptics';

// Actual API key for OpenWeatherMap
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY;
//console.log("The API KEY that i send is:", JSON.stringify(API_KEY));

// TypeScript interface for weather data
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
    main: string;
  }[];
  wind: {
    speed: number;
  };
}

export const useWeather = () => {
    // State to hold weather data
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<any[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isloading, setIsLoading] = useState<boolean>(true);

  // Pull-to-Refresh
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load stored weather if there is no internet cnnection
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const loadCachedWeather = async () => {
    try {
      const cachedWeather = await AsyncStorage.getItem('last_weather');
      const cachedForecast = await AsyncStorage.getItem('last_forecast');
      if (cachedWeather && cachedForecast) {
        setWeather(JSON.parse(cachedWeather));
        setForecast(JSON.parse(cachedForecast));
        setIsOffline(true);
        } else {
        setErrorMsg('No internet connection and no stored data found.')
      }
    } catch (e) {
      setErrorMsg('Error while reading cache memory.')
    }
  };

  const fetchWeatherData = async () => {
    try {
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return ;
      }

      let location = await Location.getCurrentPositionAsync({});
      const {latitude, longitude} = location.coords;

      if (!API_KEY) {
        throw new Error('API key is missing');
      }

      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      if (!weatherRes.ok) {
        const errorDetails = await weatherRes.text();
        console.log(errorDetails);
        throw new Error('Problem at weather');
      }

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=el`
      )

      if (!forecastRes.ok) {
        const errorDetails = await forecastRes.text();
        console.log(errorDetails);
        throw new Error('Problem at forecast weather');
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();

      setWeather(weatherData);
      setForecast(forecastData.list);
      setIsOffline(false);
      setErrorMsg(null);
      // store new data in the device for the next time
      await AsyncStorage.setItem('last_weather', JSON.stringify(weatherData));
      await AsyncStorage.setItem('last_forecast', JSON.stringify(forecastData.list));

      } catch (error) {
        console.log(error);
        await loadCachedWeather();
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // useEffect to fetch weather data on component mount
  useEffect(() => {
    fetchWeatherData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchWeatherData();
  };

  return {weather, forecast, isloading, errorMsg, refreshing, isOffline, onRefresh};
};