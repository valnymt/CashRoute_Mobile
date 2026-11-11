import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useScaleAnimation, useAnimatedMount } from '../hooks/useAnimatedMount';

interface PickupVerifiedScreenProps {
  onBackClick: () => void;
  onContinueToDropOff: () => void;
}

export const PickupVerifiedScreen: React.FC<PickupVerifiedScreenProps> = ({
  onBackClick,
  onContinueToDropOff,
}) => {
  const { currentTrip } = useApp();
  const checkAnim = useScaleAnimation();
  const contentAnim = useAnimatedMount(300, 500);

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={{ height: 48 }} />

        <Animated.View style={[styles.checkCircle, { transform: checkAnim.transform }]}>
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
        </Animated.View>

        <View style={{ height: 24 }} />

        <Animated.View style={contentAnim}>
          <Text style={styles.title}>Pickup handover verified</Text>
          <Text style={styles.subtitle}>
            Cash collected from {currentTrip.pickupName}. Verification recorded with time and GPS.
          </Text>

          <View style={{ height: 32 }} />

          <GlassCard>
            <VerifiedInfoRow label="Request" value={currentTrip.id} showBorder />
            <VerifiedInfoRow label="Collected" value={`${currentTrip.currency} ${currentTrip.amount}`} showBorder />
            <VerifiedInfoRow label="Verified by OTP" value={`WaiYan · ${timeStr}`} showBorder />
            <VerifiedInfoRow label="Next stop" value={currentTrip.dropOffName} />
          </GlassCard>
        </Animated.View>

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
