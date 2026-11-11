import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, BottomNavBar, AnimatedPressable } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { usePulse } from '../hooks/useAnimatedMount';
import type { BottomNavItem } from '../components';

interface HomeScreenProps {
  onRequestPress: () => void;
  onTripMapPress: () => void;
  onNotificationsPress?: () => void;
  onHistoryPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onRequestPress, onTripMapPress, onNotificationsPress, onHistoryPress }) => {
  const [selectedTab, setSelectedTab] = React.useState<BottomNavItem>('assignments');
  const { currentTrip, upcomingTrip, unreadCount, isRefreshing, refreshData } = useApp();
  const pulseOpacity = usePulse();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const upcomingAnim = useRef(new Animated.Value(0)).current;

  const headerSlide = useRef(new Animated.Value(20)).current;
  const bannerSlide = useRef(new Animated.Value(30)).current;
  const cardSlide = useRef(new Animated.Value(30)).current;
  const upcomingSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(headerSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(bannerAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(bannerSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(cardSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(upcomingAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(upcomingSlide, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [headerAnim, headerSlide, bannerAnim, bannerSlide, cardAnim, cardSlide, upcomingAnim, upcomingSlide]);

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerSlide }] }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>My Assignments</Text>
              <Text style={styles.subtitle}>Ngeyeemon · Team A (Driver)</Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={onNotificationsPress} style={styles.bellContainer}>
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9z"
                    stroke={Colors.White}
                    strokeWidth={2}
                    fill="none"
                  />
                  <Path
                    d="M13.73 21a2 2 0 0 1-3.46 0"
                    stroke={Colors.White}
                    strokeWidth={2}
                    fill="none"
                  />
                </Svg>
                {unreadCount > 0 && (
                  <Animated.View style={[styles.notifDot, { opacity: pulseOpacity }]}>
                    {unreadCount > 1 && (
                      <Text style={styles.notifCount}>{unreadCount}</Text>
                    )}
                  </Animated.View>
                )}
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>NYM</Text>
              </View>
            </View>
          </Animated.View>

          {/* New assignment banner */}
          <Animated.View style={{ opacity: bannerAnim, transform: [{ translateY: bannerSlide }] }}>
            <AnimatedPressable onPress={onRequestPress}>
              <View style={styles.newAssignmentBanner}>
                <View style={styles.bannerLeft}>
                  <Animated.View style={[styles.greenDotSmall, { opacity: pulseOpacity }]} />
                  <View>
                    <Text style={styles.bannerTitle}>New assignment</Text>
                    <Text style={styles.bannerSub}>{currentTrip.id} · {currentTrip.type} · tap to view</Text>
                  </View>
                </View>
                <Text style={styles.bannerChevron}>›</Text>
              </View>
            </AnimatedPressable>
          </Animated.View>

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
            {/* Current Trip */}
            <Text style={styles.sectionLabel}>CURRENT TRIP</Text>

            <Animated.View style={{ opacity: cardAnim, transform: [{ translateY: cardSlide }] }}>
              <AnimatedPressable onPress={onRequestPress}>
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.requestId}>{currentTrip.id}</Text>
                      <View style={styles.depositBadge}>
                        <Text style={styles.depositBadgeText}>{currentTrip.type}</Text>
                      </View>
                    </View>

                    <Text style={styles.amountLabel}>Amount</Text>
                    <Text style={styles.amount}>{currentTrip.currency} {currentTrip.amount}</Text>

                    <View style={{ height: 12 }} />

                    {/* Route */}
                    <View style={styles.routeItem}>
                      <View style={[styles.routeMarker, { backgroundColor: Colors.PrimaryGreen }]}>
                        <Text style={styles.markerLetter}>A</Text>
                      </View>
                      <View style={styles.routeTextBlock}>
                        <Text style={styles.routeType}>PICKUP</Text>
                        <Text style={styles.routePlace}>{currentTrip.pickupName}</Text>
                      </View>
                    </View>
                    <View style={styles.routeItem}>
                      <View style={[styles.routeMarker, { backgroundColor: Colors.PurpleAccent }]}>
                        <Text style={styles.markerLetter}>B</Text>
                      </View>
                      <View style={styles.routeTextBlock}>
                        <Text style={styles.routeType}>DROP-OFF</Text>
                        <Text style={styles.routePlace}>{currentTrip.dropOffName}</Text>
                      </View>
                    </View>

                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>Status</Text>
                      <View style={styles.assignedBadge}>
                        <Text style={styles.assignedBadgeText}>{currentTrip.status}</Text>
                      </View>
                    </View>

                    <View style={{ height: 12 }} />

                    <TouchableOpacity style={styles.viewDetailsBtn} onPress={onTripMapPress} activeOpacity={0.8}>
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              </AnimatedPressable>
            </Animated.View>

            {/* Upcoming */}
            <Text style={styles.sectionLabel}>UPCOMING</Text>

            <Animated.View style={{ opacity: upcomingAnim, transform: [{ translateY: upcomingSlide }] }}>
              <GlassCard style={{ marginBottom: 12 }}>
                <View style={styles.upcomingCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.upcomingId}>{upcomingTrip.id} · {upcomingTrip.type}</Text>
                    <View style={styles.assignedBadge}>
                      <Text style={styles.assignedBadgeText}>{upcomingTrip.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.upcomingMeta}>
                    {upcomingTrip.currency} {upcomingTrip.amount} · {upcomingTrip.pickupName} → {upcomingTrip.dropOffName} · {upcomingTrip.timeSlot}
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>

        <BottomNavBar
          selected={selectedTab}
          onSelect={tab => {
            setSelectedTab(tab);
            if (tab === 'history') onHistoryPress?.();
          }}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bellContainer: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.AccentRed,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  notifCount: {
    fontSize: 9,
    color: Colors.White,
    fontWeight: '700',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PurpleAccent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...Typography.labelLarge,
    color: Colors.White,
    fontSize: 13,
    fontWeight: '700',
  },
  newAssignmentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(150, 215, 76, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(150, 215, 76, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greenDotSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.PrimaryGreen,
  },
  bannerTitle: {
    ...Typography.labelLarge,
    color: Colors.PrimaryGreen,
    fontWeight: '700',
  },
  bannerSub: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  bannerChevron: {
    fontSize: 22,
    color: Colors.PrimaryGreen,
    fontWeight: '700',
  },
  sectionLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 10,
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestId: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  depositBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  depositBadgeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
  },
  amountLabel: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 8,
  },
  amount: {
    ...Typography.displayLarge,
    color: Colors.White,
    fontWeight: '700',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  markerLetter: {
    ...Typography.labelLarge,
    color: Colors.White,
    fontWeight: '700',
    fontSize: 13,
  },
  routeTextBlock: {
    flex: 1,
  },
  routeType: {
    ...Typography.labelSmall,
    color: Colors.TextDim,
    letterSpacing: 1.2,
  },
  routePlace: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
  },
  statusLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  assignedBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  assignedBadgeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
  },
  viewDetailsBtn: {
    backgroundColor: Colors.PrimaryGreen,
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: 'center',
  },
  viewDetailsText: {
    ...Typography.titleMedium,
    color: Colors.Black,
    fontWeight: '700',
  },
  upcomingCard: {
    padding: 16,
  },
  upcomingId: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
    flex: 1,
  },
  upcomingMeta: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 4,
  },
});
