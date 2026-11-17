import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import {
  AuraBackground,
  GlassCard,
  TopBar,
  PrimaryButton,
} from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';
import { useAnimatedMount } from '../hooks/useAnimatedMount';
import {
  requestHandoverOtp,
  verifyHandoverOtp,
} from '../services/otp';

export type OtpType = 'pickup' | 'dropOff';

interface OtpVerificationScreenProps {
  type: OtpType;
  cashRequestId: number;
  currentLocation?: {
    latitude: number;
    longitude: number;
  } | null;
  onBackClick: () => void;
  onVerified: () => void | Promise<void>;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  type,
  cashRequestId,
  currentLocation,
  onBackClick,
  onVerified,
}) => {
  const { currentTrip } = useApp();
  const [step, setStep] = useState<'request' | 'enterCode'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const inputRef = useRef<TextInput>(null);
  const contentAnim = useAnimatedMount(100, 400);

  const title = type === 'pickup' ? 'Pickup verification' : 'Drop-off verification';
  const currentStep = type === 'pickup' ? 1 : 2;
  const otpStage = type === 'pickup' ? 'pickup' : 'dropoff';

  useEffect(() => {
    if (!expiresAt) {
      setExpirySeconds(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setExpirySeconds(remaining);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  const formatTime = useCallback((secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handleRequestOtp = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const response = await requestHandoverOtp(cashRequestId, otpStage);
      setOtpId(response.otp_id);
      setExpiresAt(response.expires_at);
      setOtpCode('');
      setStep('enterCode');
      Alert.alert(
        'OTP Sent',
        'A verification code has been sent to the registered email address.',
      );
    } catch (error) {
      Alert.alert(
        'OTP Error',
        error instanceof Error ? error.message : 'Unable to send OTP.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (isLoading) return;

    if (!otpId) {
      Alert.alert('OTP Error', 'Please request an OTP first.');
      return;
    }

    if (expirySeconds <= 0) {
      Alert.alert('OTP Expired', 'Please request a new verification code.');
      return;
    }

    if (otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the complete 6-digit code.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await verifyHandoverOtp(
        otpId,
        otpCode,
        currentLocation?.latitude,
        currentLocation?.longitude,
      );

      Alert.alert('Verification Successful', response.message, [
        {
          text: 'Continue',
          onPress: () => {
            void onVerified();
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        error instanceof Error ? error.message : 'Unable to verify OTP.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'enterCode') {
      // Going back to the request stage clears this OTP locally.
      // The next request expires the previous pending OTP on the backend.
      setStep('request');
      setOtpId(null);
      setExpiresAt(null);
      setOtpCode('');
      return;
    }
    onBackClick();
  };

  const contactName =
    type === 'pickup'
      ? currentTrip?.contactName
      : currentTrip?.dropOffContact;
  const contactInfo =
    type === 'pickup'
      ? currentTrip?.contactInfo
      : currentTrip?.dropOffContactInfo;
  const cleanContactName = contactName?.split(' · ')[0] || 'registered contact';

  const handleOtpChange = (text: string) => {
    if (/^\d{0,6}$/.test(text)) {
      setOtpCode(text);
    }
  };

  const shakeAnim = useRef(new Animated.Value(0)).current;

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title={title} onBackClick={handleBack} />

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
            <View style={styles.requestContent}>
              <View style={styles.otpCircle}>
                <Text style={styles.otpCircleText}>OTP</Text>
              </View>
              <Text style={styles.verifyTitle}>
                Verify handover at {type === 'pickup' ? 'pickup' : 'drop-off'}
              </Text>
              <Text style={styles.verifyDesc}>
                A one-time code will be sent to the registered contact at this location.
              </Text>
              <View style={{ height: 24 }} />
              <GlassCard>
                <View style={styles.contactCard}>
                  <Text style={styles.sendingToLabel}>SENDING TO</Text>
                  <Text style={styles.contactName}>{contactName || 'Registered contact'}</Text>
                  <Text style={styles.contactInfo}>{contactInfo || 'Registered email address'}</Text>
                </View>
              </GlassCard>
            </View>
          ) : (
            <View style={styles.codeContent}>
              <GlassCard>
                <Text style={styles.sentText}>
                  OTP sent to {cleanContactName} by email.
                </Text>
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
                    <View
                      key={index}
                      onTouchEnd={() => inputRef.current?.focus()}
                      style={[
                        styles.otpBox,
                        isActive && styles.otpBoxActive,
                        isFilled && styles.otpBoxFilled,
                      ]}
                    >
                      <Text style={styles.otpChar}>{char}</Text>
                    </View>
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
                    {expirySeconds > 0 ? `Expires in ${formatTime(expirySeconds)}` : 'OTP expired'}
                  </Text>
                </View>
              </View>
              <View style={{ height: 16 }} />
              <Text style={styles.attemptsText}>
                Maximum 3 verification attempts. Each attempt is recorded with time and GPS.
              </Text>
            </View>
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
              OTP expires after 5 minutes. Maximum 3 verification attempts.
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
