// LoginScreen styles — moved out of the screen to match the portal's
// split-file pattern (JSX in .tsx, styles in a sibling .styles.ts).

import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 48,
    paddingBottom: Spacing['2xl'],
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 44,
  },
  logoIconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.Black,
    borderRadius: 17,
  },
  logoTextContainer: {
    marginLeft: Spacing.md,
  },
  appName: {
    ...Typography.headlineMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  appSubtitle: {
    ...Typography.labelMedium,
    color: Colors.PrimaryGreen,
    letterSpacing: 0.2,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
  },
  signInTitle: {
    ...Typography.displayLarge,
    color: Colors.White,
    marginTop: 18,
  },
  signInSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  errorCard: {
    backgroundColor: Colors.ErrorSurface,
    borderWidth: 1,
    borderColor: Colors.AccentRed,
    borderRadius: 20,
    padding: Spacing.lg,
    marginTop: 18,
  },
  errorCardText: {
    ...Typography.bodyMedium,
    fontSize: 13,
    lineHeight: 17,
    color: Colors.AccentRed,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    marginTop: 18,
    marginBottom: 6,
  },
  fieldLabelPassword: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    marginTop: 18,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.InputBg,
    borderWidth: 1,
    borderColor: Colors.InputBorder,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    minHeight: 53,
    paddingVertical: 10,
    color: Colors.White,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: 15,
  },
  inputFocused: { borderColor: Colors.PrimaryGreen },
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
    paddingHorizontal: Spacing.lg,
    minHeight: 53,
    paddingVertical: 10,
    color: Colors.White,
    fontFamily: Typography.bodyMedium.fontFamily,
    fontSize: 15,
  },
  showHideBtn: {
    minHeight: 48,
    minWidth: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  showHideText: {
    ...Typography.labelLarge,
    fontSize: 13,
    letterSpacing: 0,
    color: Colors.PrimaryGreen,
  },
  disabledButton: {
    backgroundColor: 'rgba(150, 215, 76, 0.3)',
    borderRadius: 28,
    paddingVertical: Spacing.lg,
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
    marginTop: 18,
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
    marginTop: 20,
  },
  // Simple layout spacers kept here so screens stay purely JSX.
  gap16: { height: Spacing.lg },
  gap18: { height: 18 },
  flex1: { flex: 1 },
});
