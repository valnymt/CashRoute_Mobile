import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';

export type OtpStep = 'request' | 'enterCode';
export type OtpType = 'pickup' | 'dropOff';

interface OtpVerificationScreenProps {
  step: OtpStep;
  type: OtpType;
  onBackClick: () => void;
  onRequestOtp: () => void;
  onVerify: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  step,
  type,
  onBackClick,
  onRequestOtp,
  onVerify,
}) => {
  const title = type === 'pickup' ? 'Pickup verification' : 'Drop-off verification';
  const currentStep = type === 'pickup' ? 1 : 2;

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title={title} onBackClick={onBackClick} />

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, styles.activeStep]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={[styles.stepLabel, styles.activeStepLabel]}>Pickup</Text>
          </View>
          <View style={[styles.stepLine, currentStep >= 2 && styles.activeLine]} />
          <View style={styles.stepItem}>
            <View style={[styles.stepNumber, currentStep >= 2 && styles.activeStep]}>
              <Text style={[styles.stepNumberText, currentStep < 2 && styles.inactiveStepText]}>2</Text>
            </View>
            <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>Drop-off</Text>
          </View>
        </View>

        <View style={styles.content}>
          {step === 'request' ? (
            <OtpRequestContent type={type} />
          ) : (
            <OtpEnterCodeContent />
          )}
        </View>

        {step === 'request' ? (
          <>
            <PrimaryButton
              text="Request OTP"
              onPress={onRequestOtp}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.footerText}>
              Max 5 attempts. Every attempt is recorded.
            </Text>
            <View style={{ height: 16 }} />
          </>
        ) : (
          <>
            <PrimaryButton
              text="Verify"
              onPress={onVerify}
              style={{ marginBottom: 8 }}
            />
            <Text style={styles.demoErrorRed}>Demo: wrong code</Text>
            <Text style={styles.demoErrorRed}>Demo: code expired</Text>
            <View style={{ height: 16 }} />
          </>
        )}
      </View>
    </AuraBackground>
  );
};

const OtpRequestContent: React.FC<{ type: OtpType }> = ({ type }) => {
  const locationText = type === 'pickup' ? 'pickup' : 'drop-off';
  const contactName =
    type === 'pickup'
      ? 'Amy Tan · Orchard Branch'
      : 'Ops Desk · HQ Cash Centre';
  const contactInfo =
    type === 'pickup'
      ? 'SMS +95912345678 · a•••@bank.com'
      : 'SMS +95987654321 · ops•••@bank.com';

  return (
    <View style={styles.requestContent}>
      {/* OTP circle */}
      <View style={styles.otpCircle}>
        <Text style={styles.otpCircleText}>OTP</Text>
      </View>

      <Text style={styles.verifyTitle}>Verify handover at {locationText}</Text>
      <Text style={styles.verifyDesc}>
        A one-time code will be sent to the registered contact at this location.
      </Text>

      <View style={{ height: 24 }} />

      <GlassCard>
        <View style={styles.contactCard}>
          <Text style={styles.sendingToLabel}>SENDING TO</Text>
          <Text style={styles.contactName}>{contactName}</Text>
          <Text style={styles.contactInfo}>{contactInfo}</Text>
        </View>
      </GlassCard>
    </View>
  );
};

const OtpEnterCodeContent: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');

  return (
    <View style={styles.codeContent}>
      <GlassCard>
        <Text style={styles.sentText}>OTP sent to Amy Tan by SMS and email.</Text>
      </GlassCard>

      <View style={{ height: 24 }} />

      <Text style={styles.enterCodeTitle}>Enter 6-digit code</Text>

      <View style={{ height: 16 }} />

      {/* OTP boxes */}
      <View style={styles.otpRow}>
        {[0, 1, 2, 3, 4, 5].map(index => {
          const char = otpCode[index] || '';
          const isActive = index === otpCode.length;
          return (
            <View
              key={index}
              style={[
                styles.otpBox,
                isActive && styles.otpBoxActive,
              ]}>
              <Text style={styles.otpChar}>{char}</Text>
            </View>
          );
        })}
      </View>

      {/* Hidden input */}
      <TextInput
        style={styles.hiddenInput}
        value={otpCode}
        onChangeText={text => {
          if (text.length <= 6 && /^\d*$/.test(text)) {
            setOtpCode(text);
          }
        }}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      <View style={{ height: 16 }} />

      <View style={styles.timerRow}>
        <View style={styles.expiryBadge}>
          <Text style={styles.expiryText}>Expires in 04:32</Text>
        </View>
        <Text style={styles.resendText}>Resend in 0:45</Text>
      </View>

      <View style={{ height: 16 }} />

      <Text style={styles.attemptsText}>
        Attempts left: 5 of 5 · each attempt is logged with time and GPS.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.CardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  stepNumberText: {
    ...Typography.labelSmall,
    color: Colors.White,
    fontWeight: '700',
    fontSize: 11,
  },
  inactiveStepText: {
    color: Colors.TextDim,
  },
  stepLabel: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
  },
  activeStep: {
    backgroundColor: Colors.PrimaryGreen,
  },
  activeStepLabel: {
    color: Colors.White,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.CardBorder,
    marginHorizontal: 12,
  },
  activeLine: {
    backgroundColor: Colors.PrimaryGreen,
  },
  content: {
    flex: 1,
    marginTop: 24,
  },
  requestContent: {
    alignItems: 'center',
  },
  otpCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.PrimaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  otpCircleText: {
    ...Typography.titleLarge,
    color: Colors.PrimaryGreen,
  },
  verifyTitle: {
    ...Typography.headlineLarge,
    color: Colors.White,
    textAlign: 'center',
  },
  verifyDesc: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  sendingToLabel: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  contactCard: {
    padding: 16,
  },
  contactName: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  contactInfo: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 4,
  },
  codeContent: {
    width: '100%',
  },
  sentText: {
    ...Typography.bodyMedium,
    color: Colors.White,
    padding: 16,
  },
  enterCodeTitle: {
    ...Typography.headlineMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 48,
    height: 52,
    backgroundColor: Colors.CardSurface,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: Colors.PrimaryGreen,
  },
  otpChar: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  expiryText: {
    ...Typography.labelLarge,
    color: Colors.PrimaryGreen,
  },
  resendText: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  attemptsText: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
  },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
    textAlign: 'center',
  },
  demoErrorRed: {
    ...Typography.bodyMedium,
    color: Colors.AccentRed,
    textAlign: 'center',
    marginTop: 8,
  },
});
