import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
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

  const handleSignIn = () => {
    if (username.trim() && password.trim()) {
      onLoginSuccess();
    } else {
      setLoginError('Demo: wrong password');
    }
  };

  return (
    <AuraBackground>
      <View style={styles.container}>
        {/* Logo */}
        <View style={styles.logoRow}>
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
        </View>

        {/* Title */}
        <Text style={styles.signInTitle}>Sign in</Text>
        <Text style={styles.signInSubtitle}>
          For authorized delivery team members only.
        </Text>

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

        {loginError && (
          <Text style={styles.errorTextCenter}>{loginError}</Text>
        )}

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
  errorTextCenter: {
    ...Typography.bodyMedium,
    color: Colors.AccentRed,
    textAlign: 'center',
    marginTop: 16,
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
