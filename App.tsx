import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'react-native';
import { AppProvider } from './src/store';
import { AppNavigation } from './src/navigation/AppNavigation';
import { listenForDeliveryNotifications, listenForFcmTokenRefresh } from './src/services/notifications';

function App() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const signedIn = useRef(false);
  const [pendingNotificationId, setPendingNotificationId] = useState<string | null>(null);
  const [foregroundNotificationId, setForegroundNotificationId] = useState<string | null>(null);
  const [pushRevision, setPushRevision] = useState(0);
  const dismissForeground = useCallback(() => setForegroundNotificationId(null), []);
  const clearPending = useCallback(() => setPendingNotificationId(null), []);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');

    const unsubscribe = listenForFcmTokenRefresh();

    return unsubscribe;
  }, []);

  useEffect(() => {
    return listenForDeliveryNotifications(
      id => {
        if (!signedIn.current) return;
        setPushRevision(revision => revision + 1);
        setForegroundNotificationId(id);
      },
      id => {
        setPushRevision(revision => revision + 1);
        setPendingNotificationId(id);
      },
    );
  }, []);

  return (
    <AppProvider key={String(isSignedIn)} isSignedIn={isSignedIn} pushRevision={pushRevision}>
      <AppNavigation
        isSignedIn={isSignedIn}
        onLoginSuccess={() => {
          signedIn.current = true;
          setIsSignedIn(true);
        }}
        pendingNotificationId={pendingNotificationId}
        onNotificationHandled={clearPending}
        foregroundNotificationId={foregroundNotificationId}
        onDismissForegroundNotification={dismissForeground}
        onLogout={() => {
          signedIn.current = false;
          setIsSignedIn(false);
          clearPending();
          dismissForeground();
        }}
      />
    </AppProvider>
  );
}

export default App;
