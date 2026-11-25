/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// Jest has no native navigator, Firebase bridge, or device keychain.
jest.mock('../src/navigation/AppNavigation', () => ({
  AppNavigation: () => null,
}));
jest.mock('../src/services/notifications', () => ({
  listenForDeliveryNotifications: jest.fn(() => () => {}),
  listenForFcmTokenRefresh: jest.fn(() => () => {}),
}));
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(async () => false),
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
