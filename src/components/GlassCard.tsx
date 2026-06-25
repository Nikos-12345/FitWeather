import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  style?: ViewStyle;
}

export function GlassCard({ children, isDarkMode, style }: GlassCardProps) {
  return (
    <View style={[
      styles.card, 
      isDarkMode ? styles.cardDark : styles.cardLight, 
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardLight: {
    backgroundColor: '#ffffff',
    shadowColor: '#94a3b8',
  },
  cardDark: {
    backgroundColor: '#1e293b',
    shadowColor: '#000000',
  },
});