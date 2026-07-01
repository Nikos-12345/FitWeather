import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface VerdictCardProps {
  verdict: {
    title: string;
    message: string;
    icon: string;
    color: string;
  };
  isDarkMode: boolean;
}

export const VerdictCard = ({ verdict, isDarkMode }: VerdictCardProps) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(100).duration(600).springify()}
      style={[styles.card, isDarkMode && styles.cardDark, { borderColor: verdict.color, borderWidth: 2 }]}
    >
      <View style={[styles.iconCircle, isDarkMode && styles.iconCircleDark, { backgroundColor: `${verdict.color}20` }]}>
        <Ionicons name={verdict.icon as any} size={40} color={verdict.color}/>
      </View>
      <Text style={[styles.verdictTitle, isDarkMode && styles.textSecondaryDark]}>{verdict.title}</Text>
      <Text style={[styles.verdictText, isDarkMode && styles.textPrimaryDark]}>{verdict.message}</Text>
    </Animated.View>       
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#ffffff', borderRadius: 24, padding: 20, marginBottom: 20, shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  cardDark: { backgroundColor: '#1e293b', shadowColor: '#000000', shadowOpacity: 0.3 },
  iconCircle: { backgroundColor: '#dfeaeb', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  iconCircleDark: { backgroundColor: '#334155' },
  verdictTitle: { color: '#64748B', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
  verdictText: { color: '#0F172A', fontSize: 22, fontWeight: '800', textAlign: 'center', lineHeight: 30 },
  textPrimaryDark: { color: '#F8FAFC' },
  textSecondaryDark: { color: '#94A3B8' },
});