import React from 'react';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineIndicator from './src/components/OfflineIndicator';

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <OfflineIndicator />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
