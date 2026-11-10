import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography } from '../theme';

interface PrimaryButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({ text, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.PrimaryGreen,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  text: {
    ...Typography.titleMedium,
    color: Colors.Black,
    fontWeight: '700',
  },
});
