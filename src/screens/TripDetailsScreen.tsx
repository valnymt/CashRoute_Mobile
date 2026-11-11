import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { AuraBackground, GlassCard, TopBar } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';

interface TripDetailsScreenProps {
  onBackClick: () => void;
  tripId?: string;
}

export const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({
  onBackClick,
  tripId,
}) => {
  const { tripHistory } = useApp();
  const trip = tripHistory.find(t => t.id === tripId) || tripHistory[0];

  const headerAnim = useAnimatedMount(0, 400);
  const card1Anim = useAnimatedMount(100, 400);
  const card2Anim = useAnimatedMount(200, 400);
  const card3Anim = useAnimatedMount(300, 400);

  const timelineAnims = useRef(
    trip.timeline.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = timelineAnims.map((anim, i) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 400 + i * 150,
        useNativeDriver: true,
      }),
    );
    Animated.stagger(0, animations).start();
  }, [timelineAnims]);

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Trip details" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.headerRow, headerAnim]}>
            <Text style={styles.requestId}>{trip.id}</Text>
            <View style={[styles.statusBadge, trip.status === 'Cancelled' && styles.cancelledBadge]}>
              <Text style={[styles.statusText, trip.status === 'Cancelled' && styles.cancelledText]}>
                {trip.status}
              </Text>
            </View>
          </Animated.View>

          <Animated.View style={card1Anim}>
            <GlassCard>
              <DetailRow label="Date" value={trip.date + ' 2026'} showBorder />
              <DetailRow label="Type" value={trip.type} showBorder />
              <DetailRow label="Amount" value={trip.amount} showBorder />
              <DetailRow label="Team" value={trip.team} showBorder />
              <View style={styles.durationRow}>
                <Text style={styles.detailLabel}>Duration</Text>
                <View style={styles.durationRight}>
                  <Text style={styles.detailValue}>{trip.duration}</Text>
                  {trip.onTime && (
                    <View style={styles.onTimeBadge}>
                      <Text style={styles.onTimeText}>On Time</Text>
                    </View>
                  )}
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card2Anim}>
            <GlassCard>
              <View style={styles.timelineCard}>
                <Text style={styles.timelineLabel}>TIMELINE</Text>
                <View style={{ height: 12 }} />
                {trip.timeline.map((item, i) => (
                  <Animated.View
                    key={i}
                    style={[styles.timelineItem, {
                      opacity: timelineAnims[i] ?? 1,
                      transform: [{
                        translateX: (timelineAnims[i] ?? new Animated.Value(1)).interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      }],
                    }]}>
                    <View style={[
                      styles.timelineDot,
                      i === trip.timeline.length - 1 && trip.status === 'Cancelled' && styles.timelineDotRed,
                    ]} />
                    <Text style={[
                      styles.timelineText,
                      i === trip.timeline.length - 1 && trip.status === 'Cancelled' && styles.timelineTextRed,
                    ]}>
                      {item.label}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card3Anim}>
            <GlassCard>
              <View style={styles.proofCard}>
                <Text style={styles.proofText}>
                  {trip.status === 'Completed' ? 'Proof photo saved ✓' : 'No proof available'}
                </Text>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </AuraBackground>
  );
};

const DetailRow: React.FC<{
  label: string;
  value: string;
  showBorder?: boolean;
}> = ({ label, value, showBorder }) => (
  <View style={[styles.detailRow, showBorder && styles.detailRowBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  scroll: {
    flex: 1,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestId: {
    ...Typography.headlineLarge,
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
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  detailRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  durationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  onTimeBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  onTimeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
  },
  timelineCard: {
    padding: 20,
  },
  timelineLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.PrimaryGreen,
    marginRight: 12,
  },
  timelineDotRed: {
    backgroundColor: Colors.AccentRed,
  },
  timelineText: {
    ...Typography.bodyMedium,
    color: Colors.White,
  },
  timelineTextRed: {
    color: Colors.AccentRed,
  },
  proofCard: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proofText: {
    ...Typography.bodyMedium,
    color: Colors.TextDim,
  },
});
