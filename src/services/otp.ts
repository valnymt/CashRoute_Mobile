import { apiRequest } from './api';
import { getToken } from './authStorage';

export type OtpStage = 'pickup' | 'dropoff';

export interface GenerateOtpResponse {
    message: string;
    otp_id: number;
    stage: OtpStage;
    expires_at: string;
}

export interface VerifyOtpResponse {
    message: string;
    stage: OtpStage;
}

async function requireToken(): Promise<string> {
    const token = await getToken();

    if (!token) {
        throw new Error('Session expired. Please log in again.');
    }

    return token;
}

export async function requestHandoverOtp(
    cashRequestId: number,
    stage: OtpStage,
): Promise<GenerateOtpResponse> {
    if (!Number.isInteger(cashRequestId) || cashRequestId <= 0) {
        throw new Error(`Invalid cash request ID: ${String(cashRequestId)}`);
    }

    const token = await requireToken();

    return apiRequest<GenerateOtpResponse>(
        `/cash-requests/${cashRequestId}/otp`,
        {
            method: 'POST',
            body: JSON.stringify({ stage }),
        },
        token,
    );
}

export async function verifyHandoverOtp(
    otpId: number,
    code: string,
    latitude?: number,
    longitude?: number,
): Promise<VerifyOtpResponse> {
    if (!Number.isInteger(otpId) || otpId <= 0) {
        throw new Error('Invalid OTP session. Please request a new code.');
    }

    const token = await requireToken();

    return apiRequest<VerifyOtpResponse>(
        '/otps/verify',
        {
            method: 'POST',
            body: JSON.stringify({
                otp_id: otpId,
                code,
                lat: latitude,
                lng: longitude,
            }),
        },
        token,
    );
}
