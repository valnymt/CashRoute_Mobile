import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigation } from './src/navigation/AppNavigation';

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <AppNavigation />
    </>
  );
}

export default App;
