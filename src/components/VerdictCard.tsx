import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { GlassCard } from './GlassCard';

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
    >
      <GlassCard 
        isDarkMode={isDarkMode} 
        style={{ borderColor: verdict.color, borderWidth: 1.5 }}
      >
        <View style={styles.innerContainer}>
          {/* Icon Circle with dynamic transparent background */}
          <View style={[
            styles.iconCircle, 
            isDarkMode && styles.iconCircleDark, 
            { backgroundColor: `${verdict.color}20` } // 💡 Fixed to backticks for proper hex alpha opacity
          ]}>
            <Ionicons name={verdict.icon as any} size={40} color={verdict.color}/>
          </View>
          
          {/* Title */}
          <Text style={[styles.verdictTitle, isDarkMode && styles.textSecondaryDark]}>
            {verdict.title}
          </Text>
          
          {/* AI Coach Message */}
          <Text style={[styles.verdictText, isDarkMode && styles.textPrimaryDark]}>
            {verdict.message}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>       
  );
};

const styles = StyleSheet.create({
  innerContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15 
  },
  iconCircleDark: { 
    backgroundColor: '#334155' 
  },
  verdictTitle: { 
    color: '#64748B', 
    fontSize: 14, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 8 
  },
  verdictText: { 
    color: '#0F172A', 
    fontSize: 21, 
    fontWeight: '800', 
    textAlign: 'center', 
    lineHeight: 24 
  },
  textPrimaryDark: { 
    color: '#F8FAFC' 
  },
  textSecondaryDark: { 
    color: '#94A3B8' 
  },
});