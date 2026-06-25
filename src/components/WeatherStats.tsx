import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard'; 

interface WeatherStatsProps {
    temperature: number;
    description: string;
    windSpeedKmH: number;
    humidity: number;
    isDarkMode: boolean;
}

export const WetaherStats = ({ temperature, description, windSpeedKmH, humidity, isDarkMode }: WeatherStatsProps) => {
    return (
        <View>
          {/* Main Live Weather Card */}
          <GlassCard isDarkMode={isDarkMode}>
            <View style={styles.mainWeatherCardInner}>
              <Ionicons 
                name={isDarkMode ? "moon" : "partly-sunny"} 
                size={50} 
                color={isDarkMode ? "#818CF8" : "#f59e0b"} 
              />
              <View style={styles.mainWeatherTextWrapper}> 
                <Text style={[styles.mainTemperature, isDarkMode && styles.textPrimaryDark]}>
                  {Math.round(temperature)}°C
                </Text>
                <Text style={[styles.mainCondition, isDarkMode && styles.textSecondaryDark]}>
                  {description}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Section Title */}
          <Text style={[styles.sectionTitle, isDarkMode && styles.textPrimaryDark]}>
            Weather conditions
          </Text>
        
          {/* Grid Row: UV Index & Wind Speed */}
          <View style={styles.row}>
            {/* UV Index Card */}
            <GlassCard isDarkMode={isDarkMode} style={{ flex: 1 }}>
              <View style={styles.smallCardInner}>
                <Ionicons name="sunny-outline" size={24} color="#8B5CF6" />
                <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>UV Index</Text>
                <Text style={[styles.statValue, isDarkMode && styles.textPrimaryDark]}>-</Text>
              </View>
            </GlassCard>
        
            {/* Wind Speed Card */}
            <GlassCard isDarkMode={isDarkMode} style={{ flex: 1 }}>
              <View style={styles.smallCardInner}>
                <Ionicons name="speedometer-outline" size={24} color="#0ea5e9" />
                <Text style={[styles.statLabel, isDarkMode && styles.textSecondaryDark]}>Wind Speed</Text>
                <Text style={[styles.statValue, isDarkMode && styles.textPrimaryDark]}>
                  {windSpeedKmH} <Text style={styles.unitText}>Km/h</Text>
                </Text>
              </View>
            </GlassCard>
          </View>
        
          {/* Humidity Wide Card */}
          <GlassCard isDarkMode={isDarkMode}>
            <View style={styles.wideCardInner}>
              <View style={styles.wideCardLeft}>
                <Ionicons name="water-outline" size={24} color="#10b981" />
                <Text style={[styles.wideCardLabel, isDarkMode && styles.textSecondaryDark]}>Humidity</Text>
              </View>
              <Text style={[styles.statValue, isDarkMode && styles.textPrimaryDark]}>
                {humidity}%
              </Text>
            </View>
          </GlassCard>
        </View>
    );
};

const styles = StyleSheet.create({
  mainWeatherCardInner: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  mainWeatherTextWrapper: { 
    marginLeft: 20 
  },
  mainTemperature: { 
    color: '#1E293B', 
    fontSize: 32, 
    fontWeight: 'bold' 
  },
  mainCondition: { 
    color: '#64748B', 
    fontSize: 18, 
    marginTop: 2,
    textTransform: 'capitalize'
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#1E293B', 
    marginBottom: 15, 
    paddingLeft: 5,
    marginTop: 10
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 15,
    marginBottom: 4 
  },
  smallCardInner: { 
    alignItems: 'center', 
    paddingVertical: 8 
  },
  wideCardInner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 5 
  },
  wideCardLeft: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  wideCardLabel: { 
    color: '#64748b', 
    fontSize: 14, 
    fontWeight: '600', 
    marginLeft: 10 
  },
  statLabel: { 
    color: '#64748b', 
    fontSize: 13, 
    marginTop: 8, 
    marginBottom: 4, 
    fontWeight: '600' 
  },
  statValue: { 
    color: '#0f172a', 
    fontSize: 16, 
    fontWeight: '800' 
  },
  unitText: { 
    fontSize: 14, 
    color: '#94a3b8', 
    fontWeight: '600' 
  },
  textPrimaryDark: { 
    color: '#F8FAFC' 
  },
  textSecondaryDark: { 
    color: '#94A3B8' 
  }
});