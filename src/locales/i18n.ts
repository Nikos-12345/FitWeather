import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const resources = {
  en: {
    translation: {
      // Settings Menus
      "settings": "Settings",
      "primary_goal": "Primary Goal",
      "training_split": "Training Split",
      "preferred_time": "Preferred Time",
      "language": "Language",
      "app_preferences": "App Preferences",
      "daily_reminders": "Daily Reminders",
      "units": "Units",
      "metric": "Metric (°C, km/h)",
      "imperial": "Imperial (°F, mph)",
      "theme": "Theme",
      "theme_system": "System Default",
      "theme_light": "Light",
      "theme_dark": "Dark",
      "edit_workout_list": "Edit Workout List",
      "no_workouts_selected": "No workouts selected",
      "log_out": "Log Out",
      "logout_confirm": "Are you sure you want to log out?",
      "delete_account": "Delete Account",
      "delete_account_confirm": "Are you sure you want to delete your account? This action cannot be undone.",
      "cancel": "Cancel",
      "delete": "Delete",

      // Home & Workout Modal
      "log_workout": "Log Workout",
      "record_session": "Record Session",
      "select_category": "1. Select Category",
      "custom_activity": "Custom Activity Name",
      "duration_minutes": "2. Duration (Minutes)",
      "save_workout": "Save Workout",
      "saving": "Saving...",
      "offline_mode": "Offline Mode: Showing last saved weather data",
      "data_error": "Data error. Drag down to refresh.",
      
      // Weather Labels
      "weather_conditions": "Weather Conditions",
      "wind_speed": "Wind Speed",
      "humidity": "Humidity",
      "uv_index": "UV Index",
      
      // OpenWeather API Descriptions
      "clear sky": "Clear Sky",
      "few clouds": "Few Clouds",
      "scattered clouds": "Scattered Clouds",
      "broken clouds": "Broken Clouds",
      "overcast clouds": "Overcast Clouds",
      "shower rain": "Shower Rain",
      "light rain": "Light Rain",
      "moderate rain": "Moderate Rain",
      "rain": "Rain",
      "thunderstorm": "Thunderstorm",
      "snow": "Snow",
      "mist": "Mist",
      
      // Stats Tab
      "weekly_stats": "Weekly Stats",
      "workout_history": "Workout History",
      "total_duration": "Total Duration",
      "minutes": "mins",
      "no_data": "No workouts recorded yet.",
      "loading": "Loading...",
      "keep_grinding": "Keep grinding!",
      "your_progress": "Your Progress",
      "track_grind": "Track your daily grind and volume.",
      "volume_mins": "Volume (Mins)",
      "no_workouts_category": "No workouts logged for this category yet.",
      "workouts_count": "Workouts",
      "total_mins_label": "Total Mins",
      "longest_label": "Longest",
      "mon": "Mon", "tue": "Tue", "wed": "Wed", "thu": "Thu", "fri": "Fri", "sat": "Sat", "sun": "Sun"
    }
  },
  el: {
    translation: {
      // Settings Menus
      "settings": "Ρυθμίσεις",
      "primary_goal": "Βασικός Στόχος",
      "training_split": "Διαχωρισμός Προπονήσεων",
      "preferred_time": "Προτιμώμενη Ώρα",
      "language": "Γλώσσα",
      "app_preferences": "Προτιμήσεις Εφαρμογής",
      "daily_reminders": "Ημερήσιες Υπενθυμίσεις",
      "units": "Μονάδες Μέτρησης",
      "metric": "Μετρικό (°C, km/h)",
      "imperial": "Αυτοκρατορικό (°F, mph)",
      "theme": "Εμφάνιση (Theme)",
      "theme_system": "Προεπιλογή Συστήματος",
      "theme_light": "Φωτεινό",
      "theme_dark": "Σκοτεινό",
      "edit_workout_list": "Λίστα Δραστηριοτήτων",
      "no_workouts_selected": "Δεν υπάρχουν επιλεγμένες δραστηριότητες",
      "log_out": "Αποσύνδεση",
      "logout_confirm": "Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε;",
      "delete_account": "Διαγραφή Λογαριασμού",
      "delete_account_confirm": "Είστε σίγουροι ότι θέλετε να διαγράψετε τον λογαριασμό σας; Αυτή η ενέργεια δεν αναιρείται.",
      "cancel": "Ακύρωση",
      "delete": "Διαγραφή",

      // Home & Workout Modal
      "log_workout": "Καταγραφή Προπόνησης",
      "record_session": "Καταγραφή Συνεδρίας",
      "select_category": "1. Επιλέξτε Κατηγορία",
      "custom_activity": "Όνομα Custom Δραστηριότητας",
      "duration_minutes": "2. Διάρκεια (Λεπτά)",
      "save_workout": "Αποθήκευση Προπόνησης",
      "saving": "Αποθήκευση...",
      "offline_mode": "Λειτουργία Offline: Εμφάνιση τελευταίων δεδομένων καιρού",
      "data_error": "Σφάλμα δεδομένων. Σύρετε για ανανέωση.",
      
      // Weather Labels
      "weather_conditions": "Καιρικές Συνθήκες",
      "wind_speed": "Ταχύτητα Ανέμου",
      "humidity": "Υγρασία",
      "uv_index": "Δείκτης UV",
      
      // OpenWeather API Descriptions
      "clear sky": "Καθαρός Ουρανός",
      "few clouds": "Λίγα Σύννεφα",
      "scattered clouds": "Διάσπαρτα Σύννεφα",
      "broken clouds": "Σύννεφα με Διαστήματα",
      "overcast clouds": "Συννεφιά",
      "shower rain": "Όμβροι Βροχής",
      "light rain": "Ψιχάλα",
      "moderate rain": "Μέτρια Βροχή",
      "rain": "Βροχή",
      "thunderstorm": "Καταιγίδα",
      "snow": "Χιόνι",
      "mist": "Ομίχλη",
      
      // Stats Tab
      "weekly_stats": "Εβδομαδιαία Στατιστικά",
      "workout_history": "Ιστορικό Προπονήσεων",
      "total_duration": "Συνολική Διάρκεια",
      "minutes": "λεπτά",
      "no_data": "Δεν υπάρχουν καταγεγραμμένες προπονήσεις.",
      "loading": "Φόρτωση...",
      "keep_grinding": "Συνέχισε τη σκληρή δουλειά!",
      "your_progress": "Η Πρόοδός Σου",
      "track_grind": "Παρακολούθησε την καθημερινή σου προσπάθεια.",
      "volume_mins": "Όγκος (Λεπτά)",
      "no_workouts_category": "Δεν υπάρχουν προπονήσεις σε αυτή την κατηγορία.",
      "workouts_count": "Προπονήσεις",
      "total_mins_label": "Σύνολο Λεπτών",
      "longest_label": "Μεγαλύτερη",
      "mon": "Δευ", "tue": "Τρι", "wed": "Τετ", "thu": "Πεμ", "fri": "Παρ", "sat": "Σαβ", "sun": "Κυρ",

      // --- ΜΕΤΑΦΡΑΣΕΙΣ ΒΑΣΗΣ ΔΕΔΟΜΕΝΩΝ (Για να δείχνουν ωραία στα UI) ---

      // Στόχοι (Goals)
      "Hypertrophy": "Υπερτροφία",
      "Strength": "Δύναμη",
      "Powerbuilding": "Powerbuilding (Δύναμη & Όγκος)",
      "Lean Bulking": "Καθαρός Όγκος",
      "Weight Loss": "Απώλεια Βάρους",
      "Shredding / Cutting": "Γράμμωση / Cutting",
      "Endurance": "Αντοχή",
      "Functional / CrossFit": "Λειτουργική Προπόνηση / CrossFit",
      "Sport-Specific Prep": "Αθλητική Προετοιμασία",
      "Mobility & Flexibility": "Ευλυγισία & Κινητικότητα",
      "Active Recovery / Deload": "Ενεργητική Αποκατάσταση",
      "Injury Rehab": "Αποκατάσταση Τραυματισμού",
      "General Fitness": "Γενική Φυσική Κατάσταση",

      // Κατηγορίες (Activities)
      "Cardio": "Αερόβια (Cardio)",
      "Weightlifting": "Βάρη",
      "Running": "Τρέξιμο",
      "Cycling": "Ποδηλασία",
      "Swimming": "Κολύμβηση",
      "Yoga": "Γιόγκα",
      "Other": "Άλλο",

      // Training Splits
      "Push": "Push (Στήθος, Ώμοι, Τρικέφαλοι)",
      "Pull": "Pull (Πλάτη, Δικέφαλοι)",
      "Legs": "Legs (Πόδια)",
      "Full Body": "Ολόκληρο Σώμα",
      "Upper/Lower Split": "Άνω/Κάτω Μέρος",
      "Push/Pull/Legs Split": "Push/Pull/Legs",
      "Body Part Split": "Bro Split (1 ομάδα/μέρα)",
      "Hybrid Split": "Υβριδικό",

      // Preferred Times
      "Morning": "Πρωί",
      "Afternoon": "Απόγευμα",
      "Evening": "Νωρίς το Βράδυ",
      "Night": "Βράδυ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    compatibilityJSON: 'v4',
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const loadSavedLanguage = async () => {
  try {
    const savedLang = await AsyncStorage.getItem('@app_language');
    if (savedLang) {
      i18n.changeLanguage(savedLang);
    }
  } catch (error) {
    console.error("Error loading language", error);
  }
};

export default i18n;