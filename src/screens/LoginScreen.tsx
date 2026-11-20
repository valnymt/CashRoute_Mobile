import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { login } from '../services/authApi';
import { ApiError } from '../services/api';
import { saveToken, saveUser } from '../services/authStorage';
import { AuraBackground, PrimaryButton } from '../components';
import { Colors } from '../theme';
import { useAnimatedMount } from '../hooks/useAnimatedMount';
import { styles } from './LoginScreen.styles';
import { Image } from 'react-native';
import CashRouteLogo from '../assets/images/figma-cashroute-logo.png';
import { registerFcmToken } from '../services/notifications';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const passwordInput = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const logoAnim = useAnimatedMount(0, 500);
  const formAnim = useAnimatedMount(150, 500);
  const btnAnim = useAnimatedMount(300, 500);

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
      // Save actual user information returned by Laravel
      await saveUser(response.user);
      // Register this device for Firebase push notifications.
      await registerFcmToken();

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

  return (
    <AuraBackground>
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
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

          <Animated.View style={formAnim}>
            <Text style={styles.signInTitle}>Sign in</Text>
            <Text style={styles.signInSubtitle}>
              For authorized delivery team members only.
            </Text>

            {loginError && (
              <View style={styles.errorCard} accessibilityLiveRegion="polite">
                <Text style={styles.errorCardText}>{loginError}</Text>
              </View>
            )}

            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={[styles.input, focusedField === 'username' && styles.inputFocused]}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(field => field === 'username' ? null : field)}
              placeholder="Enter username"
              placeholderTextColor={Colors.TextDim}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              keyboardAppearance="dark"
              selectionColor={Colors.PrimaryGreen}
              cursorColor={Colors.PrimaryGreen}
              returnKeyType="next"
              submitBehavior="submit"
              onSubmitEditing={() => passwordInput.current?.focus()}
              editable={!isLocked && !isLoading}
            />

            <Text style={styles.fieldLabelPassword}>Password</Text>
            <View style={[styles.passwordContainer, focusedField === 'password' && styles.inputFocused]}>
              <TextInput
                ref={passwordInput}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(field => field === 'password' ? null : field)}
                style={styles.passwordInput}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                keyboardAppearance="dark"
                selectionColor={Colors.PrimaryGreen}
                cursorColor={Colors.PrimaryGreen}
                returnKeyType="go"
                onSubmitEditing={handleSignIn}
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
                <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          <View style={styles.gap18} />

          <Animated.View style={btnAnim}>

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
        </ScrollView>
      </KeyboardAvoidingView>
    </AuraBackground>
  );
};
