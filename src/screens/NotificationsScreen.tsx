import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { AuraBackground, GlassCard, TopBar } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';

interface NotificationsScreenProps {
  onBackClick: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBackClick,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, unreadCount } = useApp();

  const anims = useRef(
    notifications.map(() => ({
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
          delay: i * 80,
          useNativeDriver: true,
        }),
        Animated.timing(a.translateY, {
          toValue: 0,
          duration: 350,
          delay: i * 80,
          useNativeDriver: true,
        }),
      ]),
    );
    Animated.stagger(0, animations).start();
  }, [anims]);

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Notifications" onBackClick={onBackClick} />

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ height: 12 }} />
          {notifications.map((item, index) => (
            <Animated.View
              key={item.id}
              style={{
                opacity: anims[index]?.opacity ?? 1,
                transform: [{ translateY: anims[index]?.translateY ?? 0 }],
              }}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => markNotificationRead(item.id)}>
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.notifCard}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: item.isNew ? Colors.PrimaryGreen : Colors.TextDim },
                      ]}
                    />
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifDetail}>{item.detail}</Text>
                      <Text
                        style={[
                          styles.notifTime,
                          { color: item.isNew ? Colors.PrimaryGreen : Colors.TextDim },
                        ]}>
                        {item.time}
                      </Text>
                    </View>
                    {item.isNew && <View style={styles.newBadge}><Text style={styles.newText}>NEW</Text></View>}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </AuraBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 56,
  },
  scroll: {
    flex: 1,
  },
  markAllBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  markAllText: {
    ...Typography.labelLarge,
    color: Colors.PrimaryGreen,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    ...Typography.titleMedium,
    color: Colors.White,
    fontWeight: '700',
  },
  notifDetail: {
    ...Typography.bodySmall,
    color: Colors.TextSecondary,
    marginTop: 2,
  },
  notifTime: {
    ...Typography.bodySmall,
    marginTop: 4,
  },
  newBadge: {
    backgroundColor: 'rgba(150, 215, 76, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  newText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.PrimaryGreen,
    letterSpacing: 1,
  },
});
