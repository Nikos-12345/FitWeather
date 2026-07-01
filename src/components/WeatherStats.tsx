import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface WeatherStatsProps {
  temperature: number;
  description: string;
  windSpeedKmH: number;
  humidity: number;
  isDarkMode: boolean;
}

export const WeatherStats = ({ temperature, description, windSpeedKmH, humidity, isDarkMode }: WeatherStatsProps) => {
  const { t } = useTranslation();

  return (
    <View>
      {/* Live Weather Details section*/}
      <View style={[styles.card, isDarkMode && styles.cardDark, styles.mainWeatherCard]}>
        <Ionicons name={isDarkMode ? "moon" : "partly-sunny"} size={50} color={isDarkMode ? "#818CF8" : "#f59e0b"} />
        <View style={styles.mainWeatherTextWrapper}> 
          <Text style={[styles.mainTemperature, isDarkMode && styles.textPrimaryDark]}>{Math.round(temperature)}°C</Text>
          <Text style={[styles.mainCondition, isDarkMode && styles.textSecondaryDark]}>{description}</Text>
        </View>
      </View>

      {/* Additional Live Weather Details */}
      <Text style={[styles.sectionTitle, isDarkMode && styles.textPrimaryDark]}>{t('weather_conditions')}</Text>
    
      <View style={styles.row}>
        {/* UV Index */}
        <View style={[styles.card, isDarkMode && styles.cardDark, styles.smallCard]}>
          <Ionicons name="sunny-outline" size={24} color="#8B5CF6" />
          <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>{t('uv_index')}</Text>
          <Text style={[styles.statValue, isDarkMode && styles.textPrimaryDark]}>-</Text>
        </View>
    
        {/* Wind Speed */}
        <View style={[styles.card, isDarkMode && styles.cardDark, styles.smallCard]}>
          <Ionicons name="speedometer-outline" size={24} color="#0ea5e9" />
          <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>{t('wind_speed')}</Text>
          <Text style={[styles.statValue, isDarkMode && styles.textPrimaryDark]}>{windSpeedKmH} <Text style={styles.unitText}>Km/h</Text></Text>
        </View>
      </View>
    
      {/* Humidity */}
      <View style={[styles.card, isDarkMode && styles.cardDark, styles.wideCard]}> 
        <View style={styles.wideCardLeft}>
          <Ionicons name="water-outline" size={24} color="#10b981" />
          <Text style={[styles.wideCardLabel, isDarkMode && styles.textSecondaryDark]}>{t('humidity')}</Text>
        </View>
        <Text style={[styles.statValue, isDarkMode && styles.textPrimaryDark]}>{humidity}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  cardDark: { backgroundColor: '#1e293b', shadowColor: '#000000', shadowOpacity: 0.3 },
  mainWeatherCard: { flexDirection: 'row', alignItems: 'center' },
  mainWeatherTextWrapper: { marginLeft: 20 },
  quickWeatherTextWrapperCard: { alignItems: 'center' },
  mainTemperature: { color: '#0F172A', fontSize: 30, fontWeight: 'bold' },
  mainCondition: { color: '#64748B', fontSize: 18, marginTop: 0 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15, paddingLeft: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  smallCard: { flex: 1, alignItems: 'center', paddingVertical: 25 },
  wideCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 30 },
  wideCardLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginLeft: 10 },
  wideCardLeft: { flexDirection: 'row', alignItems: 'center' },
  statLabel: { color: '#64748b', fontSize: 12, marginTop: 8, marginBottom: 4, fontWeight: '600' },
  statValue: { color: '#0f172a', fontSize: 14, fontWeight: '800' },
  unitText: { fontSize: 16, color: '#94a3b8', fontWeight: '600' },
  textPrimaryDark: { color: '#F8FAFC' },
  textSecondaryDark: { color: '#94A3B8' }
});