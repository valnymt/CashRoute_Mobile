import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuraBackgroundProps {
  children: React.ReactNode;
}

export const AuraBackground: React.FC<AuraBackgroundProps> = ({ children }) => (
  <LinearGradient colors={[Colors.DarkBgTop, Colors.DarkBgBottom]} style={styles.container}>
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Image source={require('../assets/images/aura-violet.png')} style={styles.violet} />
      <Image source={require('../assets/images/aura-lime.png')} style={styles.lime} />
      <Image source={require('../assets/images/aura-indigo.png')} style={styles.indigo} />
    </View>
    <SafeAreaView edges={['bottom']} style={styles.content}>{children}</SafeAreaView>
  </LinearGradient>
);

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  content: { flex: 1 },
  violet: { position: 'absolute', width: 480, height: 480, left: -160, top: '34%' },
  lime: { position: 'absolute', width: 480, height: 480, right: -188, top: '51%' },
  indigo: { position: 'absolute', width: 500, height: 500, left: -180, top: -160 },
});