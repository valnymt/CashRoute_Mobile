import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { AppNavigation } from './src/navigation/AppNavigation';

function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      (StatusBar as any).setTranslucent(true);
      (StatusBar as any).setBackgroundColor('transparent');
    }
  }, []);

  return (
    <AppProvider>
      <AppNavigation />
    </AppProvider>
  );
}

export default App;
