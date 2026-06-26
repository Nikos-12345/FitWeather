import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: 'https://0d14a4fdfc72f4d61a3d4770f1a8a37b@o4511624903196672.ingest.de.sentry.io/4511624914075728',
  tracesSampleRate: 1.0,
});

import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, RefreshControl, Animated } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { getAnalytics, logEvent } from '@react-native-firebase/analytics';
import { LinearGradient } from 'expo-linear-gradient'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useWeather } from './src/hooks/useWeather';
import { getWorkoutVerdict } from './src/utils/workoutLogic';
import { VerdictCard } from './src/components/VerdictCard';
import { WetaherStats } from './src/components/WeatherStats';
import { RestdayCard } from './src/components/RestDayCard';
import { LoadingScreen } from './src/components/LoadingScreen';
import { registerForPushNotificationsAsync, scheduleDailyWeatherCheck } from './src/utils/notificationService';
import { generateAIVerdict } from './src/utils/AIservice';
import OnboardingScreen, { UserProfile } from './src/components/OnboardingScreen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/utils/firebaseConfig';
import AuthScreen from './src/components/AuthScreen';

Notifications.setNotificationHandler({ 
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // States for onboarding
  const [hasCompletedOnboarding, sethasCompletedOnboarding] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCheckingStorage, setisCheckingStorage] = useState<boolean>(true);
  const { weather, forecast, isloading, errorMsg, refreshing, isOffline, onRefresh } = useWeather();

  // Animation
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  const currentHour = new Date().getHours();
  const isDarkMode = currentHour >= 19 || currentHour < 7;
  const [aiAdvice, setAiAdvice] = React.useState<string>('The AI coach is analyzing the weather data...');
  const [isAiLoading, setIsAiLoading] = React.useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });

    return unsubscribe; 
  }, []);

  useEffect (() => {
    const checkOnboardingStatus = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile !== null) {
          setUserProfile(JSON.parse(storedProfile));
          sethasCompletedOnboarding(true);
        }
      } catch (error) {
        console.error("Error reading AsyncStorage:", error);
      } finally {
        setisCheckingStorage(false);
      }
    };
    checkOnboardingStatus();
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
      const hasPermition = await registerForPushNotificationsAsync();

      if (hasPermition && forecast) {
        await scheduleDailyWeatherCheck(forecast);
      }
    };

    if (!isloading && forecast) {
      initNotifications();
    }
  }, [forecast, isloading]);

  React.useEffect(() => {
    const fetchAIVerdict = async () => {
      if (!isloading && weather && forecast && hasCompletedOnboarding && userProfile) {
        setIsAiLoading(true);
        const advice = await generateAIVerdict(weather, forecast, userProfile);
        setAiAdvice(advice);
        setIsAiLoading(false);
      }
    };
    fetchAIVerdict();
  }, [isloading, weather, forecast, hasCompletedOnboarding, userProfile]);

  if (isAuthChecking) {
    return <LoadingScreen isDarkMode={isDarkMode}/>;
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (isCheckingStorage) {
    return <LoadingScreen isDarkMode={isDarkMode}/>;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingScreen 
        onComplete={async (profile) => {
          try {
            await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
            setUserProfile(profile);
            sethasCompletedOnboarding(true);
          } catch (error) {
            console.error("Error saving to AsyncStorage:", error);
          }
        }} 
      />
    );
  }

  // Loading state (while waiting GPS and API response)
  if (isloading) {
    return <LoadingScreen isDarkMode={isDarkMode}/>;
  }

  // Error state (if GPS or API fails)
  if (errorMsg || !weather) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark, styles.centerContent]}>
        <Ionicons name="warning-outline" size={50} color="#ef4444"/>
        <Text style={styles.errorText}>{errorMsg || "Something went wrong"}</Text>
      </View>
    );
  }

  // Safety check if weather is null
  if (!weather || !weather.wind) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark, styles.centerContent]}>
        <Ionicons name="warning-outline" size={50} color="#ef4444"/>
        <Text style={styles.errorText}>Data error. Drag down to refresh.</Text>
      </View>
    );
  } 

  // Compute wind speed in (from m/s to Km/h)
  const windSpeedKmH = Math.round(weather.wind.speed * 3.6);
  const baseVerdict = getWorkoutVerdict(weather.main.temp, windSpeedKmH, weather.weather[0].main);

  const verdict = {
    ...baseVerdict,
    message: aiAdvice
  };
  
  const backgroundColors: [string, string, string] = isDarkMode 
    ? ['#0f172a', '#1e1b4b', '#020617'] 
    : ['#e0f2fe', '#f8fafc', '#fae8ff'];

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
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

            {/* Header with live location */}
            <View style={styles.header}>
              <Text style={[styles.appTitle, isDarkMode && styles.textPrimaryDark]}>FitWeather</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={25} color="#0ea5e9" />
                <Text style={[styles.locationText, isDarkMode && styles.textSecondaryDark]}>{weather.name}</Text>
              </View>
            </View>

            {/* if no internet connection we see stored data */}
            {isOffline && (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={16} color="#d97706" style={{marginRight: 6}} />
                <Text style={styles.offlineText}>Offline Mode: Showing last saved weather data</Text>
              </View>
            )}

            {/* Workout Verdict Card */}
            <VerdictCard verdict={verdict} isDarkMode={isDarkMode} />

            {/* Smart weather forecast */}
            <RestdayCard forecast={forecast} isDarkMode={isDarkMode}/>

            {/* Live Weather Details section*/}
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
  loadingText: { color: '#64748B', fontSize: 16, marginTop: 10, fontWeight: '500' },
  errorText: { color: '#ef4444', fontSize: 16, marginTop: 15, textAlign: 'center', fontWeight: '500' },
  scrollContainer: { padding: 20 },
  header: { marginBottom: 20 },
  appTitle: { color: '#1E293B', fontSize: 35, fontWeight: '900', letterSpacing: -0.5, marginTop: 30 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  locationText: { color: '#64748B', fontSize: 20, marginLeft: 5, fontWeight: '600' },

  // DARK MODE VARIABLES
  containerDark: { backgroundColor: '#0f172a' },
  textPrimaryDark: { color: '#F8FAFC' },
  textSecondaryDark: { color: '#94A3B8' },

  // Offline-Mode
  offlineBanner: { flexDirection: 'row', backgroundColor: "rgba(254, 243, 199, 0.8)", padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  offlineText: { color: "#d97706", fontSize: 13, fontWeight: 'bold' }
});

export default Sentry.wrap(App);