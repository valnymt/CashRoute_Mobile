import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  LoginScreen,
  HomeScreen,
  RequestDetailScreen,
  OtpVerificationScreen,
  PickupVerifiedScreen,
  TripMapScreen,
  ProofOfDeliveryScreen,
  RequestCompletedScreen,
  NotificationsScreen,
} from '../screens';
import type { OtpStep, OtpType } from '../screens';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Notifications: undefined;
  RequestDetail: undefined;
  TripMapPickup: undefined;
  OtpPickupRequest: undefined;
  OtpPickupEnter: undefined;
  PickupVerified: undefined;
  TripMapDropOff: undefined;
  OtpDropOffRequest: undefined;
  OtpDropOffEnter: undefined;
  ProofOfDelivery: undefined;
  RequestCompleted: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
        initialRouteName="Login">
        <Stack.Screen name="Login">
          {({ navigation }) => (
            <LoginScreen onLoginSuccess={() => navigation.replace('Home')} />
          )}
        </Stack.Screen>

        <Stack.Screen name="Home">
          {({ navigation }) => (
            <HomeScreen
              onRequestPress={() => navigation.navigate('RequestDetail')}
              onNotificationsPress={() => navigation.navigate('Notifications')}
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
              isPickup={true}
              onBackClick={() => navigation.goBack()}
              onOpenDirections={() => {}}
              onArrived={() => navigation.navigate('OtpPickupRequest')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="OtpPickupRequest">
          {({ navigation }) => (
            <OtpVerificationScreen
              step="request"
              type="pickup"
              onBackClick={() => navigation.goBack()}
              onRequestOtp={() => navigation.navigate('OtpPickupEnter')}
              onVerify={() => {}}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="OtpPickupEnter">
          {({ navigation }) => (
            <OtpVerificationScreen
              step="enterCode"
              type="pickup"
              onBackClick={() => navigation.goBack()}
              onRequestOtp={() => {}}
              onVerify={() => navigation.navigate('PickupVerified')}
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
              onOpenDirections={() => {}}
              onArrived={() => navigation.navigate('OtpDropOffRequest')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="OtpDropOffRequest">
          {({ navigation }) => (
            <OtpVerificationScreen
              step="request"
              type="dropOff"
              onBackClick={() => navigation.goBack()}
              onRequestOtp={() => navigation.navigate('OtpDropOffEnter')}
              onVerify={() => {}}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="OtpDropOffEnter">
          {({ navigation }) => (
            <OtpVerificationScreen
              step="enterCode"
              type="dropOff"
              onBackClick={() => navigation.goBack()}
              onRequestOtp={() => {}}
              onVerify={() => navigation.navigate('ProofOfDelivery')}
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
              onBackClick={() => navigation.goBack()}
              onBackToAssignments={() => navigation.navigate('Home')}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};
