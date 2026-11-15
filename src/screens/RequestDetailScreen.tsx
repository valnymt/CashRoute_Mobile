import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity, Linking } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount, usePulse } from '../hooks/useAnimatedMount';

interface RequestDetailScreenProps {
  onBackClick: () => void;
  onStartTrip: () => void;
}

/** Phone icon used by the tap-to-call buttons. */
const PhoneIcon: React.FC = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"
      stroke={Colors.PrimaryGreen}
      strokeWidth={2}
      fill="none"
    />
  </Svg>
);

/** One pickup/drop-off contact block with a tap-to-call button. */
const ContactRow: React.FC<{
  stageLabel: string;
  name: string;
  info: string;
  phone?: string;
  accentColor: string;
}> = ({ stageLabel, name, info, phone, accentColor }) => (
  <View style={styles.contactRow}>
    <View style={styles.contactLeft}>
      <View style={[styles.contactStageDot, { backgroundColor: accentColor }]} />
      <View style={styles.contactText}>
        <Text style={styles.contactStageLabel}>{stageLabel}</Text>
        <Text style={styles.contactName}>{name}</Text>
        <Text style={styles.contactInfo}>{info}</Text>
      </View>
    </View>
    {phone ? (
      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => Linking.openURL(`tel:${phone}`)}
        activeOpacity={0.7}>
        <PhoneIcon />
      </TouchableOpacity>
    ) : null}
  </View>
);

