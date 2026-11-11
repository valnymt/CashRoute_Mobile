import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AuraBackground, GlassCard, PrimaryButton, SecondaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useScaleAnimation, useAnimatedMount } from '../hooks/useAnimatedMount';

interface RequestCompletedScreenProps {
  onBackClick: () => void;
  onBackToAssignments: () => void;
}

export const RequestCompletedScreen: React.FC<RequestCompletedScreenProps> = ({
  onBackClick,
  onBackToAssignments,
}) => {
  const { currentTrip } = useApp();
  const checkAnim = useScaleAnimation();
  const contentAnim = useAnimatedMount(300, 500);

  return (
    <AuraBackground>
      <View style={styles.container}>
        <View style={{ height: 48 }} />

        <Animated.View style={contentAnim}>
          <Text style={styles.title}>Request completed</Text>
          <Text style={styles.subtitle}>
            {currentTrip.id} · {currentTrip.currency} {currentTrip.amount} delivered to {currentTrip.dropOffName}.
          </Text>
        </Animated.View>

        <View style={{ height: 24 }} />

        <Animated.View style={[styles.successCircle, { transform: checkAnim.transform }]}>
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

        <View style={{ height: 32 }} />

        <Animated.View style={contentAnim}>
          <GlassCard>
            <SummaryRow label="Final OTP verified" value="✓" showBorder />
            <SummaryRow label="Proof of delivery saved" value="✓" showBorder />
            <SummaryRow label="Location sharing" value="Stopped" />
          </GlassCard>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <PrimaryButton
          text="Back to assignments"
          onPress={onBackToAssignments}
          style={{ marginBottom: 12 }}
        />
        <SecondaryButton
          text="View trip history"
          onPress={onBackClick}
          style={{ marginBottom: 24 }}
        />
      </View>
    </AuraBackground>
  );
};

const SummaryRow: React.FC<{
  label: string;
  value: string;
  showBorder?: boolean;
}> = ({ label, value, showBorder }) => (
  <View style={[styles.row, showBorder && styles.rowBorder]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
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
  title: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 28,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(150, 215, 76, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.09)',
  },
  rowLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  rowValue: {
    ...Typography.bodyMedium,
    color: Colors.White,
    fontWeight: '600',
  },
});
