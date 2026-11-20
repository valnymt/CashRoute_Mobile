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
        const { getMessaging, getToken, requestPermission, AuthorizationStatus } = loadMessaging();

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
        if (Platform.OS === 'ios') {
            const status = await requestPermission(messaging);
            if (status !== AuthorizationStatus.AUTHORIZED && status !== AuthorizationStatus.PROVISIONAL) return null;
        }
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

export function listenForDeliveryNotifications(
    onReceived: (id: string) => void,
    onOpened: (id: string) => void,
): (() => void) | undefined {
    try {
        const { getMessaging, onMessage, onNotificationOpenedApp, getInitialNotification } = loadMessaging();
        const messaging = getMessaging();
        let active = true;
        const notify = (callback: (id: string) => void, id: unknown) => {
            if (active && typeof id === 'string' && /^N-[0-9]+$/.test(id)) callback(id);
        };
        const unsubscribeMessage = onMessage(messaging, message => notify(onReceived, message.data?.notificationId));
        const unsubscribeOpened = onNotificationOpenedApp(messaging, message => notify(onOpened, message.data?.notificationId));
        void getInitialNotification(messaging)
            .then(message => notify(onOpened, message?.data?.notificationId))
            .catch(() => {});
        return () => {
            active = false;
            unsubscribeMessage();
            unsubscribeOpened();
        };
    } catch {
        // The API inbox remains available when Firebase is unavailable.
        return undefined;
    }
}

export async function unregisterFcmToken(): Promise<void> {
    try {
        const { getMessaging, getToken, deleteToken } = loadMessaging();
        const messaging = getMessaging();
        const token = await getToken(messaging);
        try {
            const authToken = await getAuthToken();
            if (authToken) {
                await apiRequest('/device-tokens/current', {
                    method: 'DELETE',
                    body: JSON.stringify({ token }),
                }, authToken);
            }
        } finally {
            await deleteToken(messaging);
        }
    } catch {
        // Local logout must work even when the network or Firebase is unavailable.
    }
}
