import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { login } from '../services/authApi';
import { ApiError } from '../services/api';
import { saveToken } from '../services/authStorage';
import { AuraBackground, PrimaryButton, SecondaryButton } from '../components';
import { Colors } from '../theme';
import { useAnimatedMount } from '../hooks/useAnimatedMount';
import { styles } from './LoginScreen.styles';
import { Image } from 'react-native';
import CashRouteLogo from '../assets/images/logo.png';
interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoAnim = useAnimatedMount(0, 500);
  const formAnim = useAnimatedMount(150, 500);
  const btnAnim = useAnimatedMount(300, 500);

  // const handleSignIn = () => {
  //   if (isLocked || isLoading) return;
  //   Keyboard.dismiss();
  //   if (username.trim() && password.trim()) {
  //     setIsLoading(true);
  //     setLoginError(null);
  //     setTimeout(() => {
  //       setIsLoading(false);
  //       onLoginSuccess();
  //     }, 1200);
  //     return;
  //   }
  //   const remaining = attemptsLeft - 1;
  //   setAttemptsLeft(remaining);
  //   if (remaining <= 0) {
  //     setIsLocked(true);
  //     setLoginError(null);
  //   } else {
  //     setLoginError(
  //       `Incorrect username or password. ${remaining} attempts left before your account is locked.`,
  //     );
  //   }
  // };

  const handleSignIn = async () => {
    if (isLocked || isLoading) return;

    Keyboard.dismiss();

    if (!username.trim() || !password) {
      setLoginError('Please enter your username and password.');
      return;
    }

    try {
      setIsLoading(true);
      setLoginError(null);

      const response = await login(username.trim(), password);

      await saveToken(response.token);

      onLoginSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.status === 423) {
        setIsLocked(true);
        setLoginError(error.message);
      } else {
        setLoginError(
          error instanceof Error
            ? error.message
            : 'Unable to sign in. Please try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };


  // const resetLockedState = () => {
  //   setIsLocked(false);
  //   setAttemptsLeft(5);
  //   setLoginError(null);
  //   setUsername('');
  //   setPassword('');
  // };

  return (
    <AuraBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.logoRow, logoAnim]}>
          <View style={styles.logoIconContainer}>
            <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
              <Path
                d="M22 4L6 12v10c0 11 7 18 16 20 9-2 16-9 16-20V12L22 4z"
                fill={Colors.PrimaryGreen}
                opacity={0.15}
              />
              <Path
                d="M22 6L8 13v9c0 10 6.3 16.2 14 18 7.7-1.8 14-8 14-18v-9L22 6z"
                stroke={Colors.PrimaryGreen}
                strokeWidth={2}
                fill="none"
              />
              <Path
                d="M16 22l4 4 8-8"
                stroke={Colors.PrimaryGreen}
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.appName}>CashRoute</Text>
            <Text style={styles.appSubtitle}>DELIVERY TEAM</Text>
          </View>
        </Animated.View>

        <Animated.View style={formAnim}>
          <Text style={styles.signInTitle}>Sign in</Text>
          <Text style={styles.signInSubtitle}>
            For authorized delivery team members only.
          </Text>

          {loginError && (
            <View style={styles.errorCard}>
              <Text style={styles.errorCardText}>{loginError}</Text>
            </View>
          )}

          {isLocked && (
            <View style={styles.errorCard}>
              <Text style={styles.errorCardText}>
                Account locked after too many failed attempts. Your Super Admin has been notified to unlock it.
              </Text>
            </View>
          )}

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

          <Text style={styles.fieldLabelPassword}>Password</Text>
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
              onPress={() => setShowPassword(!showPassword)}
              style={styles.showHideBtn}>
              <Text style={styles.showHideText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={styles.gap32} />

        <Animated.View style={btnAnim}>
          {/* {isLocked ? (
            <>
              <View style={styles.disabledButton}>
                <Text style={styles.disabledButtonText}>Sign in</Text>
              </View>
              <View style={styles.gap16} />
              <SecondaryButton text="Back to login" onPress={resetLockedState} />
              <View style={styles.gap16} />
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
          )} */}
          {isLocked ? (
            <>
              <View style={styles.disabledButton}>
                <Text style={styles.disabledButtonText}>Account Locked</Text>
              </View>

              <View style={styles.gap16} />

              <Text style={styles.helpText}>
                Please contact your Super Admin to unlock your account.
              </Text>
            </>
          ) : (
            <PrimaryButton
              text={isLoading ? 'Signing in...' : 'Sign in'}
              onPress={handleSignIn}
              loading={isLoading}
            />
          )}
        </Animated.View>

        <View style={styles.flex1} />

        <Text style={styles.footer}>
          Internal app · activity is recorded with time and GPS.
        </Text>
      </View>
    </AuraBackground>
  );
};
