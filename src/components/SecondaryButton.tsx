import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography } from '../theme';

interface SecondaryButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({ text, onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.CardSurface,
  },
  text: {
    ...Typography.titleMedium,
    color: Colors.White,
  },
});
