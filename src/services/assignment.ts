import { apiRequest } from './api';
import { getToken } from './authStorage';

export interface AssignmentLocation {
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    contact_name: string;
    contact_phone: string;
}

export interface BackendAssignment {
    cash_request_id: number;
    reference: string;
    trip_id: number;
    type: 'Deposit' | 'Withdrawal';
    amount: string;
    currency: string;
    date: string;
    remarks: string;
    status: string;
    team_id: number;
    pickup: AssignmentLocation;
    dropoff: AssignmentLocation;
    assigned_at: string | null;
    accepted_at: string | null;
}

interface AssignmentResponse {
    data: BackendAssignment[];
}

export async function getMyAssignments(): Promise<BackendAssignment[]> {
    const token = await getToken();

    if (!token) {
        throw new Error('Session expired. Please log in again.');
    }

    const response = await apiRequest<AssignmentResponse>(
        '/my-assignments',
        {
            method: 'GET',
        },
        token,
    );

    return response.data ?? [];
}
