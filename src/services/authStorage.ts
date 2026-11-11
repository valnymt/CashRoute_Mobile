
import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'com.cashroute.mobile.auth';

export async function saveToken(token: string): Promise<void> {
    await Keychain.setGenericPassword('cashroute-user', token, {
        service: TOKEN_SERVICE,
    });
}

export async function getToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
        service: TOKEN_SERVICE,
    });

    return credentials ? credentials.password : null;
}

export async function removeToken(): Promise<void> {
    await Keychain.resetGenericPassword({
        service: TOKEN_SERVICE,
    });
}
