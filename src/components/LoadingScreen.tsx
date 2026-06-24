import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const LoadingScreen = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const pulseAnimation = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop (
            Animated.sequence([
                Animated.timing(pulseAnimation, { toValue: 0.7, duration: 800, useNativeDriver:true }),
                Animated.timing(pulseAnimation, { toValue: 0.3, duration: 800, useNativeDriver:true })
            ])
        ).start();
    }, []);

    const baseColor = isDarkMode ? '#1e293b' : '#e2e8f0'

    return (
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            {/* Header Skeleton */}
            <Animated.View style={[styles.skeletonTitle, {backgroundColor: baseColor, opacity: pulseAnimation }]}/>
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
        </View>
    );
};

const styles = StyleSheet.create ({
  container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#f4f7fb' },
  containerDark: { backgroundColor: '#0f172a' },
  skeletonTitle: { width: 150, height: 40, borderRadius: 8, marginBottom: 10 },
  skeletonSubtitle: { width: 100, height: 20, borderRadius: 8, marginBottom:40 },
  skeletonVerdict: { width: '100%', height: 160, borderRadius: 24, marginBottom: 20 },
  skeletonWeather: { width: '100%', height: 100, borderRadius: 24, marginBottom:40 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  skeletonSmall: { flex: 1, height: 120, borderRadius: 24 }
})