import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import { AuraBackground, GlassCard, TopBar, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';

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
  const { currentTrip } = useApp();
  const title = type === 'pickup' ? 'Pickup verification' : 'Drop-off verification';
  const currentStep = type === 'pickup' ? 1 : 2;
  const [isLoading, setIsLoading] = useState(false);

  const contentAnim = useAnimatedMount(100, 400);

  const handleRequestOtp = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onRequestOtp();
    }, 800);
  };

  const handleVerify = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onVerify();
    }, 1000);
  };

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

        <Animated.View style={[styles.content, contentAnim]}>
          {step === 'request' ? (
            <OtpRequestContent type={type} trip={currentTrip} />
          ) : (
            <OtpEnterCodeContent type={type} trip={currentTrip} />
          )}
        </Animated.View>

        {step === 'request' ? (
          <>
            <PrimaryButton
              text={isLoading ? 'Sending...' : 'Request OTP'}
              onPress={handleRequestOtp}
              loading={isLoading}
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
              text={isLoading ? 'Verifying...' : 'Verify'}
              onPress={handleVerify}
              loading={isLoading}
              style={{ marginBottom: 8 }}
            />
            <View style={{ height: 16 }} />
          </>
        )}
      </View>
    </AuraBackground>
  );
};

const OtpRequestContent: React.FC<{ type: OtpType; trip: any }> = ({ type, trip }) => {
  const locationText = type === 'pickup' ? 'pickup' : 'drop-off';
  const contactName = type === 'pickup' ? trip.contactName : trip.dropOffContact;
  const contactInfo = type === 'pickup' ? trip.contactInfo : trip.dropOffContactInfo;

  return (
    <View style={styles.requestContent}>
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

const OtpEnterCodeContent: React.FC<{ type: OtpType; trip: any }> = ({ type, trip }) => {
  const [otpCode, setOtpCode] = useState('');
  const [expirySeconds, setExpirySeconds] = useState(272);
  const [resendSeconds, setResendSeconds] = useState(45);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const inputRef = useRef<any>(null);

  const contactName = type === 'pickup' ? trip.contactName.split(' · ')[0] : trip.dropOffContact.split(' · ')[0];

  useEffect(() => {
    const timer = setInterval(() => {
      setExpirySeconds(prev => (prev > 0 ? prev - 1 : 0));
      setResendSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (text: string) => {
    if (text.length <= 6 && /^\d*$/.test(text)) {
      setOtpCode(text);
      if (text.length === 6 && text !== '123456') {
        triggerShake();
        setAttemptsLeft(prev => Math.max(0, prev - 1));
        setTimeout(() => setOtpCode(''), 600);
      }
    }
  };

  return (
    <View style={styles.codeContent}>
      <GlassCard>
        <Text style={styles.sentText}>OTP sent to {contactName} by SMS and email.</Text>
      </GlassCard>

      <View style={{ height: 24 }} />

      <Text style={styles.enterCodeTitle}>Enter 6-digit code</Text>

      <View style={{ height: 16 }} />

      <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3, 4, 5].map(index => {
          const char = otpCode[index] || '';
          const isActive = index === otpCode.length;
          const isFilled = char !== '';
          return (
            <TouchableInput
              key={index}
              onPress={() => inputRef.current?.focus()}>
              <View
                style={[
                  styles.otpBox,
                  isActive && styles.otpBoxActive,
                  isFilled && styles.otpBoxFilled,
                ]}>
                <Text style={styles.otpChar}>{char}</Text>
              </View>
            </TouchableInput>
          );
        })}
      </Animated.View>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={otpCode}
        onChangeText={handleOtpChange}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
      />

      <View style={{ height: 16 }} />

      <View style={styles.timerRow}>
        <View style={[styles.expiryBadge, expirySeconds < 60 && styles.expiryBadgeUrgent]}>
          <Text style={[styles.expiryText, expirySeconds < 60 && styles.expiryTextUrgent]}>
            Expires in {formatTime(expirySeconds)}
          </Text>
        </View>
        <Text style={[styles.resendText, resendSeconds === 0 && styles.resendReady]}>
          {resendSeconds > 0 ? `Resend in 0:${resendSeconds.toString().padStart(2, '0')}` : 'Resend code'}
        </Text>
      </View>

      <View style={{ height: 16 }} />

      <Text style={styles.attemptsText}>
        Attempts left: {attemptsLeft} of 5 · each attempt is logged with time and GPS.
      </Text>
    </View>
  );
};

const TouchableInput: React.FC<{ onPress: () => void; children: React.ReactNode }> = ({
  onPress,
  children,
}) => (
  <View onTouchEnd={onPress}>{children}</View>
);

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
  otpBoxFilled: {
    borderColor: Colors.PrimaryGreen,
    backgroundColor: 'rgba(150, 215, 76, 0.08)',
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
  expiryBadgeUrgent: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  expiryText: {
    ...Typography.labelLarge,
    color: Colors.PrimaryGreen,
  },
  expiryTextUrgent: {
    color: Colors.AccentRed,
  },
  resendText: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  resendReady: {
    color: Colors.PrimaryGreen,
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
});
