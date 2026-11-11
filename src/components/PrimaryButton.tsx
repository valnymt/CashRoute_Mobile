import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors, Typography } from '../theme';

interface PrimaryButtonProps {
  text: string;
  onPress: () => void;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  onPress,
  style,
  loading = false,
  disabled = false,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableWithoutFeedback
      onPress={isDisabled ? undefined : onPress}
      onPressIn={isDisabled ? undefined : handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.button,
          style,
          { transform: [{ scale }] },
          isDisabled && styles.buttonDisabled,
        ]}>
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={Colors.Black} />
            <Text style={[styles.text, { marginLeft: 8 }]}>{text}</Text>
          </View>
        ) : (
          <Text style={styles.text}>{text}</Text>
        )}
      </Animated.View>
    </TouchableWithoutFeedback>
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
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    ...Typography.titleMedium,
    color: Colors.Black,
    fontWeight: '700',
  },
});