export const RequestDetailScreen: React.FC<RequestDetailScreenProps> = ({
  onBackClick,
  onStartTrip,
}) => {
  const { currentTrip, teamMembers, user } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  // One staggered mount animation per card so the detail stack feels alive.
  const card1 = useAnimatedMount(0, 400);
  const card2 = useAnimatedMount(80, 400);
  const card3 = useAnimatedMount(160, 400);
  const card4 = useAnimatedMount(240, 400);
  const card5 = useAnimatedMount(320, 400);
  const card6 = useAnimatedMount(400, 400);

  // Pulsing opacity drives the urgent "ticking clock" feel on the deadline card.
  const deadlinePulse = usePulse();

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
          {/* ─── 1. Header (request ID, amount, type, status) ─────────────── */}
          <Animated.View style={card1}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.headerTopRow}>
                  <Text style={styles.requestId}>{currentTrip.id}</Text>
                  <View
                    style={[
                      styles.typeBadge,
                      currentTrip.type === 'Deposit'
                        ? styles.typeBadgeDeposit
                        : styles.typeBadgeWithdrawal,
                    ]}>
                    <Text
                      style={[
                        styles.typeBadgeText,
                        currentTrip.type === 'Deposit'
                          ? styles.typeBadgeTextDeposit
                          : styles.typeBadgeTextWithdrawal,
                      ]}>
                      {currentTrip.type}
                    </Text>
                  </View>
                </View>
                <Text style={styles.amountLabel}>Amount</Text>
                <Text style={styles.amount}>
                  {currentTrip.currency} {currentTrip.amount}
                </Text>
                <View style={styles.headerStatusRow}>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusBadgeText}>{currentTrip.status}</Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.gap12} />

          {/* ─── 2. Deadline (prominent — the whole point of the screen) ──── */}
          {currentTrip.completeWithin ? (
            <>
              <Animated.View style={card2}>
                <View style={styles.deadlineCard}>
                  <View style={styles.deadlineLeft}>
                    <Animated.View
                      style={[styles.deadlineIconCircle, { opacity: deadlinePulse }]}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                        <Path
                          d="M12 2a10 10 0 100 20 10 10 0 000-20z"
                          stroke={Colors.AccentRed}
                          strokeWidth={2.2}
                          fill="none"
                        />
                        <Path
                          d="M12 7v5l3 3"
                          stroke={Colors.AccentRed}
                          strokeWidth={2.2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          fill="none"
                        />
                      </Svg>
                    </Animated.View>
                  </View>
                  <View style={styles.deadlineTextBlock}>
                    <Text style={styles.deadlineLabel}>COMPLETE WITHIN</Text>
                    <Text style={styles.deadlineValue}>{currentTrip.completeWithin}</Text>
                    <Text style={styles.deadlineHint}>
                      Pickup window: {currentTrip.timeSlot}
                    </Text>
                  </View>
                </View>
              </Animated.View>
              <View style={styles.gap12} />
            </>
          ) : null}

          {/* ─── 3. Route (pickup → drop-off) ─────────────────────────────── */}
          <Animated.View style={card3}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.sectionLabel}>ROUTE</Text>
                <View style={styles.gap12} />

                <View style={styles.routeItem}>
                  <View style={styles.markerContainer}>
                    <View
                      style={[styles.routeMarker, { backgroundColor: Colors.PrimaryGreen }]}>
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
                    <View
                      style={[styles.routeMarker, { backgroundColor: Colors.PurpleAccent }]}>
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

          <View style={styles.gap12} />

          {/* ─── 4. Branch contacts (pickup + drop-off, tap-to-call) ──────── */}
          <Animated.View style={card4}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.sectionLabel}>BRANCH CONTACTS</Text>
                <View style={styles.gap12} />

                <ContactRow
                  stageLabel="PICKUP CONTACT"
                  name={currentTrip.contactName}
                  info={currentTrip.contactInfo}
                  phone={currentTrip.pickupContactPhone}
                  accentColor={Colors.PrimaryGreen}
                />

                <View style={styles.contactDivider} />

                <ContactRow
                  stageLabel="DROP-OFF CONTACT"
                  name={currentTrip.dropOffContact}
                  info={currentTrip.dropOffContactInfo}
                  phone={currentTrip.dropOffContactPhone}
                  accentColor={Colors.PurpleAccent}
                />
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.gap12} />

          {/* ─── 5. Remarks from the Maker (if any) ───────────────────────── */}
          {currentTrip.remarks ? (
            <>
              <Animated.View style={card5}>
                <GlassCard>
                  <View style={styles.cardContent}>
                    <Text style={styles.sectionLabel}>REMARKS FROM MAKER</Text>
                    <View style={styles.gap12} />
                    <Text style={styles.remarksText}>{currentTrip.remarks}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
              <View style={styles.gap12} />
            </>
          ) : null}

          {/* ─── 6. Your team (highlight current user with "YOU" tag) ─────── */}
          <Animated.View style={card6}>
            <GlassCard>
              <View style={styles.cardContent}>
                <View style={styles.teamHeaderRow}>
                  <Text style={styles.sectionLabel}>YOUR TEAM</Text>
                  <View style={styles.teamNameBadge}>
                    <Text style={styles.teamNameBadgeText}>{currentTrip.team}</Text>
                  </View>
                </View>
                <Text style={styles.teamHint}>
                  You're delivering this with {teamMembers.length - 1} other team member
                  {teamMembers.length - 1 === 1 ? '' : 's'}.
                </Text>
                <View style={styles.gap12} />
                {teamMembers.map((member, index) => {
                  const isCurrentUser = member.name === user.name;
                  return (
                    <View
                      key={member.name}
                      style={[
                        styles.memberRow,
                        index < teamMembers.length - 1 && styles.memberBorder,
                      ]}>
                      <View style={styles.memberLeft}>
                        <View
                          style={[
                            styles.memberAvatar,
                            {
                              backgroundColor:
                                member.role === 'Driver'
                                  ? Colors.PrimaryGreen
                                  : Colors.PurpleAccent,
                            },
                          ]}>
                          <Text style={styles.memberInitials}>{member.initials}</Text>
                        </View>
                        <View style={styles.memberInfo}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            {isCurrentUser && (
                              <View style={styles.youBadge}>
                                <Text style={styles.youBadgeText}>YOU</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.memberRoleBadge}>
                            <Text style={styles.memberRoleText}>{member.role}</Text>
                          </View>
                        </View>
                      </View>
                      {!isCurrentUser && member.phone ? (
                        <TouchableOpacity
                          style={styles.callBtn}
                          onPress={() => Linking.openURL(`tel:${member.phone}`)}
                          activeOpacity={0.7}>
                          <PhoneIcon />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.gap24} />
        </ScrollView>

        <PrimaryButton
          text={isLoading ? 'Accepting...' : 'Accept Assignment'}
          onPress={handleAccept}
          loading={isLoading}
          style={styles.acceptBtn}
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
  gap12: { height: 12 },
  gap24: { height: 24 },

  // ─── Header card ────────────────────────────────────────────────────
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestId: {
    ...Typography.labelMedium,
    color: Colors.TextSecondary,
    letterSpacing: 1.5,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeDeposit: { backgroundColor: 'rgba(150, 215, 76, 0.15)' },
  typeBadgeWithdrawal: { backgroundColor: 'rgba(114, 28, 184, 0.22)' },
  typeBadgeText: {
    ...Typography.labelSmall,
    fontWeight: '700',
  },
  typeBadgeTextDeposit: { color: Colors.PrimaryGreen },
  typeBadgeTextWithdrawal: { color: '#C79BFF' },
  amountLabel: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 10,
  },
  amount: {
    ...Typography.displayLarge,
    color: Colors.White,
    marginTop: 2,
  },
  headerStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.PrimaryGreen,
    marginRight: 6,
  },
  statusBadgeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
    fontWeight: '700',
  },
  // ─── Deadline (prominent urgency card) ──────────────────────────────
  deadlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 82, 82, 0.55)',
    borderRadius: 20,
    padding: 18,
  },
  deadlineLeft: {
    marginRight: 14,
  },
  deadlineIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 82, 82, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deadlineTextBlock: {
    flex: 1,
  },
  deadlineLabel: {
    ...Typography.labelSmall,
    color: Colors.AccentRed,
    letterSpacing: 1.6,
    fontWeight: '800',
  },
  deadlineValue: {
    ...Typography.displayMedium,
    color: Colors.White,
    fontWeight: '800',
    marginTop: 2,
  },
  deadlineHint: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 4,
  },

  // ─── Section labels ─────────────────────────────────────────────────
  sectionLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },

  // ─── Route ──────────────────────────────────────────────────────────
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

  // ─── Contacts ───────────────────────────────────────────────────────
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  contactStageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 7,
    marginRight: 10,
  },
  contactText: {
    flex: 1,
  },
  contactStageLabel: {
    ...Typography.labelSmall,
    color: Colors.TextDim,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  contactName: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  contactInfo: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 2,
  },
  contactDivider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.09)',
    marginVertical: 14,
  },

  // ─── Remarks ────────────────────────────────────────────────────────
  remarksText: {
    ...Typography.bodyMedium,
    color: Colors.White,
    lineHeight: 22,
  },

  // ─── Team ───────────────────────────────────────────────────────────
  teamHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamNameBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  teamNameBadgeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
    fontWeight: '700',
  },
  teamHint: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 6,
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
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  youBadge: {
    backgroundColor: Colors.PrimaryGreen,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  youBadgeText: {
    fontSize: 9,
    letterSpacing: 1.1,
    color: Colors.Black,
    fontWeight: '800',
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

  acceptBtn: { marginBottom: 24 },
});
