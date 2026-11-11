import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import { AuraBackground, GlassCard, BottomNavBar, AnimatedPressable } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import type { BottomNavItem } from '../components';

interface TripHistoryScreenProps {
  onTripPress: (id: string) => void;
  onTabChange?: (tab: BottomNavItem) => void;
}

type FilterTab = 'all' | 'completed' | 'cancelled';

export const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({
  onTripPress,
  onTabChange,
}) => {
  const { tripHistory, isRefreshing, refreshData } = useApp();
  const [filter, setFilter] = useState<FilterTab>('all');

  const filtered = tripHistory.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'completed') return t.status === 'Completed';
    return t.status === 'Cancelled';
  });

  const anims = useRef(
    filtered.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(24),
    })),
  ).current;

  useEffect(() => {
    anims.forEach(a => {
      a.opacity.setValue(0);
      a.translateY.setValue(24);
    });
    const animations = anims.slice(0, filtered.length).map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: 300,
          delay: i * 70,
          useNativeDriver: true,
        }),
        Animated.timing(a.translateY, {
          toValue: 0,
          duration: 300,
          delay: i * 70,
          useNativeDriver: true,
        }),
      ]),
    );
    Animated.stagger(0, animations).start();
  }, [filter, anims, filtered.length]);

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>My Trip History</Text>

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
                  {tab === 'all' ? ` (${tripHistory.length})` :
                   tab === 'completed' ? ` (${tripHistory.filter(t => t.status === 'Completed').length})` :
                   ` (${tripHistory.filter(t => t.status === 'Cancelled').length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={refreshData}
                tintColor={Colors.PrimaryGreen}
                colors={[Colors.PrimaryGreen]}
                progressBackgroundColor={Colors.DarkBgTop}
              />
            }>
            {filtered.map((trip, index) => (
              <Animated.View
                key={trip.id}
                style={{
                  opacity: anims[index]?.opacity ?? 1,
                  transform: [{ translateY: anims[index]?.translateY ?? 0 }],
                }}>
                <AnimatedPressable onPress={() => onTripPress(trip.id)}>
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
                </AnimatedPressable>
              </Animated.View>
            ))}
            {filtered.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No trips found</Text>
              </View>
            )}
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
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.TextDim,
  },
});
