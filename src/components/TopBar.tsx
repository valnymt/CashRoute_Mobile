import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme';
import { Typography } from '../theme';

interface TopBarProps {
  title: string;
  onBackClick: () => void;
  style?: ViewStyle;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onBackClick, style }) => {
  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity onPress={onBackClick} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Back">
        <Text style={styles.backArrow}>{'‹'}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.CardBorder,
    backgroundColor: Colors.CardSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 26,
    lineHeight: 29,
    color: Colors.White,
  },
  title: {
    flexShrink: 1,
    ...Typography.headlineMedium,
    color: Colors.White,
  },
});
