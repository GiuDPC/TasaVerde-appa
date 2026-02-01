import React, { useState } from 'react';
import { StatusBar, View, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importar desde src/
import { DashboardScreen } from './src/screens/DashboardScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { SplashScreen } from './src/components/SplashScreen';
import { Icon, IconName } from './src/components/Icon';

const Tab = createBottomTabNavigator();

// Cliente de React Query optimizado
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

// Componente de icono para tabs
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
        // Animación suave al cambiar de tab
        animation: 'fade',
      }}
    >
      <Tab.Screen
        name="Tasas"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="graphic" focused={focused} />,
          tabBarLabel: 'Tasas',
          tabBarAccessibilityLabel: 'Ver tasas de cambio actuales',
        }}
      />
      <Tab.Screen
        name="Calculadora"
        component={CalculatorScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="calculator" focused={focused} />,
          tabBarLabel: 'Calculadora',
          tabBarAccessibilityLabel: 'Abrir calculadora de conversión',
        }}
      />
      <Tab.Screen
        name="Historial"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="historialMenu" focused={focused} />,
          tabBarLabel: 'Historial',
          tabBarAccessibilityLabel: 'Ver historial de tasas',
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="notificacionesMenu" focused={focused} />,
          tabBarLabel: 'Alertas',
          tabBarAccessibilityLabel: 'Configurar alertas de tasas',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
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
});
