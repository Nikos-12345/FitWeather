import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
    children: React.ReactNode;
    isDarkMode: boolean;
    style?: ViewStyle;
}

export function GlassCard({ children, isDarkMode, style }: GlassCardProps) {
    return (
        <View style={[styles.cardContainer, style]}>
            <BlurView
                intensity={Platform.OS === 'ios' ? 40 : 60}
                tint={isDarkMode ? 'dark' : 'light'}
                style={styles.blurWrapper}
            >
                <View style={[
                    styles.content, 
                    isDarkMode ? styles.contentDark : styles.contentLight
                ]}>
                    {children}
                </View>
            </BlurView>
        </View>
    );
}


const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blurWrapper: {
    width: '100%',
  },
  content: {
    padding: 20,
    borderWidth: 1,
  },
  contentLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)', 
    borderColor: 'rgba(255, 255, 255, 0.5)',     
  },
  contentDark: {
    backgroundColor: 'rgba(15, 23, 42, 0.35)',  
    borderColor: 'rgba(255, 255, 255, 0.08)',    
  },
});