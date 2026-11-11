import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { AuraBackground, PrimaryButton, SecondaryButton } from '../components';
import { Colors, Typography } from '../theme';
import { useAnimatedMount } from '../hooks/useAnimatedMount';
import { Image } from 'react-native';
import CashRouteLogo from '../assets/images/logo.png';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoAnim = useAnimatedMount(0, 500);
  const formAnim = useAnimatedMount(150, 500);
  const btnAnim = useAnimatedMount(300, 500);

  const handleSignIn = () => {
    if (isLocked || isLoading) return;
    Keyboard.dismiss();
    if (username.trim() && password.trim()) {
      setIsLoading(true);
      setLoginError(null);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess();
      }, 1200);
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setIsLocked(true);
        setLoginError(null);
      } else {
        setLoginError(
          `Incorrect username or password. ${remaining} attempts left before your account is locked.`,
        );
      }
    }
  };

  return (
    <AuraBackground>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.View style={[styles.logoRow, logoAnim]}>
          <View style={styles.logoIconContainer}>
            <Image
              source={CashRouteLogo}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.appName}>CashRoute</Text>
            <Text style={styles.appSubtitle}>DELIVERY TEAM</Text>
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.View style={formAnim}>
          <Text style={styles.signInTitle}>Sign in</Text>
          <Text style={styles.signInSubtitle}>
            For authorized delivery team members only.
          </Text>

          {/* Error card */}
          {loginError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorCardText}>{loginError}</Text>
            </View>
          )}

          {/* Account locked card */}
          {isLocked && (
            <View style={styles.errorCard}>
              <Text style={styles.errorCardText}>
                Account locked after too many failed attempts. Your Super Admin has been notified to unlock it.
              </Text>
            </View>
          )}

          {/* Username */}
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter username"
            placeholderTextColor={Colors.TextDim}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLocked && !isLoading}
          />

          {/* Password */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor={Colors.TextDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!isLocked && !isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.showHideBtn}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
              >
                {showPassword ? (
                  <>
                    {/* Eye with slash */}
                    <Path
                      d="M3 3L21 21"
                      stroke={Colors.PrimaryGreen}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Path
                      d="M10.6 10.6A2 2 0 0013.4 13.4"
                      stroke={Colors.PrimaryGreen}
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <Path
                      d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9.5 7 9.5 7a15.5 15.5 0 01-3.1 3.8M6.2 6.2C3.9 7.8 2.5 12 2.5 12s4 7 9.5 7c1.2 0 2.3-.3 3.3-.8"
                      stroke={Colors.PrimaryGreen}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                ) : (
                  <>
                    {/* Open eye */}
                    <Path
                      d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      stroke={Colors.PrimaryGreen}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <Circle
                      cx={12}
                      cy={12}
                      r={3}
                      stroke={Colors.PrimaryGreen}
                      strokeWidth={2}
                    />
                  </>
                )}
              </Svg>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />

        <Animated.View style={btnAnim}>
          {isLocked ? (
            <>
              <View style={styles.disabledButton}>
                <Text style={styles.disabledButtonText}>Sign in</Text>
              </View>
              <View style={{ height: 16 }} />
              <SecondaryButton
                text="Back to login"
                onPress={() => {
                  setIsLocked(false);
                  setAttemptsLeft(5);
                  setLoginError(null);
                  setUsername('');
                  setPassword('');
                }}
              />
              <View style={{ height: 16 }} />
              <Text style={styles.helpText}>
                Need help? Contact your Super Admin.
              </Text>
            </>
          ) : (
            <>
              <PrimaryButton
                text={isLoading ? 'Signing in...' : 'Sign in'}
                onPress={handleSignIn}
                loading={isLoading}
              />
              {attemptsLeft < 5 && (
                <Text style={styles.demoText}>
                  Demo: {5 - attemptsLeft}th failed attempt
                </Text>
              )}
            </>
          )}
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Footer */}
        <Text style={styles.footer}>
          Internal app · activity is recorded with time and GPS.
        </Text>
      </View>
    </AuraBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextContainer: {
    marginLeft: 12,
  },
  appName: {
    ...Typography.headlineMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  appSubtitle: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 2,
    fontWeight: '700',
  },
  signInTitle: {
    ...Typography.displayLarge,
    color: Colors.White,
    marginTop: 24,
  },
  signInSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderWidth: 1,
    borderColor: Colors.AccentRed,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  errorCardText: {
    ...Typography.bodyMedium,
    color: Colors.AccentRed,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    marginTop: 24,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.InputBg,
    borderWidth: 1,
    borderColor: Colors.InputBorder,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.White,
    fontSize: 14,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.InputBg,
    borderWidth: 1,
    borderColor: Colors.InputBorder,
    borderRadius: 20,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: Colors.White,
    fontSize: 14,
  },
  showHideBtn: {
    paddingHorizontal: 16,
  },
  showHideText: {
    ...Typography.labelLarge,
    color: Colors.PrimaryGreen,
  },
  disabledButton: {
    backgroundColor: 'rgba(150, 215, 76, 0.3)',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButtonText: {
    ...Typography.titleMedium,
    color: 'rgba(0, 0, 0, 0.4)',
    fontWeight: '700',
  },
  demoText: {
    ...Typography.bodyMedium,
    color: Colors.AccentRed,
    textAlign: 'center',
    marginTop: 16,
  },
  helpText: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    textAlign: 'center',
  },
  footer: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
    textAlign: 'center',
  },
});
