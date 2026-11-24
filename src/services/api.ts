import { API_BASE_URL } from '../config/api';
import { getToken } from './authStorage';

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
): Promise<T> {
    // Use the explicitly supplied token, or retrieve the saved token.
    const authToken = token ?? await getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(authToken
                ? { Authorization: `Bearer ${authToken}` }
                : {}),
            ...options.headers,
        },
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const responseText = await response.text();

    let data: any = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error('The server returned an invalid response.');
    }

    if (!response.ok) {
        throw new ApiError(
            data.message || 'Something went wrong.',
            response.status,
        );
    }

    return data as T;
}

export async function apiUpload<T>(
    endpoint: string,
    formData: FormData,
    token?: string,
): Promise<T> {
    const authToken = token ?? await getToken();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            ...(authToken
                ? { Authorization: `Bearer ${authToken}` }
                : {}),
            // Don't set Content-Type here.
            // fetch will add multipart/form-data with its boundary.
        },
        body: formData,
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const responseText = await response.text();
    let data: any = {};

    try {
        data = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error('The server returned an invalid response.');
    }

    if (!response.ok) {
        throw new ApiError(
            data.message || 'Something went wrong.',
            response.status,
        );
    }

    return data as T;
}
