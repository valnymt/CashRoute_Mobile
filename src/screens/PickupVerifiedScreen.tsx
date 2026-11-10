import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, PrimaryButton } from '../components';
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
        <View style={{ height: 48 }} />

        {/* Success checkmark */}
        <View style={styles.checkCircle}>
          <Svg width={40} height={40} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 13l4 4L19 7"
              stroke={Colors.PrimaryGreen}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
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
          <VerifiedInfoRow label="Collected" value="MMK 250,000" showBorder />
          <VerifiedInfoRow label="Verified by OTP" value="WaiYan · 09:29" showBorder />
          <VerifiedInfoRow label="Next stop" value="HQ Cash Centre" />
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
    borderWidth: 2,
    borderColor: 'rgba(150, 215, 76, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
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
