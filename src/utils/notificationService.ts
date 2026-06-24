import * as  Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getRestDayRecommendation } from './workoutLogic';
import { NotificationFeedbackType } from 'expo-haptics';

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#8b5cf6',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications. requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Permission for notifications was denied');
        return false;
    }
    return true;
}

export async function scheduleDailyWeatherCheck(forecastData: any[]) {
    if (!forecastData || forecastData.length === 0) return;

    // We delete the older notifications, because they will dublicate
    await Notifications.cancelAllScheduledNotificationsAsync();

    const recommendation = getRestDayRecommendation(forecastData);

    let title = "FitWeather: Ready to workout?";
    let body = "Th weather conditions tommorow will be perfect!";

    if (recommendation.reason.includes('recovery')) {
        title = "FitWeather: Take your rest day!";
        body = "Hard weather conditions are being expected tommorow. Better for you to relax!";
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            title: title,
            body: body,
            sound: true,
            priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: 21,
            minute: 0,
        },
    });

    console.log("Smart notification scheduled successfully for 21:00 daily!");
}