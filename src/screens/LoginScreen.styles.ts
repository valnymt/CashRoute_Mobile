// LoginScreen styles — moved out of the screen to match the portal's
// split-file pattern (JSX in .tsx, styles in a sibling .styles.ts).

import { StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radii } from '../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing['2xl'],
    paddingTop: 60,
    paddingBottom: Spacing['2xl'],
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
    letterSpacing: 2,
    fontWeight: '700',
  },
  signInTitle: {
    ...Typography.displayLarge,
    color: Colors.White,
    marginTop: Spacing['2xl'],
  },
  signInSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
  },
  errorCard: {
    backgroundColor: 'rgba(255, 82, 82, 0.08)',
    borderWidth: 1,
    borderColor: Colors.AccentRed,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  errorCardText: {
    ...Typography.bodyMedium,
    color: Colors.AccentRed,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.sm,
  },
  fieldLabelPassword: {
    ...Typography.bodyMedium,
    color: Colors.TextSecondary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.InputBg,
    borderWidth: 1,
    borderColor: Colors.InputBorder,
    borderRadius: Radii.xl,
    paddingHorizontal: Spacing.lg,
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
    borderRadius: Radii.xl,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    color: Colors.White,
    fontSize: 14,
  },
  showHideBtn: {
    paddingHorizontal: Spacing.lg,
  },
  showHideText: {
    ...Typography.labelLarge,
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
    marginTop: Spacing.lg,
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
  // Simple layout spacers kept here so screens stay purely JSX.
  gap16: { height: Spacing.lg },
  gap32: { height: Spacing['3xl'] },
  flex1: { flex: 1 },
});
