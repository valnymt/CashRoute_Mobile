import { PermissionsAndroid, Platform } from 'react-native';
import {
    getMessaging,
    getToken,
    onTokenRefresh,
} from '@react-native-firebase/messaging';

import { apiRequest } from './api';
import { getToken as getAuthToken } from './authStorage';

async function saveFcmTokenToBackend(fcmToken: string): Promise<void> {
    const authToken = await getAuthToken();

    if (!authToken) {
        console.log('No authentication token. Skipping FCM registration.');
        return;
    }

    await apiRequest('/device-tokens', {
        method: 'POST',
        body: JSON.stringify({
            token: fcmToken,
            platform: Platform.OS,
        }),
    }, authToken);
}

export async function getFcmDeviceToken(): Promise<string | null> {
    try {
        if (Platform.OS === 'android' && Number(Platform.Version) >= 33) {
            const permission = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );

            if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Notification permission was not granted.');
                return null;
            }
        }

        const messaging = getMessaging();
        const token = await getToken(messaging);

        console.log('FCM token retrieval successful:', !!token);

        return token;
    } catch (error) {
        console.error('Failed to get FCM device token:', error);
        return null;
    }
}

export async function registerFcmToken(): Promise<void> {
    try {
        const fcmToken = await getFcmDeviceToken();

        if (!fcmToken) {
            return;
        }

        await saveFcmTokenToBackend(fcmToken);

        console.log('FCM device registered with Laravel successfully.');
    } catch (error) {
        console.error('FCM device registration failed:', error);
    }
}

export function listenForFcmTokenRefresh() {
    const messaging = getMessaging();

    return onTokenRefresh(messaging, async (newToken) => {
        console.log('FCM token refresh event received.');

        try {
            await saveFcmTokenToBackend(newToken);
            console.log('FCM token refreshed and registered.');
        } catch (error) {
            console.error('FCM token refresh registration failed:', error);
        }
    });
}