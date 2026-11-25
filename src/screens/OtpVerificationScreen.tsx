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
  Linking,
  Pressable,
} from 'react-native';
import {
  AuraBackground,
  GlassCard,
  TopBar,
  PrimaryButton,
} from '../components';
import { Colors, Typography } from '../theme';
import { useAppDialog } from '../components/AppDialog';

import { useAnimatedMount } from '../hooks/useAnimatedMount';
import {
  getHandoverContact,
  requestHandoverOtp,
  type HandoverContact,
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

  const showDialog = useAppDialog();
  const [feedback, setFeedback] = useState<{ message: string; invalidCode?: boolean } | null>(null);
  const [step, setStep] = useState<'request' | 'enterCode'>('request');
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpId, setOtpId] = useState<number | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [codeFocused, setCodeFocused] = useState(false);
  const [contact, setContact] = useState<HandoverContact | null>(null);
  const [contactError, setContactError] = useState(false);
  const [contactRetry, setContactRetry] = useState(0);
  const contentAnim = useAnimatedMount(100, 400);

  const title = type === 'pickup' ? 'Pickup verification' : 'Drop-off verification';
  const currentStep = type === 'pickup' ? 1 : 2;
  const otpStage = type === 'pickup' ? 'pickup' : 'dropoff';
  const email = contact?.email;
  const phone = contact?.phone;
  const dialNumber = phone?.replace(/[^+\d]/g, '');
  const canCall = dialNumber && /^\+?\d+$/.test(dialNumber);
  const contactCard = (
    <GlassCard style={styles.contactPanel}>
      <View style={styles.contactCard}>
        <Text style={styles.contactName}>{contact?.name || 'Handover contact'}</Text>
        <Text style={styles.sendingToLabel}>{contact?.is_test_recipient ? 'OTP test inbox' : 'OTP email'}</Text>
        <Text selectable style={styles.contactInfo}>
          {email || (contact ? 'Email address missing' : contactError ? 'Unable to load the email address' : 'Loading contact details…')}
        </Text>
        {contactError && (
          <Pressable style={styles.contactAction} accessibilityRole="button" onPress={() => setContactRetry(value => value + 1)}>
            <Text style={styles.contactActionText}>Retry</Text>
          </Pressable>
        )}
        {canCall && (
          <Pressable style={styles.contactAction} accessibilityRole="button"
            onPress={() => void Linking.openURL('tel:' + dialNumber).catch(() =>
              showDialog('Unable to open the dialer', 'Call this number manually: ' + phone))}>
            <Text style={styles.contactActionText}>Call {phone}</Text>
          </Pressable>
        )}
      </View>
    </GlassCard>
  );

  useEffect(() => {
    const controller = new AbortController();
    setContact(null);
    setContactError(false);
    getHandoverContact(cashRequestId, otpStage, controller.signal)
      .then(result => { if (!controller.signal.aborted) setContact(result); })
      .catch(() => { if (!controller.signal.aborted) setContactError(true); });
    return () => controller.abort();
  }, [cashRequestId, otpStage, contactRetry]);

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
      setContact(response.contact);
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
                <Text style={styles.verifyTitle}>
                  Verify handover at {type === 'pickup' ? 'pickup' : 'drop-off'}
                </Text>
                {contactCard}
              </View>
            ) : (
              <View style={styles.codeContent}>
                {contactCard}
                <View style={{ height: 18 }} />
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
                disabled={!email}
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
    width: '100%',
  },
  verifyTitle: {
    ...Typography.headlineLarge,
    color: Colors.White,
    textAlign: 'center',
  },
  sendingToLabel: {
    ...Typography.labelSmall,
    color: Colors.PrimaryGreen,
    marginTop: 14,
    marginBottom: 4,
  },
  contactPanel: { width: '100%', marginTop: 16 },
  contactCard: {
    padding: 20,
  },
  contactName: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '600',
  },
  contactInfo: {
    ...Typography.bodyMedium,
    color: Colors.White,
  },
  contactAction: {
    minHeight: 48,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginTop: 8,
  },
  contactActionText: {
    ...Typography.bodyMedium,
    color: Colors.PrimaryGreen,
    fontWeight: '600',
  },
  codeContent: {
    width: '100%',
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
