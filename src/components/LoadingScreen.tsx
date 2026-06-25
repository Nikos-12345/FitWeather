import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; 

export const LoadingScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const pulseAnimation = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnimation, { toValue: 0.6, duration: 800, useNativeDriver: true }),
                Animated.timing(pulseAnimation, { toValue: 0.3, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const baseColor = isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.45)';
    
    const backgroundColors: [string, string, string] = isDarkMode 
      ? ['#0f172a', '#1e1b4b', '#020617']  
      : ['#e0f2fe', '#f8fafc', '#fae8ff'];

    return (
        <LinearGradient colors={backgroundColors} style={styles.container}>
            {/* Header Skeleton */}
            <Animated.View style={[styles.skeletonTitle, { backgroundColor: baseColor, opacity: pulseAnimation }]}/>
            <Animated.View style={[styles.skeletonSubtitle, { backgroundColor: baseColor, opacity: pulseAnimation }]}/>

            {/* Verdict Card Skeleton */}
            <Animated.View style={[styles.skeletonVerdict, { backgroundColor: baseColor, opacity: pulseAnimation }]}/>

            {/* Main Weather Skeleton */}
            <Animated.View style={[styles.skeletonWeather, { backgroundColor: baseColor, opacity: pulseAnimation }]}/>

            {/* Stats Grid skeleton */}
            <View style={styles.row}>
                <Animated.View style={[styles.skeletonSmall, { backgroundColor: baseColor, opacity: pulseAnimation }]}/>
                <Animated.View style={[styles.skeletonSmall, { backgroundColor: baseColor, opacity: pulseAnimation }]}/>    
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    paddingTop: 60 
  },
  skeletonTitle: { 
    width: 150, 
    height: 40, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  skeletonSubtitle: { 
    width: 100, 
    height: 20, 
    borderRadius: 8, 
    marginBottom: 40 
  },
  skeletonVerdict: { 
    width: '100%', 
    height: 160, 
    borderRadius: 24, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)' 
  },
  skeletonWeather: { 
    width: '100%', 
    height: 100, 
    borderRadius: 24, 
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    gap: 15 
  },
  skeletonSmall: { 
    flex: 1, 
    height: 120, 
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  }
});