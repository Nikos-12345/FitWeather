import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { getAuth, signOut, deleteUser } from 'firebase/auth'; // Προστέθηκε το deleteUser
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen({ navigation }: any) {
  const { t, i18n } = useTranslation();
  
  // App Preferences States
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [units, setUnits] = useState('metric');
  const [appTheme, setAppTheme] = useState('system');

  // AI Profile States
  const [primaryGoal, setPrimaryGoal] = useState('Hypertrophy');
  const [trainingSplit, setTrainingSplit] = useState('Push/Pull/Legs Split');
  const [preferredTime, setPreferredTime] = useState('Afternoon');

  // Modals States
  const [isGoalModalVisible, setGoalModalVisible] = useState(false);
  const [isSplitModalVisible, setSplitModalVisible] = useState(false);
  const [isTimeModalVisible, setTimeModalVisible] = useState(false);
  const [isLangModalVisible, setLangModalVisible] = useState(false);
  const [isUnitsModalVisible, setUnitsModalVisible] = useState(false);
  const [isThemeModalVisible, setThemeModalVisible] = useState(false);
  const [isEditWorkoutsModalVisible, setEditWorkoutsModalVisible] = useState(false);
  
  const [userProfile, setUserProfile] = useState<any>(null);

  // Δυναμικός υπολογισμός Dark Mode
  const currentHour = new Date().getHours();
  let isDarkMode = currentHour >= 19 || currentHour < 7; // Default by time
  if (appTheme === 'dark') isDarkMode = true;
  if (appTheme === 'light') isDarkMode = false;

  const backgroundColors: [string, string, string] = isDarkMode 
    ? ['#0f172a', '#1e1b4b', '#020617'] 
    : ['#e0f2fe', '#f8fafc', '#fae8ff'];

  const goalsList = [
    'Hypertrophy', 'Strength', 'Powerbuilding', 'Lean Bulking',
    'Weight Loss', 'Shredding / Cutting', 'Endurance', 
    'Functional / CrossFit', 'Sport-Specific Prep', 'Mobility & Flexibility',
    'Active Recovery / Deload', 'Injury Rehab', 'General Fitness'
  ];

  const trainingSplitList = [
    'Push', 'Pull', 'Legs', 'Full Body', 
    'Upper/Lower Split', 'Push/Pull/Legs Split', 
    'Body Part Split', 'Hybrid Split'
  ];

  const preferredTimeList = ['Morning', 'Afternoon', 'Evening', 'Night'];

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile) {
          const parsedProfile = JSON.parse(storedProfile);
          setUserProfile(parsedProfile);
          if (parsedProfile.primaryGoal) setPrimaryGoal(parsedProfile.primaryGoal);
          if (parsedProfile.trainingSplit) setTrainingSplit(parsedProfile.trainingSplit);
          if (parsedProfile.preferredTime) setPreferredTime(parsedProfile.preferredTime);
        }

        const storedUnits = await AsyncStorage.getItem('@app_units');
        if (storedUnits) setUnits(storedUnits);

        const storedTheme = await AsyncStorage.getItem('@app_theme');
        if (storedTheme) setAppTheme(storedTheme);

      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };
    loadSettings();
  }, []);

  const updateProfileData = async (key: string, value: any) => {
    if (userProfile) {
      try {
        const updatedProfile = { ...userProfile, [key]: value };
        await AsyncStorage.setItem('@user_profile', JSON.stringify(updatedProfile));
        setUserProfile(updatedProfile);
      } catch (e) {
        console.error(`Error saving ${key}:`, e);
      }
    }
  };

  const handleSelectGoal = (goal: string) => { setPrimaryGoal(goal); setGoalModalVisible(false); updateProfileData('primaryGoal', goal); };
  const handleSelectSplit = (split: string) => { setTrainingSplit(split); setSplitModalVisible(false); updateProfileData('trainingSplit', split); };
  const handleSelectTime = (time: string) => { setPreferredTime(time); setTimeModalVisible(false); updateProfileData('preferredTime', time); };
  
  const handleSelectUnits = async (selectedUnits: string) => {
    setUnits(selectedUnits);
    setUnitsModalVisible(false);
    await AsyncStorage.setItem('@app_units', selectedUnits);
  };

  const handleSelectTheme = async (selectedTheme: string) => {
    setAppTheme(selectedTheme);
    setThemeModalVisible(false);
    await AsyncStorage.setItem('@app_theme', selectedTheme);
  };

  const handleLanguageChange = async (lang: string) => {
    i18n.changeLanguage(lang);
    await AsyncStorage.setItem('@app_language', lang);
    setLangModalVisible(false);
  };

  const handleDeleteWorkout = (workoutToDelete: string) => {
    if (userProfile && userProfile.selectedWorkouts) {
      const newWorkouts = userProfile.selectedWorkouts.filter((w: string) => w !== workoutToDelete);
      updateProfileData('selectedWorkouts', newWorkouts);
    }
  };

  const handleLogout = () => {
    Alert.alert(t('log_out', 'Log Out'), t('logout_confirm', "Are you sure you want to log out?"), [
      { text: t('cancel', 'Cancel'), style: "cancel" },
      { 
        text: t('log_out', 'Log Out'), 
        style: "destructive", 
        onPress: () => {
          const auth = getAuth();
          signOut(auth).catch((error) => console.error("Logout Error:", error));
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('delete_account', 'Delete Account'), t('delete_account_confirm', "Are you sure you want to delete your account? This action cannot be undone."), [
      { text: t('cancel', 'Cancel'), style: "cancel" },
      { 
        text: t('delete', 'Delete'), 
        style: "destructive", 
        onPress: async () => {
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            try {
              await deleteUser(user);
              await AsyncStorage.clear(); // Καθαρίζουμε και τα τοπικά δεδομένα
            } catch (error: any) {
              // Συνήθως αν έχει περάσει ώρα από το login, το Firebase ζητάει re-authentication
              Alert.alert("Error", "For security reasons, please log out and log back in before deleting your account.");
              console.error("Delete Account Error:", error);
            }
          }
        }
      }
    ]);
  };

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={isDarkMode ? "#F8FAFC" : "#1E293B"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('settings', 'Settings')}</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* AI COACH PROFILE */}
          <Text style={styles.sectionTitle}>AI Coach Profile</Text>
          <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
            
            <TouchableOpacity style={styles.row} onPress={() => setGoalModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="body" size={22} color="#0ea5e9" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('primary_goal', 'Primary Goal')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>{t(primaryGoal)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity style={styles.row} onPress={() => setSplitModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="fitness" size={22} color="#f59e0b" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('training_split', 'Training Split')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>{t(trainingSplit)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity style={styles.row} onPress={() => setTimeModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="time" size={22} color="#8B5CF6" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('preferred_time', 'Preferred Time')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>{t(preferredTime)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>
          </View>

          {/* APP PREFERENCES */}
          <Text style={styles.sectionTitle}>{t('app_preferences', 'App Preferences')}</Text>
          <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
            
            <TouchableOpacity style={styles.row} onPress={() => setLangModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="language" size={22} color="#ec4899" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('language', 'Language')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>{i18n.language === 'el' ? 'Ελληνικά' : 'English'}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity style={styles.row} onPress={() => setUnitsModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="speedometer" size={22} color="#14b8a6" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('units', 'Units')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>{units === 'metric' ? t('metric', 'Metric') : t('imperial', 'Imperial')}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity style={styles.row} onPress={() => setThemeModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="color-palette" size={22} color="#8b5cf6" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('theme', 'Theme')}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.valueText}>{t(`theme_${appTheme}`, appTheme)}</Text>
                <Ionicons name="chevron-forward" size={20} color="#64748B" />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="notifications" size={22} color="#4CAF50" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('daily_reminders', 'Daily Reminders')}</Text>
              </View>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#767577", true: "#4CAF50" }}
              />
            </View>
          </View>

          {/* ACCOUNT & DATA */}
          <Text style={styles.sectionTitle}>Account & Data</Text>
          <View style={[styles.card, isDarkMode ? styles.cardDark : styles.cardLight]}>
            
            <TouchableOpacity style={styles.row} onPress={() => setEditWorkoutsModalVisible(true)}>
              <View style={styles.rowLeft}>
                <Ionicons name="list" size={22} color="#f59e0b" style={styles.icon} />
                <Text style={[styles.rowText, isDarkMode ? styles.textLight : styles.textDark]}>{t('edit_workout_list', 'Edit Workout List')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity style={styles.row} onPress={handleLogout}>
              <View style={styles.rowLeft}>
                <Ionicons name="log-out" size={22} color="#ef4444" style={styles.icon} />
                <Text style={[styles.rowText, { color: '#ef4444' }]}>{t('log_out', 'Log Out')}</Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, isDarkMode ? styles.dividerDark : styles.dividerLight]} />

            <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
              <View style={styles.rowLeft}>
                <Ionicons name="trash" size={22} color="#ef4444" style={styles.icon} />
                <Text style={[styles.rowText, { color: '#ef4444', fontWeight: 'bold' }]}>{t('delete_account', 'Delete Account')}</Text>
              </View>
            </TouchableOpacity>

          </View>
          
        </ScrollView>
      </SafeAreaView>

      {/* --- MODALS --- */}
      
      {/* 1. Modal for Edit Workouts */}
      <Modal visible={isEditWorkoutsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('edit_workout_list', 'Edit Workout List')}</Text>
              <TouchableOpacity onPress={() => setEditWorkoutsModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {userProfile?.selectedWorkouts?.length > 0 ? (
                userProfile.selectedWorkouts.map((workout: string, index: number) => (
                  <View key={index} style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight]}>
                    <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark]}>{t(workout)}</Text>
                    <TouchableOpacity onPress={() => handleDeleteWorkout(workout)}>
                      <Ionicons name="trash-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={{color: '#64748B', textAlign: 'center', marginTop: 20}}>{t('no_workouts_selected', 'No workouts selected')}</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. Modal for Units */}
      <Modal visible={isUnitsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('units', 'Units')}</Text>
              <TouchableOpacity onPress={() => setUnitsModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight]} onPress={() => handleSelectUnits('metric')}>
              <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, units === 'metric' && { fontWeight: 'bold', color: isDarkMode ? '#14b8a6' : '#14b8a6' }]}>{t('metric', 'Metric (°C, km/h)')}</Text>
              {units === 'metric' && <Ionicons name="checkmark-circle" size={22} color="#14b8a6" />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight, { borderBottomWidth: 0 }]} onPress={() => handleSelectUnits('imperial')}>
              <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, units === 'imperial' && { fontWeight: 'bold', color: isDarkMode ? '#14b8a6' : '#14b8a6' }]}>{t('imperial', 'Imperial (°F, mph)')}</Text>
              {units === 'imperial' && <Ionicons name="checkmark-circle" size={22} color="#14b8a6" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 3. Modal for Theme */}
      <Modal visible={isThemeModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('theme', 'Theme')}</Text>
              <TouchableOpacity onPress={() => setThemeModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            {['system', 'light', 'dark'].map((themeOption, index) => (
              <TouchableOpacity 
                key={themeOption}
                style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight, index === 2 && { borderBottomWidth: 0 }]} 
                onPress={() => handleSelectTheme(themeOption)}
              >
                <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, appTheme === themeOption && { fontWeight: 'bold', color: isDarkMode ? '#8b5cf6' : '#8b5cf6' }]}>
                  {t(`theme_${themeOption}`)}
                </Text>
                {appTheme === themeOption && <Ionicons name="checkmark-circle" size={22} color="#8b5cf6" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* 4. Τα υπόλοιπα Modals (Goal, Split, Time, Language) μένουν ως είχαν ... */}
      <Modal visible={isGoalModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('primary_goal', 'Primary Goal')}</Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {goalsList.map((goal, index) => (
                <TouchableOpacity key={index} style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight]} onPress={() => handleSelectGoal(goal)}>
                  <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, primaryGoal === goal && { fontWeight: 'bold', color: isDarkMode ? '#0ea5e9' : '#0ea5e9' }]}>{t(goal)}</Text>
                  {primaryGoal === goal && <Ionicons name="checkmark-circle" size={22} color="#0ea5e9" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isSplitModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('training_split', 'Training Split')}</Text>
              <TouchableOpacity onPress={() => setSplitModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {trainingSplitList.map((split, index) => (
                <TouchableOpacity key={index} style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight]} onPress={() => handleSelectSplit(split)}>
                  <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, trainingSplit === split && { fontWeight: 'bold', color: isDarkMode ? '#f59e0b' : '#f59e0b' }]}>{t(split)}</Text>
                  {trainingSplit === split && <Ionicons name="checkmark-circle" size={22} color="#f59e0b" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isTimeModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('preferred_time', 'Preferred Time')}</Text>
              <TouchableOpacity onPress={() => setTimeModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {preferredTimeList.map((time, index) => (
                <TouchableOpacity key={index} style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight]} onPress={() => handleSelectTime(time)}>
                  <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, preferredTime === time && { fontWeight: 'bold', color: isDarkMode ? '#8B5CF6' : '#8B5CF6' }]}>{t(time)}</Text>
                  {preferredTime === time && <Ionicons name="checkmark-circle" size={22} color="#8B5CF6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={isLangModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode ? styles.modalDark : styles.modalLight]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode ? styles.textLight : styles.textDark]}>{t('language', 'Language')}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight]} onPress={() => handleLanguageChange('en')}>
              <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, i18n.language === 'en' && { fontWeight: 'bold', color: isDarkMode ? '#ec4899' : '#ec4899' }]}>English</Text>
              {i18n.language === 'en' && <Ionicons name="checkmark-circle" size={22} color="#ec4899" />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.goalOption, isDarkMode ? styles.goalOptionDark : styles.goalOptionLight, { borderBottomWidth: 0 }]} onPress={() => handleLanguageChange('el')}>
              <Text style={[styles.goalText, isDarkMode ? styles.textLight : styles.textDark, i18n.language === 'el' && { fontWeight: 'bold', color: isDarkMode ? '#ec4899' : '#ec4899' }]}>Ελληνικά</Text>
              {i18n.language === 'el' && <Ionicons name="checkmark-circle" size={22} color="#ec4899" />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  textLight: { color: '#F8FAFC' },
  textDark: { color: '#1E293B' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, marginTop: 25, marginLeft: 5 },
  card: { borderRadius: 16, paddingVertical: 5, paddingHorizontal: 15, borderWidth: 1 },
  cardDark: { backgroundColor: 'rgba(30, 30, 30, 0.6)', borderColor: '#2C2C2C' },
  cardLight: { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1.2, paddingRight: 5 }, 
  icon: { marginRight: 15 },
  rowText: { fontSize: 16, fontWeight: '600', flexShrink: 1 }, 
  rowRight: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end', paddingLeft: 5 }, 
  valueText: { fontSize: 13, color: '#64748B', marginRight: 5, textAlign: 'right', flexShrink: 1 },
  divider: { height: 1, width: '100%' },
  dividerDark: { backgroundColor: '#2C2C2C' },
  dividerLight: { backgroundColor: '#E2E8F0' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40, maxHeight: '80%' },
  modalDark: { backgroundColor: '#1E1E1E' },
  modalLight: { backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  goalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  goalOptionDark: { borderBottomColor: '#2C2C2C' },
  goalOptionLight: { borderBottomColor: '#E2E8F0' },
  goalText: { fontSize: 17 },
});