import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { AuraBackground, PrimaryButton } from '../components';
import { Colors, Typography } from '../theme';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(5);

  const handleSignIn = () => {
    if (username.trim() && password.trim()) {
      onLoginSuccess();
    } else {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      if (remaining <= 0) {
        setLoginError(
          'Your account has been locked due to too many failed attempts. Contact your administrator.',
        );
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
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>CR</Text>
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.appName}>CashRoute</Text>
            <Text style={styles.appSubtitle}>DELIVERY TEAM</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.signInTitle}>Sign in</Text>
        <Text style={styles.signInSubtitle}>
          For authorized delivery team members only.
        </Text>

        {/* Error banner */}
        {loginError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{loginError}</Text>
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
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.showHideBtn}>
            <Text style={styles.showHideText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />

        <PrimaryButton text="Sign in" onPress={handleSignIn} />

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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBox: {
    width: 50,
    height: 50,
    backgroundColor: Colors.Black,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: Colors.PrimaryGreen,
    fontSize: 18,
    fontWeight: '700',
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
  errorBanner: {
    marginTop: 16,
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.4)',
    borderRadius: 12,
    padding: 16,
  },
  errorText: {
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
  footer: {
    ...Typography.bodySmall,
    color: Colors.TextDim,
    textAlign: 'center',
  },
});
