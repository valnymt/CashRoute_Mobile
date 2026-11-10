import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';

interface PickupVerifiedScreenProps {
  onBackClick: () => void;
  onContinueToDropOff: () => void;
}

export const PickupVerifiedScreen: React.FC<PickupVerifiedScreenProps> = ({
  onBackClick,
  onContinueToDropOff,
}) => {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar
          title="Pickup verification"
          onBackClick={onBackClick}
        />

        <View style={{ height: 32 }} />

        {/* Success checkmark */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <View style={{ height: 24 }} />

        <Text style={styles.title}>Pickup handover verified</Text>
        <Text style={styles.subtitle}>
          Cash collected from Orchard Branch. Verification recorded with time and GPS.
        </Text>

        <View style={{ height: 32 }} />

        {/* Verified info card */}
        <GlassCard>
          <VerifiedInfoRow label="Request" value="REQ-1048" showBorder />
          <VerifiedInfoRow label="Amount" value="MMK 250,000" showBorder />
          <VerifiedInfoRow label="Pickup" value="Orchard Branch" showBorder />
          <VerifiedInfoRow label="Verified at" value="10:22 AM" />
        </GlassCard>

        <View style={{ flex: 1 }} />

        <PrimaryButton
          text="Continue to drop-off"
          onPress={onContinueToDropOff}
          style={{ marginBottom: 24 }}
        />
      </View>
    </AuraBackground>
  );
};

const VerifiedInfoRow: React.FC<{
  label: string;
  value: string;
  showBorder?: boolean;
}> = ({ label, value, showBorder }) => (
  <View style={[styles.infoRow, showBorder && styles.infoRowBorder]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 24,
    alignItems: 'center',
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(150, 215, 76, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 36,
    color: Colors.PrimaryGreen,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
  },
  infoLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  infoValue: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
});
