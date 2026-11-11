import { apiRequest } from './api';

export interface AuthResponse {
    token: string;
    user: Record<string, unknown>;
}

export async function login(
    username: string,
    password: string,
): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/token', {
        method: 'POST',
        body: JSON.stringify({
            username,
            password,
            device_name: 'CashRoute Android',
        }),
    });
}
