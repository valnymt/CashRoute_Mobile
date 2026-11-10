import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AuraBackground, GlassCard, BottomNavBar } from '../components';
import { Colors, Typography } from '../theme';
import type { BottomNavItem } from '../components';

interface HomeScreenProps {
  onRequestPress: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onRequestPress }) => {
  const [selectedTab, setSelectedTab] = React.useState<BottomNavItem>('assignments');

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good morning</Text>
              <Text style={styles.name}>John Driver</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
          </View>

          {/* Status card */}
          <GlassCard style={{ marginTop: 16 }}>
            <View style={styles.statusCard}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>On Duty · Shift ends 6:00 PM</Text>
            </View>
          </GlassCard>

          {/* Section title */}
          <Text style={styles.sectionTitle}>My Assignments</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Request card */}
            <TouchableOpacity onPress={onRequestPress} activeOpacity={0.8}>
              <GlassCard style={{ marginBottom: 12 }}>
                <View style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Text style={styles.requestId}>REQ-1048</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Pending pickup</Text>
                    </View>
                  </View>
                  <Text style={styles.amount}>MMK 250,000</Text>
                  <View style={styles.routeRow}>
                    <Text style={styles.routeText}>Orchard Branch → HQ Cash Centre</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaText}>1.8 km</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>6 min</Text>
                    <Text style={styles.metaDot}>·</Text>
                    <Text style={styles.metaText}>ETA 10:30 AM</Text>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>

            {/* Second request card */}
            <GlassCard style={{ marginBottom: 12 }}>
              <View style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestId}>REQ-1047</Text>
                  <View style={[styles.badge, styles.completedBadge]}>
                    <Text style={[styles.badgeText, styles.completedText]}>Completed</Text>
                  </View>
                </View>
                <Text style={styles.amount}>MMK 500,000</Text>
                <View style={styles.routeRow}>
                  <Text style={styles.routeText}>Marina Branch → HQ Cash Centre</Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>Delivered at 9:15 AM</Text>
                </View>
              </View>
            </GlassCard>
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
  greeting: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  name: {
    ...Typography.headlineLarge,
    color: Colors.White,
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
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PrimaryGreen,
    marginRight: 10,
  },
  statusText: {
    ...Typography.bodyMedium,
    color: Colors.White,
  },
  sectionTitle: {
    ...Typography.headlineMedium,
    color: Colors.White,
    marginTop: 24,
    marginBottom: 12,
  },
  requestCard: {
    padding: 20,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestId: {
    ...Typography.labelLarge,
    color: Colors.TextSecondary,
  },
  badge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
  },
  completedBadge: {
    backgroundColor: 'rgba(160, 160, 176, 0.15)',
  },
  completedText: {
    color: Colors.TextSecondary,
  },
  amount: {
    ...Typography.headlineLarge,
    color: Colors.White,
    marginTop: 8,
  },
  routeRow: {
    marginTop: 8,
  },
  routeText: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  metaText: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
  },
  metaDot: {
    color: Colors.TextDim,
    marginHorizontal: 6,
  },
});
