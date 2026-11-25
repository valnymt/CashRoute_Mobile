import { apiRequest } from './api';
import { getToken } from './authStorage';

export type OtpStage = 'pickup' | 'dropoff';

export interface HandoverContact {
    name: string | null;
    phone: string | null;
    email: string | null;
    is_test_recipient: boolean;
}

export interface GenerateOtpResponse {
    contact: HandoverContact;
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

export function getHandoverContact(cashRequestId: number, stage: OtpStage, signal: AbortSignal) {
    return apiRequest<HandoverContact>(
        '/cash-requests/' + cashRequestId + '/otp/contact?stage=' + stage,
        { signal },
    );
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

    const response = await apiRequest<VerifyOtpResponse>(
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

    console.log('[OTP] Verify response:', response);
    return response;
}
