import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors, Typography } from '../theme';

export type BottomNavItem = 'assignments' | 'liveTrip' | 'history';

interface BottomNavBarProps {
  selected: BottomNavItem;
  onSelect: (item: BottomNavItem) => void;
}

const AssignmentsIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Path d="M9 22V12h6v10" stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const LiveTripIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"
      stroke={color}
      strokeWidth={2}
      fill="none"
    />
    <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={2} fill="none" />
  </Svg>
);

const HistoryIcon: React.FC<{ color: string }> = ({ color }) => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} fill="none" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
  </Svg>
);

const navItems: {
  key: BottomNavItem;
  label: string;
  Icon: React.FC<{ color: string }>;
}[] = [
  { key: 'assignments', label: 'Assignments', Icon: AssignmentsIcon },
  { key: 'liveTrip', label: 'Live Trip', Icon: LiveTripIcon },
  { key: 'history', label: 'History', Icon: HistoryIcon },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      {navItems.map(item => {
        const isActive = selected === item.key;
        const color = isActive ? Colors.PrimaryGreen : Colors.TextDim;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => onSelect(item.key)}
            activeOpacity={0.7}>
            <item.Icon color={color} />
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
  label: {
    ...Typography.labelSmall,
    color: Colors.TextDim,
    marginTop: 4,
  },
  activeLabel: {
    color: Colors.PrimaryGreen,
  },
});
