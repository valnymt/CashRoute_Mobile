
import { apiRequest } from './api';
import { getToken } from './authStorage';
import { API_BASE_URL } from '../config/api';
import type { HistoryTrip } from '../types';

interface BackendTrip {
    timeline?: { kind: string; label: string; at: string }[];
    id: string;
    date: string;
    branch: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
    teamId: string;
    durationMin: number;
    onTime: boolean;
    pickup: {
        name: string;
    };
    dropoff: {
        name: string;
    };
}

const DELIVERY_EVENTS = new Set([
    'pickup_arrival',
    'pickup_verified',
    'dropoff_arrival',
    'dropoff_verified',
    'completed',
    'cancelled',
]);

interface TripsResponse {
    data: BackendTrip[];
}

function formatDate(date: string): string {
    if (!date) return '';

    const parsed = new Date(`${date}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

function mapBackendTrip(item: BackendTrip): HistoryTrip {
    const duration =
        item.durationMin > 0 ? `${item.durationMin} min` : '—';

    return {
        id: item.id,
        date: formatDate(item.date),
        branch: item.branch,
        amount: `${item.currency} ${Number(item.amount).toLocaleString('en-US')}`,
        status: item.status as HistoryTrip['status'],
        type: `${item.type} · ${item.pickup.name} → ${item.dropoff.name}`,
        team: `Team ${item.teamId}`,
        duration,
        onTime: item.onTime,
        timeline: (item.timeline ?? []).filter(event => DELIVERY_EVENTS.has(event.kind)),
    };
}

export async function getTripHistory(): Promise<HistoryTrip[]> {
    const response = await apiRequest<TripsResponse>(
        '/trips?include_cancelled=true',
        {
            method: 'GET',
        },
    );

    return (response.data ?? []).map(mapBackendTrip);
}

export async function getTripProofPhotos(reference: string, signal: AbortSignal) {
    const token = await getToken();
    if (!token) throw new Error('Sign in again to view delivery photos.');

    const endpoint = '/trips/' + encodeURIComponent(reference);
    const { data } = await apiRequest<{
        data: { proof_of_delivery?: { photo_ids: number[] } | null };
    }>(endpoint, { signal }, token);

    return (data.proof_of_delivery?.photo_ids ?? []).map(id => ({
        uri: API_BASE_URL + endpoint + '/proof-of-delivery/' + id,
        headers: { Authorization: 'Bearer ' + token },
    }));
}
