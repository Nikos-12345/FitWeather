import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { fetchWeeklyStats } from '../utils/dbService';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const currentHour = new Date().getHours();
  const isDarkMode = currentHour >= 19 || currentHour < 7;

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [stats, setStats] = useState({ totalMins: 0, longest: 0, workoutCount: 0 });
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          if (parsed.selectedWorkouts && parsed.selectedWorkouts.length > 0) {
            setCategories(parsed.selectedWorkouts);
            setSelectedCategory(parsed.selectedWorkouts[0]);
          }
      }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (!selectedCategory) return ;
        setIsLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const result = await fetchWeeklyStats(user.uid, selectedCategory);
          if (result) {
            setChartData(result.weeklyData);
            setStats({
              totalMins: result.totalMins,
              longest: result.longest,
              workoutCount: result.workoutCount
            });
          }
        }
        setIsLoading(false);
      };

      loadData();
    }, [selectedCategory])
  );

  if (categories.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={isDarkMode ? "#4CAF50" : "#0ea5e9"} />
      </View>
    );
  }

  const realChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: chartData,
        color: (opacity = 1) => isDarkMode ? `rgba(76, 175, 80, ${opacity})` : `rgba(14, 165, 233, ${opacity})`, 
        strokeWidth: 3, 
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#1e1b4b' : '#f8fafc',
    backgroundGradientTo: isDarkMode ? '#020617' : '#e0f2fe',
    color: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(30, 41, 59, ${opacity})`,
    labelColor: (opacity = 1) => isDarkMode ? `rgba(160, 160, 160, ${opacity})` : `rgba(100, 116, 139, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: isDarkMode ? '#4CAF50' : '#0ea5e9',
    },
  };

  const backgroundColors: [string, string, string] = isDarkMode 
    ? ['#0f172a', '#1e1b4b', '#020617'] 
    : ['#e0f2fe', '#f8fafc', '#fae8ff'];

  return (
    <LinearGradient colors={backgroundColors} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={[styles.title, isDarkMode ? styles.textLight : styles.textDark]}>Your Progress</Text>
          <Text style={styles.subtitle}>Track your daily grind and volume.</Text>

          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={`${cat}-${index}`}
                  style={[
                    styles.filterChip, 
                    isDarkMode ? styles.filterChipDark : styles.filterChipLight,
                    selectedCategory === cat && (isDarkMode ? styles.activeFilterChipDark : styles.activeFilterChipLight)
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterText, 
                    selectedCategory === cat && styles.activeFilterText
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {isloading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDarkMode ? "#4CAF50" : "#0ea5e9"} />
            </View>
          ) : (
            <>
            <View style={[styles.chartCard, isDarkMode ? styles.cardDark : styles.cardLight]}>
              <Text style={[styles.chartTitle, isDarkMode ? styles.textLight : styles.textDark]}>
                {selectedCategory} Volume (Mins)
              </Text>
              {Math.max(...chartData) === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No workouts logged for this category yet.</Text>
                </View>
              ) : (
                <LineChart
                  data={realChartData}
                  width={screenWidth - 70}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chartStyle}
                />
              )}
            </View>

            <View style={styles.summaryContainer}>
              <View style={[styles.statBox, isDarkMode ? styles.cardDark : styles.cardLight]}>
                <Text style={[styles.statValue, isDarkMode ? styles.valueDark : styles.valueLight]}>{stats.workoutCount}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={[styles.statBox, isDarkMode ? styles.cardDark : styles.cardLight]}>
                <Text style={[styles.statValue, isDarkMode ? styles.valueDark : styles.valueLight]}>{stats.totalMins}m</Text>
                <Text style={styles.statLabel}>Total Mins</Text>
              </View>
              <View style={[styles.statBox, isDarkMode ? styles.cardDark : styles.cardLight]}>
                <Text style={[styles.statValue, isDarkMode ? styles.valueDark : styles.valueLight]}>{stats.longest}m</Text>
                <Text style={styles.statLabel}>Longest</Text>
              </View>
            </View>
            </>
          )}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  title: { fontSize: 32, fontWeight: '900', marginBottom: 5, marginTop: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: '#64748B', marginBottom: 25, fontWeight: '500' },
  textLight: { color: '#F8FAFC' },
  textDark: { color: '#1E293B' },

  filterContainer: { marginBottom: 25 },
  filterChip: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, marginRight: 10, borderWidth: 1 },
  filterChipDark: { backgroundColor: '#1E1E1E', borderColor: '#333333' },
  filterChipLight: { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' },
  activeFilterChipDark: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  activeFilterChipLight: { backgroundColor: '#0ea5e9', borderColor: '#0ea5e9' },
  filterText: { color: '#94A3B8', fontSize: 15, fontWeight: 'bold' },
  activeFilterText: { color: '#FFFFFF' },

  chartCard: { borderRadius: 16, padding: 15, marginBottom: 25, borderWidth: 1, alignItems: 'center' },
  cardDark: { backgroundColor: 'rgba(30, 30, 30, 0.5)', borderColor: '#2C2C2C' },
  cardLight: { backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: '#E2E8F0' },
  chartTitle: { fontSize: 17, fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: 15, marginLeft: 5 },
  chartStyle: { borderRadius: 16 },

  summaryContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  statBox: { flex: 1, padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
  statValue: { fontSize: 26, fontWeight: '900', marginBottom: 5 },
  valueDark: { color: '#4CAF50' },
  valueLight: { color: '#0ea5e9' },
  statLabel: { color: '#64748B', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 'bold' },
  loadingContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50},
  emptyStateText: { color: '#64748b', fontSize: 14, fontStyle: 'italic' },
});