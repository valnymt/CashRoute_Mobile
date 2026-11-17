
import { apiRequest } from './api';

export interface DeviceTokenResponse {
    message: string;
    device: {
        id: number;
        platform: string;
    };
}

export async function registerDeviceToken(
    fcmToken: string,
    authToken: string,
): Promise<DeviceTokenResponse> {
    return apiRequest<DeviceTokenResponse>(
        '/device-tokens',
        {
            method: 'POST',
            body: JSON.stringify({
                token: fcmToken,
                platform: 'android',
            }),
        },
        authToken,
    );
}

export async function unregisterDeviceToken(
    deviceId: number,
    authToken: string,
): Promise<void> {
    return apiRequest<void>(
        `/device-tokens/${deviceId}`,
        {
            method: 'DELETE',
        },
        authToken,
    );
}
