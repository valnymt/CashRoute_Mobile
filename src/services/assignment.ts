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

export interface BackendTeamMember {
    id: number;
    name: string;
    role: string | null;
    phone: string | null;
    is_leader?: boolean;
}

export interface BackendTeam {
    name: string;
    members: BackendTeamMember[];
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
    team: BackendTeam | null;
    pickup: AssignmentLocation;
    dropoff: AssignmentLocation;
    assigned_at: string | null;
    accepted_at: string | null;
    can_accept?: boolean;
    leader_name?: string | null;
}

interface AssignmentResponse {
    data: BackendAssignment[];
}

export function acceptAssignment(reference: string) {
    return apiRequest<{ trip: { accepted_at: string } }>(
        '/requests/' + encodeURIComponent(reference) + '/accept',
        { method: 'POST' },
    );
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
