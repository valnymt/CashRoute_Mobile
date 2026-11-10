import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';

interface ProofOfDeliveryScreenProps {
  onBackClick: () => void;
  onSubmitProof: () => void;
}

export const ProofOfDeliveryScreen: React.FC<ProofOfDeliveryScreenProps> = ({
  onBackClick,
  onSubmitProof,
}) => {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Proof of delivery" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ height: 12 }} />

          {/* Confirm received amount */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.greenLabel}>CONFIRM RECEIVED AMOUNT</Text>
              <Text style={styles.amount}>MMK 250,000</Text>
              <View style={styles.checkRow}>
                <Text style={styles.checkIcon}>☑</Text>
                <Text style={styles.confirmText}>
                  I confirm the full amount was handed over
                </Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Denominations */}
          <GlassCard>
            <View style={styles.cardContent}>
              <Text style={styles.sectionTitle}>Denominations (provided)</Text>
              <View style={{ height: 12 }} />
              <DenominationRow text="10k x 15" />
              <View style={{ height: 8 }} />
              <DenominationRow text="5k x 20" />
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Photo */}
          <GlassCard>
            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Photo</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>Required</Text>
                </View>
              </View>
              <View style={{ height: 12 }} />
              <View style={styles.photoRow}>
                <View style={styles.photo1}>
                  <Text style={styles.photo1Text}>Photo 1 ✓</Text>
                </View>
                <View style={styles.photo2}>
                  <Text style={styles.addPhotoText}>+ Add photo</Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 12 }} />

          {/* Signature */}
          <GlassCard>
            <View style={styles.cardContent}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Receiver signature</Text>
                <View style={styles.optionalBadge}>
                  <Text style={styles.optionalText}>Optional</Text>
                </View>
              </View>
              <View style={{ height: 12 }} />
              <View style={styles.signatureBox}>
                <Text style={styles.signText}>Sign here</Text>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 24 }} />
        </ScrollView>

        <PrimaryButton
          text="Submit Proof"
          onPress={onSubmitProof}
          style={{ marginBottom: 24 }}
        />
      </View>
    </AuraBackground>
  );
};

const DenominationRow: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.denomRow}>
    <Text style={styles.checkIcon}>☑</Text>
    <Text style={styles.denomText}>{text}</Text>
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
  },
  cardContent: {
    padding: 20,
  },
  greenLabel: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
  },
  amount: {
    ...Typography.displayLarge,
    color: Colors.White,
    fontWeight: '700',
    fontSize: 36,
    marginTop: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkIcon: {
    fontSize: 20,
    color: Colors.PrimaryGreen,
    marginRight: 8,
  },
  confirmText: {
    ...Typography.bodyMedium,
    color: Colors.White,
  },
  sectionTitle: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  denomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  denomText: {
    ...Typography.bodyMedium,
    color: Colors.White,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requiredBadge: {
    backgroundColor: Colors.CardSurface,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  requiredText: {
    ...Typography.labelLarge,
    color: Colors.AccentRed,
  },
  optionalBadge: {
    backgroundColor: Colors.CardSurface,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  optionalText: {
    ...Typography.labelLarge,
    color: Colors.TextSecondary,
  },
  photoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photo1: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(114, 28, 184, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(114, 28, 184, 0.6)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo1Text: {
    ...Typography.bodySmall,
    color: Colors.PrimaryGreen,
  },
  photo2: {
    width: 150,
    height: 150,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 16,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  signatureBox: {
    height: 80,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signText: {
    ...Typography.bodyMedium,
    color: Colors.TextDim,
  },
});
