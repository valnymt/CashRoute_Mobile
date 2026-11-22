import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../theme';
import { NotificationDetailScreen } from '../screens/NotificationDetailScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDialogProvider } from '../components/AppDialog';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  HomeScreen,
  ProfileScreen,
  RequestDetailScreen,
  OtpVerificationScreen,
  PickupVerifiedScreen,
  TripMapScreen,
  ProofOfDeliveryScreen,
  RequestCompletedScreen,
  NotificationsScreen,
  TripHistoryScreen,
  TripDetailsScreen,
} from '../screens';
type Coordinates = { latitude: number; longitude: number } | null;

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Notifications: undefined;
  NotificationDetail: { id: string };
  RequestDetail: undefined;
  TripMapPickup: undefined;
  OtpPickup: { cashRequestId: number; currentLocation: Coordinates };
  PickupVerified: undefined;
  TripMapDropOff: undefined;
  OtpDropOff: { cashRequestId: number; currentLocation: Coordinates };
  ProofOfDelivery: undefined;
  RequestCompleted: undefined;
  TripHistory: undefined;
  TripDetails: { tripId?: string } | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface AppNavigationProps {
  isSignedIn: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
  pendingNotificationId: string | null;
  onNotificationHandled: () => void;
  foregroundNotificationId: string | null;
  onDismissForegroundNotification: () => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({
  isSignedIn,
  onLoginSuccess,
  onLogout, pendingNotificationId, onNotificationHandled, foregroundNotificationId, onDismissForegroundNotification,
}) => {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const openPending = useCallback(() => {
    if (!isSignedIn || !pendingNotificationId || !navigationRef.isReady()) return;
    navigationRef.navigate('NotificationDetail', { id: pendingNotificationId });
    onNotificationHandled();
  }, [isSignedIn, pendingNotificationId, navigationRef, onNotificationHandled]);
  useEffect(openPending, [openPending]);
  return (
    <SafeAreaProvider>
      <AppDialogProvider>
        <NavigationContainer ref={navigationRef} onReady={openPending}>
          <Stack.Navigator
            screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
            initialRouteName={isSignedIn ? 'Home' : 'Login'}
          >
            <Stack.Screen name="Login">
              {() => <LoginScreen onLoginSuccess={onLoginSuccess} />}
            </Stack.Screen>

            <Stack.Screen name="Home">
              {({ navigation }) => (
                <HomeScreen
                  onRequestPress={() => navigation.navigate('RequestDetail')}
                  onTripMapPress={status => {
                    if (status === 'In Transit') {
                      navigation.navigate('TripMapDropOff');
                    } else if (status === 'Assigned') {
                      navigation.navigate('TripMapPickup');
                    }
                  }}
                  onProfilePress={() => navigation.navigate('Profile')}
                  onNotificationsPress={() => navigation.navigate('Notifications')}
                  onHistoryPress={() => navigation.navigate('TripHistory')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Profile">
              {({ navigation }) => (
                <ProfileScreen
                  onBackClick={() => navigation.goBack()}
                  onLogout={onLogout}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Notifications">
              {({ navigation }) => (
                <NotificationsScreen
                  onBackClick={() => navigation.goBack()}
                  onNotificationPress={id => navigation.navigate('NotificationDetail', { id })}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="NotificationDetail">
              {({ navigation, route }) => (
                <NotificationDetailScreen id={route.params.id} onBackClick={() => navigation.goBack()} />
              )}
            </Stack.Screen>

            <Stack.Screen name="RequestDetail">
              {({ navigation }) => (
                <RequestDetailScreen
                  onBackClick={() => navigation.goBack()}
                  onStartTrip={() => navigation.navigate('TripMapPickup')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="TripMapPickup">
              {({ navigation }) => (
                <TripMapScreen
                  isPickup
                  onBackClick={() => navigation.goBack()}
                  onArrived={(cashRequestId, currentLocation) =>
                    navigation.navigate('OtpPickup', { cashRequestId, currentLocation })
                  }
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="OtpPickup">
              {({ navigation, route }) => (
                <OtpVerificationScreen
                  type="pickup"
                  cashRequestId={route.params.cashRequestId}
                  currentLocation={route.params.currentLocation}
                  onBackClick={() => navigation.goBack()}
                  onVerified={() => navigation.navigate('PickupVerified')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="PickupVerified">
              {({ navigation }) => (
                <PickupVerifiedScreen
                  onBackClick={() => navigation.goBack()}
                  onContinueToDropOff={() => navigation.navigate('TripMapDropOff')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="TripMapDropOff">
              {({ navigation }) => (
                <TripMapScreen
                  isPickup={false}
                  onBackClick={() => navigation.goBack()}
                  onArrived={(cashRequestId, currentLocation) =>
                    navigation.navigate('OtpDropOff', { cashRequestId, currentLocation })
                  }
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="OtpDropOff">
              {({ navigation, route }) => (
                <OtpVerificationScreen
                  type="dropOff"
                  cashRequestId={route.params.cashRequestId}
                  currentLocation={route.params.currentLocation}
                  onBackClick={() => navigation.goBack()}
                  onVerified={() => navigation.navigate('ProofOfDelivery')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="ProofOfDelivery">
              {({ navigation }) => (
                <ProofOfDeliveryScreen
                  onBackClick={() => navigation.goBack()}
                  onSubmitProof={() => navigation.navigate('RequestCompleted')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="RequestCompleted">
              {({ navigation }) => (
                <RequestCompletedScreen
                  onBackClick={() => navigation.navigate('TripHistory')}
                  onBackToAssignments={() => navigation.navigate('Home')}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="TripHistory">
              {({ navigation }) => (
                <TripHistoryScreen
                  onTripPress={(id) => navigation.navigate('TripDetails', { tripId: id })}
                  onTabChange={tab => {
                    if (tab === 'assignments') navigation.navigate('Home');
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="TripDetails">
              {({ navigation, route }) => (
                <TripDetailsScreen
                  onBackClick={() => navigation.goBack()}
                  tripId={route.params?.tripId}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
        {isSignedIn && foregroundNotificationId && (
          <View style={styles.notice}>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (navigationRef.isReady()) {
                  navigationRef.navigate('NotificationDetail', { id: foregroundNotificationId });
                  onDismissForegroundNotification();
                }
              }}
              style={styles.noticeBody}
            >
              <Text style={styles.noticeTitle}>New delivery team update</Text>
              <Text style={styles.noticeText}>Tap to view details</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Dismiss update" onPress={onDismissForegroundNotification} style={styles.dismiss}>
              <Text style={styles.noticeText}>Dismiss</Text>
            </Pressable>
          </View>
        )}
      </AppDialogProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  notice: { position: 'absolute', top: 52, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: Colors.PrimaryGreen, backgroundColor: '#2A1643', zIndex: 10, elevation: 8 },
  noticeBody: { flex: 1, padding: 14 },
  dismiss: { padding: 14 },
  noticeTitle: { ...Typography.titleMedium, color: Colors.TextPrimary },
  noticeText: { ...Typography.bodySmall, color: Colors.PrimaryGreen },
});
