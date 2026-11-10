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
          {/* Amount card */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.label}>AMOUNT</Text>
              <Text style={styles.amount}>MMK 250,000</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Pending pickup</Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Route card */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.sectionLabel}>Route</Text>
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: Colors.PrimaryGreen }]} />
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeTitle}>Orchard Branch</Text>
                  <Text style={styles.routeAddr}>238 Orchard Rd, Yangon</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: Colors.PurpleAccent }]} />
                <View style={styles.routeTextContainer}>
                  <Text style={styles.routeTitle}>HQ Cash Centre</Text>
                  <Text style={styles.routeAddr}>1 Raffles Quay, Yangon</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Details card */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.sectionLabel}>Details</Text>
              <DetailRow label="Request" value="REQ-1048" />
              <DetailRow label="Distance" value="1.8 km" />
              <DetailRow label="Est. time" value="6 min" />
              <DetailRow label="Denominations" value="10k x 15, 5k x 20" />
            </View>
          </GlassCard>

          <View style={{ height: 24 }} />
        </ScrollView>

        <PrimaryButton
          text="Start trip"
          onPress={onStartTrip}
          style={{ marginBottom: 24 }}
        />
      </View>
    </AuraBackground>
  );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
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
    marginTop: 12,
  },
  cardContent: {
    padding: 20,
  },
  label: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },
  amount: {
    ...Typography.displayLarge,
    color: Colors.White,
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.PrimaryGreen,
    marginRight: 8,
  },
  statusText: {
    ...Typography.bodyMedium,
    color: Colors.PrimaryGreen,
  },
  sectionLabel: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '600',
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeTextContainer: {
    flex: 1,
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
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: Colors.CardBorder,
    marginLeft: 5,
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  detailLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  detailValue: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
});
