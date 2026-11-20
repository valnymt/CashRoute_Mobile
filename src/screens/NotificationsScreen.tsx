import React from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { AuraBackground, GlassCard, TopBar } from '../components';
import { Colors, Typography } from '../theme';
import { useApp } from '../store/data';

interface NotificationsScreenProps {
  onBackClick: () => void;
  onNotificationPress: (id: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBackClick, onNotificationPress,
}) => {
  const { notifications, markAllNotificationsRead, unreadCount, refreshNotifications, notificationError, notificationsLoading } = useApp();

  useFocusEffect(React.useCallback(() => {
    void refreshNotifications();
  }, [refreshNotifications]));

  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Notifications" onBackClick={onBackClick} />

        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllNotificationsRead} style={styles.markAllBtn}>
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        )}

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={notificationsLoading} onRefresh={refreshNotifications} tintColor={Colors.PrimaryGreen} />} >
          <View style={{ height: 12 }} />
          {notificationError && <Text style={styles.notifDetail} accessibilityLiveRegion="polite">{notificationError} Pull down to retry.</Text>}
          {!notificationError && !notificationsLoading && notifications.length === 0 && (
            <Text style={styles.notifDetail}>Delivery assignments and team updates will appear here.</Text>
          )}
          {notifications.map(item => (
              <TouchableOpacity key={item.id} accessibilityRole="button"
                activeOpacity={0.8}
                onPress={() => onNotificationPress(item.id)}>
                <GlassCard style={{ marginBottom: 12 }}>
                  <View style={styles.notifCard}>
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: !item.read ? Colors.PrimaryGreen : Colors.TextDim },
                      ]}
                    />
                    <View style={styles.notifContent}>
                      <Text style={styles.notifTitle}>{item.title}</Text>
                      <Text style={styles.notifDetail}>{item.body}</Text>
                      <Text
                        style={[
                          styles.notifTime,
                          { color: !item.read ? Colors.PrimaryGreen : Colors.TextDim },
                        ]}>
                        {item.at ? new Date(item.at).toLocaleString() : null}
                      </Text>
                    </View>
                    {!item.read && <View style={styles.newBadge}><Text style={styles.newText}>NEW</Text></View>}
                  </View>
                </GlassCard>
              </TouchableOpacity>
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
