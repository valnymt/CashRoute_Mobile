
import { apiRequest } from './api';
import type { HistoryTrip } from '../types';

interface BackendTrip {
    timeline?: HistoryTrip['timeline'];
    arrivedPickupAt?: string | null;
    arrivedDropoffAt?: string | null;
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
        timeline: item.timeline ?? [],
        arrivedPickupAt: item.arrivedPickupAt,
        arrivedDropoffAt: item.arrivedDropoffAt,
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
