import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { AppProvider } from './src/store';
import { AppNavigation } from './src/navigation/AppNavigation';
import { listenForFcmTokenRefresh } from './src/services/notifications';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    const unsubscribe = listenForFcmTokenRefresh();

    return unsubscribe;
  }, []);

  return (
    <AppProvider key={String(isSignedIn)} isSignedIn={isSignedIn}>
      <AppNavigation
        isSignedIn={isSignedIn}
        onLoginSuccess={() => setIsSignedIn(true)}
        onLogout={() => setIsSignedIn(false)}
      />
    </AppProvider>
  );
}

export default App;
