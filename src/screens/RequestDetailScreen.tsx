import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../context/AppContext';
import { useAnimatedMount } from '../hooks/useAnimatedMount';

interface RequestDetailScreenProps {
  onBackClick: () => void;
  onStartTrip: () => void;
  tripId?: string;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({
  onBackClick,
  onStartTrip,
  tripId,
}) => {
  const { currentTrip, getTripById } = useApp();
  const trip = tripId ? getTripById(tripId) ?? currentTrip : currentTrip;
  const [isLoading, setIsLoading] = useState(false);

  const card1Anim = useAnimatedMount(0, 400);
  const card2Anim = useAnimatedMount(100, 400);
  const card3Anim = useAnimatedMount(200, 400);
  const card4Anim = useAnimatedMount(300, 400);

  const handleAccept = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onStartTrip();
    }, 800);
  };

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Request details" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={card1Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.requestId}>{trip.id}</Text>
                <Text style={styles.amount}>{trip.currency} {trip.amount}</Text>
                <View style={styles.timeSlotRow}>
                  <Text style={styles.timeSlotLabel}>Requested time slot</Text>
                  <Text style={styles.timeSlotValue}>{trip.timeSlot}</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card2Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.sectionLabel}>ROUTE</Text>
                <View style={{ height: 12 }} />

                <View style={styles.routeItem}>
                  <View style={styles.markerContainer}>
                    <View style={[styles.routeMarker, { backgroundColor: Colors.PrimaryGreen }]}>
                      <Text style={styles.markerLetter}>A</Text>
                    </View>
                  </View>
                  <View style={styles.routeTextContainer}>
                    <Text style={styles.routeType}>PICKUP</Text>
                    <Text style={styles.routeTitle}>{trip.pickupName}</Text>
                    <Text style={styles.routeAddr}>{trip.pickupAddr}</Text>
                  </View>
                </View>

                <View style={styles.routeConnector}>
                  <View style={styles.routeLine} />
                </View>

                <View style={styles.routeItem}>
                  <View style={styles.markerContainer}>
                    <View style={[styles.routeMarker, { backgroundColor: Colors.PurpleAccent }]}>
                      <Text style={styles.markerLetter}>B</Text>
                    </View>
                  </View>
                  <View style={styles.routeTextContainer}>
                    <Text style={styles.routeType}>DROP-OFF</Text>
                    <Text style={styles.routeTitle}>{trip.dropOffName}</Text>
                    <Text style={styles.routeAddr}>{trip.dropOffAddr}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card3Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.remarksLabel}>Remarks</Text>
                <Text style={styles.remarksText}>{trip.remarks}</Text>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card4Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>{trip.status}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>

        {trip.status === 'Assigned' && (
          <PrimaryButton
            text={isLoading ? 'Accepting...' : 'Accept Assignment'}
            onPress={handleAccept}
            loading={isLoading}
            style={{ marginBottom: 24 }}
          />
        )}
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
