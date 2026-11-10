import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AuraBackground, GlassCard, BottomNavBar } from '../components';
import { Colors, Typography } from '../theme';
import type { BottomNavItem } from '../components';

interface TripHistoryScreenProps {
  onTripPress: (id: string) => void;
  onTabChange?: (tab: BottomNavItem) => void;
}

type FilterTab = 'all' | 'completed' | 'cancelled';

interface TripItem {
  id: string;
  date: string;
  branch: string;
  amount: string;
  status: 'Completed' | 'Cancelled';
}

const trips: TripItem[] = [
  { id: 'REQ-1038', date: '13 Oct', branch: 'Latha Branch', amount: 'MMK 120,000', status: 'Completed' },
  { id: 'REQ-1035', date: '12 Oct', branch: 'TimeCity Branch', amount: 'MMK 90,000', status: 'Completed' },
  { id: 'REQ-1033', date: '11 Oct', branch: 'Kamayut Branch', amount: 'MMK 60,000', status: 'Cancelled' },
  { id: 'REQ-1030', date: '10 Oct', branch: 'Insein Branch', amount: 'MMK 200,000', status: 'Completed' },
  { id: 'REQ-1027', date: '09 Oct', branch: 'Yay Kyaw Branch', amount: 'MMK 150,000', status: 'Completed' },
];

export const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({
  onTripPress,
  onTabChange,
}) => {
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = trips.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'completed') return t.status === 'Completed';
    return t.status === 'Cancelled';
  });

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>My Trip History</Text>

          {/* Filter tabs */}
          <View style={styles.filterRow}>
            {(['all', 'completed', 'cancelled'] as FilterTab[]).map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, filter === tab && styles.filterTabActive]}
                onPress={() => setFilter(tab)}>
                <Text
                  style={[
                    styles.filterTabText,
                    filter === tab && styles.filterTabTextActive,
                  ]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {filtered.map(trip => (
              <TouchableOpacity
                key={trip.id}
                onPress={() => onTripPress(trip.id)}
                activeOpacity={0.8}>
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.tripCard}>
                    <View style={styles.tripHeader}>
                      <Text style={styles.tripId}>{trip.id}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          trip.status === 'Cancelled' && styles.cancelledBadge,
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            trip.status === 'Cancelled' && styles.cancelledText,
                          ]}>
                          {trip.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.tripBottom}>
                      <Text style={styles.tripMeta}>
                        {trip.date} · {trip.branch}
                      </Text>
                      <Text style={styles.tripAmount}>{trip.amount}</Text>
                    </View>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
            <View style={{ height: 16 }} />
          </ScrollView>
        </View>

        <BottomNavBar
          selected="history"
          onSelect={item => onTabChange?.(item)}
        />
      </View>
    </AuraBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
  },
  filterTabActive: {
    borderColor: Colors.PrimaryGreen,
    backgroundColor: 'rgba(150, 215, 76, 0.1)',
  },
  filterTabText: {
    ...Typography.labelLarge,
    color: Colors.TextSecondary,
  },
  filterTabTextActive: {
    color: Colors.PrimaryGreen,
  },
  tripCard: {
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripId: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
  },
  cancelledBadge: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  cancelledText: {
    color: Colors.AccentRed,
  },
  tripBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tripMeta: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  tripAmount: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
});
