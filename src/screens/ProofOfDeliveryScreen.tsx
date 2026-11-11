import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';

interface ProofOfDeliveryScreenProps {
  onBackClick: () => void;
  onSubmitProof: () => void;
}

export const ProofOfDeliveryScreen: React.FC<ProofOfDeliveryScreenProps> = ({
  onBackClick,
  onSubmitProof,
}) => {
  const { currentTrip } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const card1Anim = useAnimatedMount(0, 350);
  const card2Anim = useAnimatedMount(80, 350);
  const card3Anim = useAnimatedMount(160, 350);
  const card4Anim = useAnimatedMount(240, 350);

  const canSubmit = confirmed && photoTaken;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitProof();
    }, 1200);
  };

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Proof of delivery" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ height: 12 }} />

          <Animated.View style={card1Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.greenLabel}>CONFIRM RECEIVED AMOUNT</Text>
                <Text style={styles.amount}>{currentTrip.currency} {currentTrip.amount}</Text>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setConfirmed(!confirmed)}
                  activeOpacity={0.7}>
                  <View style={[styles.checkbox, confirmed && styles.checkboxChecked]}>
                    {confirmed && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.confirmText}>
                    I confirm the full amount was handed over
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card2Anim}>
            <GlassCard>
              <View style={styles.cardContent}>
                <Text style={styles.sectionTitle}>Denominations (provided)</Text>
                <View style={{ height: 12 }} />
                <DenominationRow text="10k x 15" />
                <View style={{ height: 8 }} />
                <DenominationRow text="5k x 20" />
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card3Anim}>
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
                  {photoTaken ? (
                    <View style={styles.photo1}>
                      <Text style={styles.photo1Text}>Photo 1 ✓</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.photo2}
                      onPress={() => setPhotoTaken(true)}
                      activeOpacity={0.7}>
                      <Text style={styles.cameraIcon}>📷</Text>
                      <Text style={styles.addPhotoText}>Take photo</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.photo2} activeOpacity={0.7}>
                    <Text style={styles.addPhotoText}>+ Add photo</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={{ height: 12 }} />

          <Animated.View style={card4Anim}>
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
          </Animated.View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <PrimaryButton
          text={isSubmitting ? 'Submitting...' : 'Submit Proof'}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit}
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
    marginTop: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.CardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.PrimaryGreen,
    borderColor: Colors.PrimaryGreen,
  },
  checkMark: {
    color: Colors.Black,
    fontSize: 14,
    fontWeight: '700',
  },
  checkIcon: {
    fontSize: 20,
    color: Colors.PrimaryGreen,
    marginRight: 8,
  },
  confirmText: {
    ...Typography.bodyMedium,
    color: Colors.White,
    flex: 1,
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
  cameraIcon: {
    fontSize: 28,
    marginBottom: 4,
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
