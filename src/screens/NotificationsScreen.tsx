import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AuraBackground, GlassCard, TopBar } from '../components';
import { Colors, Typography } from '../theme';

interface NotificationsScreenProps {
  onBackClick: () => void;
}

interface NotificationItem {
  title: string;
  detail: string;
  time: string;
  isNew: boolean;
}

const notifications: NotificationItem[] = [
  {
    title: 'New assignment',
    detail: 'REQ-1048 Deposit · MMK 250,000 · Orchard → HQ',
    time: '2 min ago',
    isNew: true,
  },
  {
    title: 'Assignment scheduled',
    detail: 'REQ-1053 Withdrawal · 15 Oct 13:00',
    time: '1 h ago',
    isNew: true,
  },
  {
    title: 'Trip completed',
    detail: 'REQ-1038 · proof of delivery saved',
    time: 'Yesterday',
    isNew: false,
  },
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBackClick,
}) => {
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Notifications" onBackClick={onBackClick} />

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={{ height: 12 }} />
          {notifications.map((item, index) => (
            <GlassCard key={index} style={{ marginBottom: 12 }}>
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
              </View>
            </GlassCard>
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
});
