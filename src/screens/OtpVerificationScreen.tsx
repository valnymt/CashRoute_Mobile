import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  AuraBackground,
  GlassCard,
  TopBar,
  PrimaryButton,
} from '../components';
import { Colors, Typography } from '../theme';
import { useAppDialog } from '../components/AppDialog';
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
  const showDialog = useAppDialog();
  const [feedback, setFeedback] = useState<{ message: string; invalidCode?: boolean } | null>(null);
  const [step, setStep] = useState<'request' | 'enterCode'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [codeFocused, setCodeFocused] = useState(false);
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
      setFeedback(null);
      setIsLoading(true);
      const response = await requestHandoverOtp(cashRequestId, otpStage);
      setOtpId(response.otp_id);
      setExpiresAt(response.expires_at);
      setOtpCode('');
      setStep('enterCode');
    } catch (error) {
      setFeedback({ message: error instanceof Error ? error.message : 'Unable to send OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (isLoading) return;

    if (!otpId) {
      setFeedback({ message: 'Please request an OTP first.' });
      return;
    }

    if (expirySeconds <= 0) {
      setFeedback({ message: 'This code has expired. Request a new verification code.' });
      return;
    }

    if (otpCode.length !== 6) {
      setFeedback({ message: 'Please enter the complete 6-digit code.', invalidCode: true });
      return;
    }

    try {
      setFeedback(null);
      setIsLoading(true);
      const response = await verifyHandoverOtp(
        otpId,
        otpCode,
        currentLocation?.latitude,
        currentLocation?.longitude,
      );

      showDialog('Verification Successful', response.message, [
        {
          text: 'Continue',
          onPress: () => {
            void onVerified();
          },
        },
      ]);
    } catch (error) {
      Keyboard.dismiss();
      setFeedback({ message: error instanceof Error ? error.message : 'Unable to verify OTP.', invalidCode: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'enterCode') {
      // Going back to the request stage clears this OTP locally.
      // The next request expires the previous pending OTP on the backend.
      setFeedback(null);
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
      if (feedback?.invalidCode) setFeedback(null);
    }
  };

  return (
    <AuraBackground>
      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.container}
        >
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
                <GlassCard style={styles.sentCard}>
                  <Text style={styles.sentText}>
                    OTP sent to {cleanContactName} by email.
                  </Text>
                </GlassCard>
                <View style={{ height: 14 }} />
                <Text style={styles.enterCodeTitle}>Enter 6-digit code</Text>
                <View style={{ height: 16 }} />
                <View style={styles.codeEntry}>
                  <View
                    style={styles.otpRow}
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                  >
                    {[0, 1, 2, 3, 4, 5].map(index => {
                      const char = otpCode[index] || '';
                      const isActive = codeFocused && index === otpCode.length;
                      const isFilled = char !== '';
                      return (
                        <View
                          key={index}
                          style={[
                            styles.otpBox,
                            isActive && styles.otpBoxActive,
                            isFilled && styles.otpBoxFilled,
                            feedback?.invalidCode && styles.otpBoxInvalid,
                          ]}
                        >
                          <Text style={[styles.otpChar, feedback?.invalidCode && styles.otpCharInvalid]}>{char}</Text>
                        </View>
                      );
                    })}
                  </View>
                  <TextInput
                    style={styles.codeInput}
                    value={otpCode}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                    onChangeText={handleOtpChange}
                    accessibilityLabel="Six-digit verification code"
                    keyboardType="number-pad"
                    keyboardAppearance="dark"
                    selectionColor="transparent"
                    caretHidden
                    returnKeyType="done"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                  />
                </View>
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
            {!!feedback && (
              <View style={styles.feedback} accessibilityLiveRegion="polite">
                <Text style={styles.feedbackText}>{feedback.message}</Text>
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
        </ScrollView>
      </KeyboardAvoidingView>
    </AuraBackground>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1 },
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 44,
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
    width: 30,
    height: 30,
    borderRadius: 15,
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
    backgroundColor: Colors.PurpleAccent,
  },
  activeStepLabel: {
    color: Colors.White,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.CardBorder,
    marginHorizontal: 12,
  },
  activeLine: {
    backgroundColor: Colors.PrimaryGreen,
  },
  content: {
    flex: 1,
    marginTop: 14,
  },
  requestContent: {
    alignItems: 'center',
  },
  otpCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: Colors.PrimaryGreen,
    backgroundColor: Colors.PurpleAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  otpCircleText: {
    ...Typography.headlineLarge,
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
  sentCard: {
    borderColor: Colors.PrimaryGreen,
    borderRadius: 20,
    backgroundColor: 'rgba(150, 215, 76, 0.08)',
  },
  sentText: {
    ...Typography.bodyMedium,
    color: Colors.PrimaryGreen,
    fontSize: 13,
    padding: 13,
  },
  enterCodeTitle: {
    ...Typography.headlineMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  codeEntry: { position: 'relative' },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  otpBox: {
    flex: 1,
    maxWidth: 50,
    height: 60,
    backgroundColor: Colors.CardSurface,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 18,
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
  otpBoxInvalid: { borderColor: Colors.AccentRed, backgroundColor: Colors.CardSurface },
  otpCharInvalid: { color: Colors.AccentRed },
  otpChar: {
    ...Typography.headlineLarge,
    color: Colors.White,
    fontWeight: '700',
  },
  codeInput: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    color: 'transparent',
    backgroundColor: 'transparent',
    padding: 0,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryBadge: {
    backgroundColor: 'rgba(255, 188, 82, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  expiryBadgeUrgent: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  expiryText: {
    ...Typography.labelLarge,
    fontSize: 13,
    letterSpacing: 0,
    color: '#FFBC52',
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
  feedback: {
    marginTop: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.AccentRed,
    borderRadius: 20,
    backgroundColor: Colors.ErrorSurface,
  },
  feedbackText: { ...Typography.bodySmall, color: Colors.AccentRed },
  footerText: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
    textAlign: 'center',
  },
});
