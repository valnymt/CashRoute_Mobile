import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, BottomNavBar } from '../components';
import { Colors, Typography } from '../theme';
import type { BottomNavItem } from '../components';

interface HomeScreenProps {
  onRequestPress: () => void;
  onNotificationsPress?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onRequestPress, onNotificationsPress }) => {
  const [selectedTab, setSelectedTab] = React.useState<BottomNavItem>('assignments');

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
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
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>NYM</Text>
              </View>
            </View>
          </View>

          {/* New assignment banner */}
          <TouchableOpacity onPress={onRequestPress} activeOpacity={0.8}>
            <View style={styles.newAssignmentBanner}>
              <View style={styles.bannerLeft}>
                <View style={styles.greenDotSmall} />
                <View>
                  <Text style={styles.bannerTitle}>New assignment</Text>
                  <Text style={styles.bannerSub}>REQ-1048 · Deposit · tap to view</Text>
                </View>
              </View>
              <Text style={styles.bannerChevron}>›</Text>
            </View>
          </TouchableOpacity>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Current Trip */}
            <Text style={styles.sectionLabel}>CURRENT TRIP</Text>

            <TouchableOpacity onPress={onRequestPress} activeOpacity={0.8}>
              <GlassCard style={{ marginBottom: 12 }}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.requestId}>REQ-1048</Text>
                    <View style={styles.depositBadge}>
                      <Text style={styles.depositBadgeText}>Deposit</Text>
                    </View>
                  </View>

                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amount}>MMK 250,000</Text>

                  <View style={{ height: 12 }} />

                  {/* Route */}
                  <View style={styles.routeItem}>
                    <View style={[styles.routeMarker, { backgroundColor: Colors.PrimaryGreen }]}>
                      <Text style={styles.markerLetter}>A</Text>
                    </View>
                    <View style={styles.routeTextBlock}>
                      <Text style={styles.routeType}>PICKUP</Text>
                      <Text style={styles.routePlace}>Orchard Branch</Text>
                    </View>
                  </View>
                  <View style={styles.routeItem}>
                    <View style={[styles.routeMarker, { backgroundColor: Colors.PurpleAccent }]}>
                      <Text style={styles.markerLetter}>B</Text>
                    </View>
                    <View style={styles.routeTextBlock}>
                      <Text style={styles.routeType}>DROP-OFF</Text>
                      <Text style={styles.routePlace}>HQ Cash Centre</Text>
                    </View>
                  </View>

                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <View style={styles.assignedBadge}>
                      <Text style={styles.assignedBadgeText}>Assigned</Text>
                    </View>
                  </View>

                  <View style={{ height: 12 }} />

                  <TouchableOpacity style={styles.viewDetailsBtn} onPress={onRequestPress}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>
            </TouchableOpacity>

            {/* Upcoming */}
            <Text style={styles.sectionLabel}>UPCOMING</Text>

            <GlassCard style={{ marginBottom: 12 }}>
              <View style={styles.upcomingCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.upcomingId}>REQ-1053 · Withdrawal</Text>
                  <View style={styles.assignedBadge}>
                    <Text style={styles.assignedBadgeText}>Assigned</Text>
                  </View>
                </View>
                <Text style={styles.upcomingMeta}>
                  SGD 120,000 · HQ → Tampines · 15 Oct, 13:00
                </Text>
              </View>
            </GlassCard>

            <View style={{ height: 16 }} />
          </ScrollView>
        </View>

        <BottomNavBar selected={selectedTab} onSelect={setSelectedTab} />
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
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PrimaryGreen,
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
