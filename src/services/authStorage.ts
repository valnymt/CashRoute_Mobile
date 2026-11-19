import * as Keychain from 'react-native-keychain';

const TOKEN_SERVICE = 'com.cashroute.mobile.auth';
const PROFILE_SERVICE = 'com.cashroute.mobile.profile';

export type UserProfile = Record<string, unknown>;

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

// Save logged-in user profile
export async function saveUser(user: UserProfile): Promise<void> {
    await Keychain.setGenericPassword(
        'cashroute-user',
        JSON.stringify(user),
        {
            service: PROFILE_SERVICE,
        },
    );
}

// Retrieve logged-in user profile
export async function getUser(): Promise<UserProfile | null> {
    const credentials = await Keychain.getGenericPassword({
        service: PROFILE_SERVICE,
    });

    if (!credentials) {
        return null;
    }

    try {
        return JSON.parse(credentials.password) as UserProfile;
    } catch {
        return null;
    }
}

// Remove logged-in user profile
export async function removeUser(): Promise<void> {
    await Keychain.resetGenericPassword({
        service: PROFILE_SERVICE,
    });
}

// Remove all authentication data during logout
export async function removeAuthData(): Promise<void> {
    await Promise.all([
        removeToken(),
        removeUser(),
    ]);
}