import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AuraBackground, GlassCard, SecondaryButton, TopBar } from '../components';
import { getNotification } from '../services/notificationInbox';
import type { DeliveryNotificationDetail } from '../services/notificationInbox';
import { useApp } from '../store/data';
import { Colors, Typography } from '../theme';

export function NotificationDetailScreen({ id, onBackClick }: { id: string; onBackClick: () => void }) {
  const { markNotificationRead } = useApp();
  const [detail, setDetail] = useState<DeliveryNotificationDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setDetail(null);
    setError(null);
    getNotification(id).then(result => {
      if (!active) return;
      setDetail(result);
      if (!result.data.read) void markNotificationRead(id).catch(() => {});
    }).catch(() => {
      if (active) setError('Unable to open this notification.');
    });
    return () => { active = false; };
  }, [attempt, id, markNotificationRead]);

  const assignment = detail?.assignment;
  return (
    <AuraBackground>
      <View style={styles.container}>
        <TopBar title="Notification" onBackClick={onBackClick} />
        <ScrollView contentContainerStyle={styles.content}>
          {!detail && !error && <ActivityIndicator color={Colors.PrimaryGreen} />}
          {error && (
            <>
              <Text style={styles.body} accessibilityLiveRegion="polite">{error}</Text>
              <SecondaryButton text="Try again" onPress={() => setAttempt(value => value + 1)} />
            </>
          )}
          {detail && (
            <GlassCard>
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.title}>{detail.data.title}</Text>
                <Text style={styles.body}>{detail.data.body}</Text>
                {detail.data.at && <Text style={styles.body}>{new Date(detail.data.at).toLocaleString()}</Text>}
                {detail.reference && <Detail label="Request" value={detail.reference} />}
                {detail.cancelReason && <Detail label="Cancellation reason" value={detail.cancelReason} />}
              </View>
            </GlassCard>
          )}
          {assignment && (
            <GlassCard>
              <View style={styles.card}>
                <Text accessibilityRole="header" style={styles.title}>Assignment details</Text>
                <Detail label="Status" value={assignment.status} />
                <Detail label="Team" value={assignment.team?.name} />
                <Detail label="Type" value={assignment.type} />
                <Detail label="Amount" value={assignment.currency + ' ' + Number(assignment.amount).toLocaleString()} />
                <Detail label="Requested date" value={assignment.date} />
                <Detail label="Completion window" value={assignment.time_slot} />
                <Detail label="Pickup" value={[assignment.pickup.name, assignment.pickup.address].filter(Boolean).join(' · ')} />
                <Detail label="Drop-off" value={[assignment.dropoff.name, assignment.dropoff.address].filter(Boolean).join(' · ')} />
                <Detail label="Remarks" value={assignment.remarks} />
              </View>
            </GlassCard>
          )}
        </ScrollView>
      </View>
    </AuraBackground>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.body}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 44, paddingHorizontal: 22 },
  content: { gap: 14, paddingBottom: 20 },
  card: { padding: 18, gap: 10 },
  title: { ...Typography.titleLarge, color: Colors.TextPrimary },
  body: { ...Typography.bodyMedium, color: Colors.TextSecondary },
  label: { ...Typography.labelMedium, color: Colors.PrimaryGreen },
});
