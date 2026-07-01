import * as Sentry from '@sentry/react-native';
Sentry.init({
  dsn: 'https://0d14a4fdfc72f4d61a3d4770f1a8a37b@o4511624903196672.ingest.de.sentry.io/4511624914075728',
  tracesSampleRate: 1.0,
});

import React, { useEffect, useState, useCallback } from 'react'; // Προσθήκη useCallback
import { NavigationContainer, useFocusEffect } from '@react-navigation/native'; // Προσθήκη useFocusEffect
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, User } from 'firebase/auth';
import './src/locales/i18n'; 
import { loadSavedLanguage } from './src/locales/i18n';

import { auth } from './src/utils/firebaseConfig';
import AuthScreen from './src/components/AuthScreen';
import OnboardingScreen from './src/components/OnboardingScreen';
import HomeScreen from './src/components/HomeScreen';
import StatsScreen from './src/components/StatsScreen';
import SettingsScreen from './src/components/SettingsScreen';
import { LoadingScreen } from './src/components/LoadingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Ξεχωρίζουμε τα Tabs για να μπουν μέσα στον Stack
function MainTabs() {
  const [appTheme, setAppTheme] = useState('system');

  // Μόλις το MainTabs έρθει στο προσκήνιο, διαβάζει το Theme
  useFocusEffect(
    useCallback(() => {
      const loadTheme = async () => {
        try {
          const storedTheme = await AsyncStorage.getItem('@app_theme');
          if (storedTheme) {
            setAppTheme(storedTheme);
          }
        } catch (error) {
          console.error("Error loading theme in MainTabs:", error);
        }
      };
      loadTheme();
    }, [])
  );

  // Δυναμικός υπολογισμός
  const currentHour = new Date().getHours();
  let isDarkMode = currentHour >= 19 || currentHour < 7;
  if (appTheme === 'dark') isDarkMode = true;
  if (appTheme === 'light') isDarkMode = false;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;
          if (route.name === 'Coach') iconName = focused ? 'fitness' : 'fitness-outline';
          else if (route.name === 'Stats') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: isDarkMode ? '#4CAF50' : '#0ea5e9', 
        tabBarInactiveTintColor: isDarkMode ? '#888888' : '#64748B',
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#121212' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#2C2C2C' : '#E2E8F0',
          paddingBottom: 15, paddingTop: 10, minheight: 75, elevation: 0, 
        },
      })}
    >
      <Tab.Screen name="Coach" component={HomeScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
    </Tab.Navigator>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [isCheckingStorage, setIsCheckingStorage] = useState<boolean>(true);

  // Και ένα γρήγορο state για το Loading Screen (αν και περνάει γρήγορα)
  const [appTheme, setAppTheme] = useState('system');

  const currentHour = new Date().getHours();
  let isDarkMode = currentHour >= 19 || currentHour < 7;
  if (appTheme === 'dark') isDarkMode = true;
  if (appTheme === 'light') isDarkMode = false;

  useEffect(() => {
    loadSavedLanguage();
    // Φορτώνουμε το theme και κατά το αρχικό άνοιγμα
    AsyncStorage.getItem('@app_theme').then((theme) => {
      if (theme) setAppTheme(theme);
    });
  }, []);

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
        if (storedProfile !== null) setHasCompletedOnboarding(true);
      } catch (error) {
        console.error("Error reading AsyncStorage:", error);
      } finally {
        setIsCheckingStorage(false);
      }
    };
    if (currentUser) checkOnboardingStatus();
  }, [currentUser]);

  if (isAuthChecking || (currentUser && isCheckingStorage)) {
    return <LoadingScreen isDarkMode={isDarkMode} />;
  }

  if (!currentUser) return <AuthScreen />;

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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Sentry.wrap(App);