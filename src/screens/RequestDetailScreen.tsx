import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';

interface RequestDetailScreenProps {
  onBackClick: () => void;
  onStartTrip: () => void;
}

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({
  onBackClick,
  onStartTrip,
}) => {
  const { currentTrip, teamMembers } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const card1Anim = useAnimatedMount(0, 400);
  const card2Anim = useAnimatedMount(100, 400);
  const card3Anim = useAnimatedMount(200, 400);
  const card4Anim = useAnimatedMount(300, 400);
  const card5Anim = useAnimatedMount(400, 400);

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
                <Text style={styles.requestId}>{currentTrip.id}</Text>
                <Text style={styles.amount}>{currentTrip.currency} {currentTrip.amount}</Text>
                <View style={styles.timeSlotRow}>
                  <Text style={styles.timeSlotLabel}>Requested time slot</Text>
                  <Text style={styles.timeSlotValue}>{currentTrip.timeSlot}</Text>
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
                    <Text style={styles.routeTitle}>{currentTrip.pickupName}</Text>
                    <Text style={styles.routeAddr}>{currentTrip.pickupAddr}</Text>
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
                    <Text style={styles.routeTitle}>{currentTrip.dropOffName}</Text>
                    <Text style={styles.routeAddr}>{currentTrip.dropOffAddr}</Text>
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
                <Text style={styles.remarksText}>{currentTrip.remarks}</Text>
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
                    <Text style={styles.statusBadgeText}>{currentTrip.status}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card5Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.sectionLabel}>TEAM MEMBERS</Text>
                <View style={{ height: 12 }} />
                {teamMembers.map((member, index) => (
                  <View
                    key={member.name}
                    style={[
                      styles.memberRow,
                      index < teamMembers.length - 1 && styles.memberBorder,
                    ]}>
                    <View style={styles.memberLeft}>
                      <View style={[
                        styles.memberAvatar,
                        { backgroundColor: index === 0 ? Colors.PrimaryGreen : Colors.PurpleAccent },
                      ]}>
                        <Text style={styles.memberInitials}>{member.initials}</Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <View style={styles.memberRoleBadge}>
                          <Text style={styles.memberRoleText}>{member.role}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.callBtn}
                      onPress={() => Linking.openURL(`tel:${member.phone}`)}
                      activeOpacity={0.7}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
                          stroke={Colors.PrimaryGreen}
                          strokeWidth={2}
                          fill="none"
                        />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <PrimaryButton
          text={isLoading ? 'Accepting...' : 'Accept Assignment'}
          onPress={handleAccept}
          loading={isLoading}
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  memberBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitials: {
    ...Typography.labelLarge,
    color: Colors.White,
    fontWeight: '700',
    fontSize: 13,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  memberRoleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 3,
  },
  memberRoleText: {
    ...Typography.labelSmall,
    color: Colors.TextSecondary,
  },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 215, 76, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
