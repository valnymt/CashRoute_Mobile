import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppProvider } from './src/store';
import { AppNavigation } from './src/navigation/AppNavigation';
import { listenForFcmTokenRefresh } from './src/services/notifications';

function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    const unsubscribe = listenForFcmTokenRefresh();

    return unsubscribe;
  }, []);

  return (
    <AppProvider>
      <AppNavigation />
    </AppProvider>
  );
}

export default App;
