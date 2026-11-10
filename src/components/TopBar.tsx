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
      <TouchableOpacity onPress={onBackClick} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Text style={styles.backArrow}>{'←'}</Text>
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
  backArrow: {
    fontSize: 24,
    color: Colors.White,
    marginRight: 12,
  },
  title: {
    ...Typography.headlineMedium,
    color: Colors.White,
  },
});
