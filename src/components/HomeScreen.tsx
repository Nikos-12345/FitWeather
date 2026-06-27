import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useWeather } from '../hooks/useWeather';
import { getWorkoutVerdict } from '../utils/workoutLogic';
import { VerdictCard } from './VerdictCard';
import { WetaherStats } from './WeatherStats';
import { LoadingScreen } from './LoadingScreen';
import { registerForPushNotificationsAsync, scheduleDailyWeatherCheck } from '../utils/notificationService';
import { generateAIVerdict } from '../utils/AIservice';

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const { weather, forecast, isloading, errorMsg, refreshing, isOffline, onRefresh } = useWeather();
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const [aiAdvice, setAiAdvice] = useState<string>('The AI coach is analyzing the weather data...');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const currentHour = new Date().getHours();
  const isDarkMode = currentHour >= 19 || currentHour < 7;

  // Φορτώνουμε το προφίλ από το AsyncStorage για να το έχει έτοιμο το AI
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
        }
      } catch (e) {
        console.error("Error loading profile in HomeScreen:", e);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!isloading && weather) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      const analyticsInstance = getAnalytics();
      logEvent(analyticsInstance, 'weather_loaded_successfully', {
        city: weather.name,
        temperature: Math.round(weather.main.temp),
        condition: weather.weather[0].main
      });
    }
  }, [isloading, weather]);

  useEffect(() => {
    const initNotifications = async () => {
      const hasPermission = await registerForPushNotificationsAsync();
      if (hasPermission && forecast) {
        await scheduleDailyWeatherCheck(forecast);
      }
    };
    if (!isloading && forecast) {
      initNotifications();
    }
  }, [forecast, isloading]);

  useEffect(() => {
    const fetchAIVerdict = async () => {
      if (!isloading && weather && forecast && userProfile) {
        setIsAiLoading(true);
        const advice = await generateAIVerdict(weather, forecast, userProfile);
        setAiAdvice(advice);
        setIsAiLoading(false);
      }
    };
    fetchAIVerdict();
  }, [isloading, weather, forecast, userProfile]);

  if (isloading) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  if (errorMsg || !weather) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark, styles.centerContent]}>
        <Ionicons name="warning-outline" size={50} color="#ef4444"/>
        <Text style={styles.errorText}>{errorMsg || "Something went wrong"}</Text>
      </View>
    );
  }

  if (!weather || !weather.wind) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark, styles.centerContent]}>
        <Ionicons name="warning-outline" size={50} color="#ef4444"/>
        <Text style={styles.errorText}>Data error. Drag down to refresh.</Text>
      </View>
    );
  }

  const windSpeedKmH = Math.round(weather.wind.speed * 3.6);
  const baseVerdict = getWorkoutVerdict(weather.main.temp, windSpeedKmH, weather.weather[0].main);
  const verdict = { ...baseVerdict, message: aiAdvice };

  const backgroundColors: [string, string, string] = isDarkMode 
    ? ['#0f172a', '#1e1b4b', '#020617'] 
    : ['#e0f2fe', '#f8fafc', '#fae8ff'];

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? "#f8fafc" : "#1e293b"}
            /> 
          }
        >
          <Animated.View style={{ opacity: fadeAnimation }}>
            <View style={styles.header}>
              <Text style={[styles.appTitle, isDarkMode && styles.textPrimaryDark]}>FitWeather</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={25} color="#0ea5e9" />
                <Text style={[styles.locationText, isDarkMode && styles.textSecondaryDark]}>{weather.name}</Text>
              </View>
            </View>

            {isOffline && (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={16} color="#d97706" style={{marginRight: 6}} />
                <Text style={styles.offlineText}>Offline Mode: Showing last saved weather data</Text>
              </View>
            )}

            <VerdictCard verdict={verdict} isDarkMode={isDarkMode} />
            <WetaherStats
              temperature={weather.main.temp}
              description={weather.weather[0].description}
              windSpeedKmH={windSpeedKmH}
              humidity={weather.main.humidity}
              isDarkMode={isDarkMode}
            />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: '#ef4444', fontSize: 16, marginTop: 15, textAlign: 'center', fontWeight: '500' },
  scrollContainer: { padding: 20 },
  header: { marginBottom: 20 },
  appTitle: { color: '#1E293B', fontSize: 35, fontWeight: '900', letterSpacing: -0.5, marginTop: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  locationText: { color: '#64748B', fontSize: 20, marginLeft: 5, fontWeight: '600' },
  containerDark: { backgroundColor: '#0f172a' },
  textPrimaryDark: { color: '#F8FAFC' },
  textSecondaryDark: { color: '#94A3B8' },
  offlineBanner: { flexDirection: 'row', backgroundColor: "rgba(254, 243, 199, 0.8)", padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  offlineText: { color: "#d97706", fontSize: 13, fontWeight: 'bold' }
});