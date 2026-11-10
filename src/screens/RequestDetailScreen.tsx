import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';

interface RequestDetailScreenProps {
  onBackClick: () => void;
  onStartTrip: () => void;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({
  onBackClick,
  onStartTrip,
}) => {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Request details" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Request ID + Time slot */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.requestId}>REQ-1048</Text>
              <Text style={styles.amount}>MMK 250,000</Text>
              <View style={styles.timeSlotRow}>
                <Text style={styles.timeSlotLabel}>Requested time slot</Text>
                <Text style={styles.timeSlotValue}>14 Oct · 10:00 – 12:00</Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Route card */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.sectionLabel}>ROUTE</Text>
              <View style={{ height: 12 }} />

              {/* Pickup */}
              <View style={styles.routeItem}>
                <View style={styles.markerContainer}>
                  <View style={[styles.routeMarker, { backgroundColor: Colors.PrimaryGreen }]}>
                    <Text style={styles.markerLetter}>A</Text>
                  </View>
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeType}>PICKUP</Text>
                  <Text style={styles.routeTitle}>Orchard Branch</Text>
                  <Text style={styles.routeAddr}>138 Orchard Rd, Myanmar</Text>
                </View>
              </View>

              {/* Connector line */}
              <View style={styles.routeConnector}>
                <View style={styles.routeLine} />
              </View>

              {/* Drop-off */}
              <View style={styles.routeItem}>
                <View style={styles.markerContainer}>
                  <View style={[styles.routeMarker, { backgroundColor: Colors.PurpleAccent }]}>
                    <Text style={styles.markerLetter}>B</Text>
                  </View>
                </View>
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeType}>DROP-OFF</Text>
                  <Text style={styles.routeTitle}>HQ Cash Centre</Text>
                  <Text style={styles.routeAddr}>1 Raffles Quay, Myanmar</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Remarks card */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.remarksLabel}>Remarks</Text>
              <Text style={styles.remarksText}>
                Daily surplus cash. Contact the branch manager on arrival.
              </Text>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Status */}
          <GlassCard>
            <View style={styles.cardContent}>
              <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Assigned</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 24 }} />
        </ScrollView>

        <PrimaryButton
          text="Accept Assignment"
          onPress={onStartTrip}
          style={{ marginBottom: 24 }}
        />
      </View>
    </AuraBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  scroll: {
    flex: 1,
    marginTop: 12,
  },
  cardContent: {
    padding: 20,
  },
  requestId: {
    ...Typography.labelMedium,
    color: Colors.TextSecondary,
    letterSpacing: 1.5,
  },
  amount: {
    ...Typography.displayLarge,
    color: Colors.White,
    marginTop: 4,
  },
  timeSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.09)',
  },
  timeSlotLabel: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  timeSlotValue: {
    ...Typography.bodySmall,
    color: Colors.White,
    fontWeight: '600',
  },
  sectionLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  markerContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  routeMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerLetter: {
    ...Typography.labelLarge,
    color: Colors.White,
    fontWeight: '700',
    fontSize: 13,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeType: {
    ...Typography.labelSmall,
    color: Colors.TextDim,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  routeTitle: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  routeAddr: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  routeConnector: {
    paddingLeft: 15,
    height: 28,
    justifyContent: 'center',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: Colors.CardBorder,
  },
  remarksLabel: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginBottom: 6,
  },
  remarksText: {
    ...Typography.bodyMedium,
    color: Colors.White,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  statusBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
  },
});
