import { PermissionsAndroid, Platform, TurboModuleRegistry } from 'react-native';

import { apiRequest } from './api';
import { getToken as getAuthToken } from './authStorage';

function loadMessaging() {
    if (
        !TurboModuleRegistry.get('NativeRNFBTurboApp') ||
        !TurboModuleRegistry.get('NativeRNFBTurboMessaging')
    ) {
        throw new Error('Firebase native modules are missing. Rebuild and reinstall the app to enable push notifications.');
    }

    // Loading Firebase evaluates its native modules immediately.
    return require('@react-native-firebase/messaging') as typeof import('@react-native-firebase/messaging');
}

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
        const { getMessaging, getToken } = loadMessaging();

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
        console.warn('Failed to get FCM device token:', error);
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

export function listenForFcmTokenRefresh(): (() => void) | undefined {
    try {
        const { getMessaging, onTokenRefresh } = loadMessaging();

        return onTokenRefresh(getMessaging(), async (newToken) => {
            try {
                await saveFcmTokenToBackend(newToken);
                console.log('FCM token refreshed and registered.');
            } catch (error) {
                console.warn('FCM token refresh registration failed:', error);
            }
        });
    } catch (error) {
        console.warn('Could not start the FCM token refresh listener:', error);
        return undefined;
    }
}
