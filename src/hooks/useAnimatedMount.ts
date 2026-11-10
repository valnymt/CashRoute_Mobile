import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useAnimatedMount = (delay = 0, duration = 400) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [opacity, translateY, delay, duration]);

  return { opacity, transform: [{ translateY }] };
};

export const useScaleAnimation = () => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      tension: 50,
      friction: 3,
      useNativeDriver: true,
      delay: 200,
    }).start();
  }, [scale]);

  return { transform: [{ scale }] };
};

export const usePulse = (duration = 1500) => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity, duration]);

  return opacity;
};

export const useStaggeredList = (count: number, baseDelay = 100) => {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(24),
    })),
  ).current;

  useEffect(() => {
    const animations = anims.map((a, i) =>
      Animated.parallel([
        Animated.timing(a.opacity, {
          toValue: 1,
          duration: 350,
          delay: i * baseDelay,
          useNativeDriver: true,
        }),
        Animated.timing(a.translateY, {
          toValue: 0,
          duration: 350,
          delay: i * baseDelay,
          useNativeDriver: true,
        }),
      ]),
    );
    Animated.stagger(0, animations).start();
    return () => animations.forEach(a => a.stop());
  }, [anims, baseDelay]);

  return anims.map(a => ({
    opacity: a.opacity,
    transform: [{ translateY: a.translateY }],
  }));
};
