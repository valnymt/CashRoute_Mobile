import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
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

export const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        initialRouteName="Login"
      >
        <Stack.Screen name="Login">
          {({ navigation }) => (
            <LoginScreen onLoginSuccess={() => navigation.replace('Home')} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
              onRequestPress={() => navigation.navigate('RequestDetail')}
              onTripMapPress={() => navigation.navigate('TripMapPickup')}
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
              onLogout={() => navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="Notifications">
          {({ navigation }) => (
            <NotificationsScreen onBackClick={() => navigation.goBack()} />
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
  );
};
