
import { apiRequest } from './api';

export interface UserProfile {
    id: string;
    name: string;
    username: string;
    role: string;
    mobile: string;
    email: string;
    status: string;
    branchId: string | null;
    teamId: string | null;
    createdAt: string | null;
    mustChangePassword: boolean;
}

export interface BranchDirectoryItem {
    code: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    registered: boolean;
}

export async function getMyProfile(): Promise<{ data: UserProfile }> {
    return apiRequest<{ data: UserProfile }>('/me', {
        method: 'GET',
    });
}

export async function getBranchDirectory(): Promise<BranchDirectoryItem[]> {
    return apiRequest<BranchDirectoryItem[]>('/branch-directory', {
        method: 'GET',
    });
}