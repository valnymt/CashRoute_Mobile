import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { AppNavigation } from './src/navigation/AppNavigation';

function App() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  return (
    <AppProvider>
      <AppNavigation />
    </AppProvider>
  );
}

export default App;
