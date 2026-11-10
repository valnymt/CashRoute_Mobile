import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme';

interface AuraBackgroundProps {
  children: React.ReactNode;
}

export const AuraBackground: React.FC<AuraBackgroundProps> = ({ children }) => {
  return (
    <LinearGradient
      colors={[Colors.DarkBgTop, Colors.DarkBgBottom]}
      style={styles.container}>
      {/* Green orb - bottom left */}
      <View style={[styles.orb, styles.greenOrb]} />
      {/* Purple orb - bottom right */}
      <View style={[styles.orb, styles.purpleOrbRight]} />
      {/* Purple orb - top left */}
      <View style={[styles.orb, styles.purpleOrbLeft]} />
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  greenOrb: {
    width: 300,
    height: 300,
    bottom: -100,
    left: -80,
    backgroundColor: Colors.PrimaryGreen,
    opacity: 0.06,
  },
  purpleOrbRight: {
    width: 250,
    height: 250,
    bottom: -60,
    right: -60,
    backgroundColor: Colors.PurpleAccent,
    opacity: 0.08,
  },
  purpleOrbLeft: {
    width: 200,
    height: 200,
    top: -40,
    left: -40,
    backgroundColor: Colors.PurpleAccent,
    opacity: 0.06,
  },
});
