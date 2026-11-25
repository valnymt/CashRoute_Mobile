import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, Image } from 'react-native';
import { AuraBackground, GlassCard, TopBar } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';
import { getTripProofPhotos } from '../services/tripHistory';

interface TripDetailsScreenProps {
  onBackClick: () => void;
  tripId?: string;
}

export const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({
  onBackClick,
  tripId,
}) => {
  const { tripHistory } = useApp();
  const trip = tripId ? tripHistory.find(t => t.id === tripId) : tripHistory[0];

  const headerAnim = useAnimatedMount(0, 400);
  const card1Anim = useAnimatedMount(100, 400);
  const card2Anim = useAnimatedMount(200, 400);
  const card3Anim = useAnimatedMount(300, 400);

  if (!trip) {
    return (
      <AuraBackground>
        <View style={styles.container}>
          <TopBar title="Trip details" onBackClick={onBackClick} />
          <Text style={styles.detailLabel}>Trip details unavailable.</Text>
        </View>
      </AuraBackground>
    );
  }

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
              <DetailRow label="Date" value={trip.date} showBorder />
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
                <Text style={styles.timelineLabel}>DELIVERY TIMELINE</Text>
                <View style={{ height: 12 }} />
                {trip.timeline.length === 0 && <Text style={styles.detailLabel}>No trip events recorded.</Text>}
                {trip.timeline.map((item, i) => (
                  <View key={item.label} style={styles.timelineItem}>
                    <View style={[
                      styles.timelineDot,
                      i === trip.timeline.length - 1 && trip.status === 'Cancelled' && styles.timelineDotRed,
                    ]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.timelineText, i === trip.timeline.length - 1 && trip.status === 'Cancelled' && styles.timelineTextRed]}>{item.label}</Text>
                      {item.at && <Text style={styles.detailLabel}>{formatTimestamp(item.at)}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card3Anim}>
            <GlassCard>
              <DeliveryPhotos key={trip.id} reference={trip.id} />
            </GlassCard>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </AuraBackground>
  );
};

function DeliveryPhotos({ reference }: { reference: string }) {
  const [photos, setPhotos] = useState<Awaited<ReturnType<typeof getTripProofPhotos>>>([]);
  const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const controller = new AbortController();
    setState('loading');
    setFailedPhotos([]);
    getTripProofPhotos(reference, controller.signal).then(items => {
      if (controller.signal.aborted) return;
      setPhotos(items);
      setState('ready');
    }).catch(() => {
      if (!controller.signal.aborted) setState('error');
    });
    return () => controller.abort();
  }, [reference]);

  return (
    <View style={styles.proofCard}>
      <Text style={styles.timelineLabel}>PROOF OF DELIVERY</Text>
      {state === 'loading' && <Text style={styles.proofText}>Loading delivery photos…</Text>}
      {state === 'error' && <Text style={styles.proofText}>Unable to load delivery photos.</Text>}
      {state === 'ready' && photos.length === 0 && <Text style={styles.proofText}>No delivery photos were saved.</Text>}
      {state === 'ready' && photos.map((photo, index) => (
        failedPhotos.includes(photo.uri) ? (
          <Text key={photo.uri} style={styles.proofText}>Delivery photo {index + 1} is unavailable.</Text>
        ) : (
          <Image
            key={photo.uri}
            source={photo}
            style={styles.proofPhoto}
            resizeMode="contain"
            accessibilityLabel={'Delivery photo ' + (index + 1)}
            onError={() => setFailedPhotos(items => [...items, photo.uri])}
          />
        )
      ))}
    </View>
  );
}

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

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
    padding: 20,
    gap: 12,
  },
  proofPhoto: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: Colors.CardSurface,
  },
  proofText: {
    ...Typography.bodyMedium,
    color: Colors.TextDim,
  },
});
