import React, { useState } from 'react';
import { StatusBar, View, StyleSheet, ActivityIndicator } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DashboardScreen } from './src/screens/DashboardScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { SplashScreen } from './src/components/SplashScreen';
import { Icon, IconName } from './src/components/Icon';
import { useAuth } from './src/hooks/useAuth';
import AuthScreen from './src/screens/AuthScreen';

const Tab = createBottomTabNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Icon 
        name={name} 
        size={focused ? 26 : 22} 
        color={focused ? '#10B981' : '#94A3B8'} 
      />
    </View>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        lazy: true,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Tasas"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="graphic" focused={focused} />,
          tabBarLabel: 'Tasas',
        }}
      />
      <Tab.Screen
        name="Calculadora"
        component={CalculatorScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="calculator" focused={focused} />,
          tabBarLabel: 'Calculadora',
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="historialMenu" focused={focused} />,
          tabBarLabel: 'Historial',
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="notificacionesMenu" focused={focused} />,
          tabBarLabel: 'Alertas',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { loading, isLoggedIn, error } = useAuth();

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  // Mostrar error si hay problemas de inicialización
  if (error) {
    console.error("🔴 App Error:", error);
    // Continuar a AuthScreen incluso con error
  }

  if (!isLoggedIn) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <AuthScreen />
      </>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
