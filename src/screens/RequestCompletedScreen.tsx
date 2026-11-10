import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';

interface RequestCompletedScreenProps {
  onBackClick: () => void;
  onBackToAssignments: () => void;
}

export const RequestCompletedScreen: React.FC<RequestCompletedScreenProps> = ({
  onBackClick,
  onBackToAssignments,
}) => {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Request completed" onBackClick={onBackClick} />

        <View style={{ height: 32 }} />

        {/* Success icon */}
        <View style={styles.successCircle}>
          <Text style={styles.checkmark}>✓</Text>
        </View>

        <View style={{ height: 24 }} />

        <Text style={styles.title}>Request completed</Text>
        <Text style={styles.subtitle}>
          Cash delivery verified and recorded. Proof submitted.
        </Text>

        <View style={{ height: 32 }} />

        {/* Summary card */}
        <GlassCard>
          <SummaryRow label="Request" value="REQ-1048" showBorder />
          <SummaryRow label="Amount" value="MMK 250,000" showBorder />
          <SummaryRow label="From" value="Orchard Branch" showBorder />
          <SummaryRow label="To" value="HQ Cash Centre" showBorder />
          <SummaryRow label="Completed" value="10:45 AM" />
        </GlassCard>

        <View style={{ flex: 1 }} />

        <PrimaryButton
          text="Back to assignments"
          onPress={onBackToAssignments}
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
  successCircle: {
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
