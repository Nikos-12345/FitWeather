import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getRestDayRecommendation } from '../utils/workoutLogic';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

interface RestDayCardProps {
    forecast: any[] | null;
    isDarkMode: boolean;
}

export const RestdayCard = ({ forecast, isDarkMode }: RestDayCardProps) => {
    // If for some reason we don't have forecast data, we don't show the RestDay card
    if (!forecast || forecast.length === 0) return null;

    const recommendation = getRestDayRecommendation(forecast);

    return (
        <Animated.View
            entering={FadeInDown.delay(300).duration(600).springify()}
        >
            <GlassCard isDarkMode={isDarkMode}>
                {/* Header Row */}
                <View style={styles.headerRow}>
                    <View style={[
                        styles.iconWrapper, 
                        isDarkMode && styles.iconWrapperDark
                    ]}>
                        <Ionicons name="battery-charging" size={20} color="#8b5cf6"/>
                    </View>
                    <Text style={[styles.title, isDarkMode && styles.textPrimaryDark]}>
                        Smart Rest Day
                    </Text>
                </View>

                {/* Content Row */}
                <View style={styles.contentRow}>
                    <View style={styles.dateBadge}>
                        <Text style={styles.dateText}>{recommendation.day}</Text>
                    </View>
                    <Text style={[styles.reasonText, isDarkMode && styles.textSecondaryDark]}>
                        {recommendation.reason}
                    </Text>
                </View>
            </GlassCard>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    headerRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 20 
    },
    iconWrapper: { 
        backgroundColor: '#EDE9FE', 
        padding: 8, 
        borderRadius: 12, 
        marginRight: 10 
    },
    iconWrapperDark: { 
        backgroundColor: 'rgba(139, 92, 246, 0.15)' 
    },
    title: { 
        fontSize: 18, 
        fontWeight: '800', 
        color: '#1E293B' 
    },
    contentRow: { 
        flexDirection: 'row', 
        alignItems: 'flex-start',
        gap: 12 
    },
    dateBadge: { 
        backgroundColor: '#8B5CF6', 
        paddingVertical: 6, 
        paddingHorizontal: 12, 
        borderRadius: 12, 
    },
    dateText: { 
        color: '#ffffff', 
        fontWeight: '900', 
        fontSize: 14 
    },
    reasonText: { 
        flex: 1, 
        fontSize: 14, 
        color: '#64748B', 
        lineHeight: 20, 
        fontWeight: '500' 
    },
    textPrimaryDark: { 
        color: '#F8FAFC' 
    },
    textSecondaryDark: { 
        color: '#94A3B8' 
    }
});