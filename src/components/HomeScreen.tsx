import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl, Animated, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useWeather } from '../hooks/useWeather';
import { getWorkoutVerdict } from '../utils/workoutLogic';
import { VerdictCard } from './VerdictCard';
import { WeatherStats } from './WeatherStats';
import { LoadingScreen } from './LoadingScreen';
import { registerForPushNotificationsAsync, scheduleDailyWeatherCheck } from '../utils/notificationService';
import { generateAIVerdict } from '../utils/AIservice';
import { logWorkoutSession } from '../utils/dbService';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [appTheme, setAppTheme] = useState('system');
  const { weather, forecast, isloading, errorMsg, refreshing, isOffline, onRefresh } = useWeather();
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const [aiAdvice, setAiAdvice] = useState<string>('The AI coach is analyzing the weather data...');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [workoutDuration, setWorkoutDuration] = useState('');
  const [selectedLogCategory, setSelectedLogCategory] = useState('Cardio');
  const [customActivity, setCustomActivity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentHour = new Date().getHours();
  let isDarkMode = currentHour >= 19 || currentHour < 7;
  if (appTheme === 'dark') isDarkMode = true;
  if (appTheme === 'light') isDarkMode = false;

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const storedProfile = await AsyncStorage.getItem('@user_profile');
          if (storedProfile) {
            const parsedProfile = JSON.parse(storedProfile);
            setUserProfile(parsedProfile);
            if (parsedProfile.selectedWorkouts && parsedProfile.selectedWorkouts.length > 0) {
              setSelectedLogCategory(parsedProfile.selectedWorkouts[0]);
            }
          }
          const storedTheme = await AsyncStorage.getItem('@app_theme');
          if (storedTheme) {
            setAppTheme(storedTheme);
          }
        } catch (e) {
          console.error("Error loading profile in HomeScreen:", e);
        }
      };
      loadProfile();
    }, [])
  );

  useEffect(() => {
    if (!isloading && weather) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
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

  const handleLogWorkout = async () => {
    if (!workoutDuration || isNaN(Number(workoutDuration)) || Number(workoutDuration) <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid number of minutes.');
      return;
    }

    let finalActivity = selectedLogCategory;
    if (selectedLogCategory === 'Other') {
      if (!customActivity.trim()) {
        Alert.alert('Missing Info', 'Please type the name of your activity.');
        return ;
      }
      finalActivity = customActivity.trim();

      if (userProfile && !userProfile.selectedWorkouts.includes(finalActivity)) {
        const updatedProfile = { ...userProfile};
        updatedProfile.selectedWorkouts.push(finalActivity);
        await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      }
    }

    setIsSubmitting(true);
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const success = await logWorkoutSession(user.uid, finalActivity, Number(workoutDuration));
      if (success) {
        Alert.alert('Success!', 'Workout logged. Keep grinding!');
        setModalVisible(false);
        setWorkoutDuration(''); 
        setCustomActivity('');
      } else {
        Alert.alert('Error', 'Could not save the workout. Try again.');
      }
    }
    setIsSubmitting(false);
  };

  if (isloading) return <LoadingScreen isDarkMode={isDarkMode} />;
  
  if (errorMsg || !weather || !weather.wind) {
    return (
      <View style={[styles.container, isDarkMode && styles.containerDark, styles.centerContent]}>
        <Ionicons name="warning-outline" size={50} color="#ef4444"/>
        <Text style={styles.errorText}>{errorMsg || t('data_error')}</Text>
      </View>
    );
  }

  const windSpeedKmH = Math.round(weather.wind.speed * 3.6);
  const baseVerdict = getWorkoutVerdict(weather.main.temp, windSpeedKmH, weather.weather[0].main);
  const verdict = { ...baseVerdict, message: aiAdvice };

  const backgroundColors: [string, string, string] = isDarkMode 
    ? ['#0f172a', '#1e1b4b', '#020617'] 
    : ['#e0f2fe', '#f8fafc', '#fae8ff'];

  const userActivities = userProfile?.selectedWorkouts || [];
  const displayActivities = [...userActivities, 'Other'];

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={isDarkMode ? "#f8fafc" : "#1e293b"} />}
        >
          <Animated.View style={{ opacity: fadeAnimation }}>
            
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Text style={[styles.appTitle, isDarkMode && styles.textPrimaryDark]}>FitWeather</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsButton}>
                  <Ionicons name="settings-outline" size={28} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
                </TouchableOpacity>
              </View>
              <View style={styles.locationRow}>
                <Ionicons name="location-sharp" size={25} color="#0ea5e9" />
                <Text style={[styles.locationText, isDarkMode && styles.textSecondaryDark]}>{weather.name}</Text>
              </View>
            </View>

            {isOffline && (
              <View style={styles.offlineBanner}>
                <Ionicons name="cloud-offline" size={16} color="#d97706" style={{marginRight: 6}} />
                <Text style={styles.offlineText}>{t('offline_mode')}</Text>
              </View>
            )}

            <WeatherStats 
              temperature={weather.main.temp} 
              description={t(weather.weather[0].description.toLowerCase())}
              windSpeedKmH={windSpeedKmH} 
              humidity={weather.main.humidity} 
              isDarkMode={isDarkMode} 
            />
            <VerdictCard verdict={verdict} isDarkMode={isDarkMode} />

            <TouchableOpacity 
              style={[styles.logButton, isDarkMode ? styles.logButtonDark : styles.logButtonLight]} 
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={24} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.logButtonText}>{t('log_workout')}</Text>
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textPrimaryDark : styles.textPrimaryLight]}>{t('record_session')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalLabel, isDarkMode ? styles.textSecondaryDark : styles.textSecondaryLight]}>{t('select_category')}</Text>
            <View style={styles.chipContainer}>
              {displayActivities.map((activity, index) => (
                <TouchableOpacity 
                  key={`${activity}-${index}`} 
                  style={[styles.chip, selectedLogCategory === activity && (isDarkMode ? styles.chipActiveDark : styles.chipActiveLight)]}
                  onPress={() => setSelectedLogCategory(activity)}
                >
                  <Text style={[styles.chipText, selectedLogCategory === activity && styles.chipTextActive]}>{activity}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {selectedLogCategory === 'Other' && (
              <View style={styles.customActivityContainer}>
                <Text style={[styles.modalLabel, isDarkMode ? styles.textSecondaryDark : styles.textSecondaryLight]}>{t('custom_activity')}</Text>
                <TextInput
                  style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight, { marginBottom: 15 }]}
                  placeholder="e.g. Surfing"
                  placeholderTextColor="#94A3B8"
                  value={customActivity}
                  onChangeText={setCustomActivity}
                />
              </View>
            )}

            <Text style={[styles.modalLabel, isDarkMode ? styles.textSecondaryDark : styles.textSecondaryLight]}>{t('duration_minutes')}</Text>
            <TextInput
              style={[styles.input, isDarkMode ? styles.inputDark : styles.inputLight]}
              placeholder="e.g. 45"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={workoutDuration}
              onChangeText={setWorkoutDuration}
              maxLength={3}
            />

            <TouchableOpacity 
              style={[styles.submitButton, isDarkMode ? styles.submitButtonDark : styles.submitButtonLight, isSubmitting && { opacity: 0.7 }]} 
              onPress={handleLogWorkout}
              disabled={isSubmitting}
            >
              <Text style={styles.submitButtonText}>{isSubmitting ? t('saving') : t('save_workout')}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  appTitle: { color: '#1E293B', fontSize: 35, fontWeight: '900', letterSpacing: -0.5 },
  settingsButton: { padding: 5 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  locationText: { color: '#64748B', fontSize: 20, marginLeft: 5, fontWeight: '600' },
  containerDark: { backgroundColor: '#0f172a' },
  textPrimaryDark: { color: '#F8FAFC' },
  textSecondaryDark: { color: '#94A3B8' },
  textPrimaryLight: { color: '#1E293B' },
  textSecondaryLight: { color: '#64748B' },
  offlineBanner: { flexDirection: 'row', backgroundColor: "rgba(254, 243, 199, 0.8)", padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
  offlineText: { color: "#d97706", fontSize: 13, fontWeight: 'bold' },
  logButton: { flexDirection: 'row', padding: 18, borderRadius: 16, marginTop: 20, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  logButtonDark: { backgroundColor: '#4CAF50' },
  logButtonLight: { backgroundColor: '#0ea5e9' },
  logButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40 },
  modalDark: { backgroundColor: '#1E1E1E' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  modalLabel: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, marginTop: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#333333' },
  chipActiveDark: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  chipActiveLight: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  chipText: { color: '#94A3B8', fontWeight: '600' },
  chipTextActive: { color: '#FFF', fontWeight: 'bold' },
  customActivityContainer: { marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 18, marginBottom: 30 },
  inputDark: { backgroundColor: '#2C2C2C', borderColor: '#333333', color: '#FFF' },
  inputLight: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', color: '#1E293B' },
  submitButton: { padding: 18, borderRadius: 12, alignItems: 'center' },
  submitButtonDark: { backgroundColor: '#4CAF50' },
  submitButtonLight: { backgroundColor: '#0ea5e9' },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});