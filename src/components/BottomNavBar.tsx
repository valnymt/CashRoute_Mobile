import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography } from '../theme';

export type BottomNavItem = 'assignments' | 'liveTrip' | 'history';

interface BottomNavBarProps {
  selected: BottomNavItem;
  onSelect: (item: BottomNavItem) => void;
}

const navItems: { key: BottomNavItem; label: string; icon: string }[] = [
  { key: 'assignments', label: 'Assignments', icon: '🏠' },
  { key: 'liveTrip', label: 'Live Trip', icon: '📍' },
  { key: 'history', label: 'History', icon: '🕐' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {navItems.map(item => {
        const isActive = selected === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}>
            <Text style={styles.icon}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.TabBarBg,
    borderTopWidth: 1,
    borderTopColor: Colors.CardBorder,
    paddingBottom: 20,
    paddingTop: 12,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  label: {
    ...Typography.labelSmall,
    color: Colors.TextDim,
  },
  activeLabel: {
    color: Colors.PrimaryGreen,
  },
});
