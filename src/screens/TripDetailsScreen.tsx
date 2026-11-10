import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuraBackground, GlassCard, TopBar } from '../components';
import { Colors, Typography } from '../theme';

interface TripDetailsScreenProps {
  onBackClick: () => void;
}

const timelineItems = [
  { label: 'Accepted · 08:55' },
  { label: 'Pickup OTP verified · 09:22' },
  { label: 'Drop-off OTP verified · 09:44' },
  { label: 'Proof saved · 09:47' },
];

export const TripDetailsScreen: React.FC<TripDetailsScreenProps> = ({
  onBackClick,
}) => {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Trip details" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.requestId}>REQ-1038</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
          </View>

          {/* Details card */}
          <GlassCard>
            <DetailRow label="Date" value="13 Oct 2026" showBorder />
            <DetailRow label="Type" value="Withdrawal · HQ → Kamayut Branch" showBorder />
            <DetailRow label="Amount" value="MMK 120,000" showBorder />
            <DetailRow label="Team" value="Team A" showBorder />
            <View style={styles.durationRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <View style={styles.durationRight}>
                <Text style={styles.detailValue}>51 min</Text>
                <View style={styles.onTimeBadge}>
                  <Text style={styles.onTimeText}>On Time</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Timeline card */}
          <GlassCard>
            <View style={styles.timelineCard}>
              <Text style={styles.timelineLabel}>TIMELINE</Text>
              <View style={{ height: 12 }} />
              {timelineItems.map((item, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <Text style={styles.timelineText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Proof photo placeholder */}
          <GlassCard>
            <View style={styles.proofCard}>
              <Text style={styles.proofText}>Proof photo</Text>
            </View>
          </GlassCard>

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
  timelineText: {
    ...Typography.bodyMedium,
    color: Colors.White,
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
