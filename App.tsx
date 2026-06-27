import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: 'https://0d14a4fdfc72f4d61a3d4770f1a8a37b@o4511624903196672.ingest.de.sentry.io/4511624914075728',
  tracesSampleRate: 1.0,
});

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import * as NavigationBar from 'expo-navigation-bar';
import { Platform } from 'react-native';

import { auth } from './src/utils/firebaseConfig';
import AuthScreen from './src/components/AuthScreen';
import OnboardingScreen from './src/components/OnboardingScreen';
import HomeScreen from './src/components/HomeScreen';
import StatsScreen from './src/components/StatsScreen';
import { LoadingScreen } from './src/components/LoadingScreen';

const Tab = createBottomTabNavigator();

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState<boolean>(true);

  const currentHour = new Date().getHours();
  const isDarkMode = currentHour >= 19 || currentHour < 7;

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(isDarkMode ? '#121212' : '#FFFFFF');
      NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile !== null) {
          setHasCompletedOnboarding(true);
        }
      } catch (error) {
        console.error("Error reading AsyncStorage:", error);
      } finally {
        setIsCheckingStorage(false);
      }
    };

    if (currentUser) {
      checkOnboardingStatus();
    }
  }, [currentUser]);

  if (isAuthChecking || (currentUser && isCheckingStorage)) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  if (!currentUser) {
    return <AuthScreen />;
  }

  if (!hasCompletedOnboarding) {
    return (
      <OnboardingScreen 
        onComplete={async (profile) => {
          try {
            await AsyncStorage.setItem('@user_profile', JSON.stringify(profile));
            setHasCompletedOnboarding(true);
          } catch (error) {
            console.error("Error saving to AsyncStorage:", error);
          }
        }} 
      />
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;
            if (route.name === 'Coach') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'Stats') {
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: isDarkMode ? '#4CAF50' : '#0ea5e9', 
          tabBarInactiveTintColor: isDarkMode ? '#888888' : '#64748B',
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
            borderTopColor: isDarkMode ? '#2C2C2C' : '#E2E8F0',
            paddingBottom: 8, 
            paddingTop: 8,
            height: 65,
            elevation: 0, 
          },
        })}
      >
        <Tab.Screen name="Coach" component={HomeScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default Sentry.wrap(App);