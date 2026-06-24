import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRestDayRecommendation } from '../utils/workoutLogic';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RestDayCardProps {
    forecast: any[] | null;
    isDarkMode: boolean;
}

export const RestdayCard = ({ forecast, isDarkMode }: RestDayCardProps) => {
    // if for some reason we don't have forecast data, we don't show the RestDay card
    if (!forecast || forecast.length === 0) return null;

    const recommendation = getRestDayRecommendation(forecast);

    return (
        <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
            style={[styles.card, isDarkMode && styles.cardDark]}
        >

        
            <View style={styles.headerRow}>
                <View style={styles.iconWrapper}>
                    <Ionicons name="battery-charging" size={20} color="#8b5cf6"/>
                </View>
                <Text style={[styles.title, isDarkMode && styles.textPrimaryDark]}>Smart Rest Day</Text>
            </View>

            <View style={styles.contentRow}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{recommendation.day}</Text>
                </View>
                <Text style={[styles.reasonText, isDarkMode && styles.textSecondaryDark]}>{recommendation.reason}</Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create ({
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#94a3b8', shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  cardDark: { backgroundColor: '#1E293B', shadowColor: '#000000', shadowOpacity: 0.3 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconWrapper: { backgroundColor: '#EDE9FE', padding: 8, borderRadius: 12, marginRight: 10 },
  title: { fontSize: 18, fontWeight: '800', color: '#1E293B' },
  contentRow: { flexDirection: 'row', alignItems: 'center' },
  dateBadge: { backgroundColor: '#8B5CF6', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 16, marginRight: 15 },
  dateText: { color: '#ffffff', fontWeight: '900', fontSize: 16 },
  reasonText: { flex: 1, fontSize: 14, color: '#64748B', lineHeight: 20, fontWeight: '500' },
  textPrimaryDark: { color: '#F8FAFC' },
  textSecondaryDark: { color: '#94A3B8' }
})