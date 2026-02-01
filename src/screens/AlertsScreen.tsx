import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Icon } from '../components/Icon';
import { useRates } from '../hooks/useRates';

// Tipo de alerta
interface RateAlert {
  id: string;
  type: 'above' | 'below';
  value: number;
  enabled: boolean;
  createdAt: string;
  triggered?: boolean;
}

const STORAGE_KEY = '@v_rate_alerts';

export function AlertsScreen() {
  const { data: rates } = useRates();
  const [alerts, setAlerts] = useState<RateAlert[]>([]);
  const [newAlertValue, setNewAlertValue] = useState('');
  const [newAlertType, setNewAlertType] = useState<'above' | 'below'>('above');
  const [isLoading, setIsLoading] = useState(true);

  // Cargar alertas guardadas
  useEffect(() => {
    loadAlerts();
  }, []);

  // Verificar alertas cuando cambian las tasas
  useEffect(() => {
    if (rates && alerts.length > 0) {
      checkAlerts();
    }
  }, [rates]);

  const loadAlerts = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAlerts(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error cargando alertas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAlerts = async (newAlerts: RateAlert[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (error) {
      console.error('Error guardando alertas:', error);
    }
  };

  // Verificar si alguna alerta debe dispararse
  const checkAlerts = () => {
    if (!rates) return;

    const currentRate = rates.bcv.usd;
    let hasTriggered = false;

    const updatedAlerts = alerts.map(alert => {
      if (!alert.enabled || alert.triggered) return alert;

      const shouldTrigger = 
        (alert.type === 'above' && currentRate >= alert.value) ||
        (alert.type === 'below' && currentRate <= alert.value);

      if (shouldTrigger) {
        hasTriggered = true;
        // Mostrar alerta local (en una app real usaríamos push notifications)
        Alert.alert(
          '🔔 ¡Alerta de Tasa!',
          `El dólar BCV ${alert.type === 'above' ? 'subió a' : 'bajó a'} ${currentRate.toFixed(2)} Bs\n\nTu alerta: ${alert.type === 'above' ? '≥' : '≤'} ${alert.value} Bs`,
          [{ text: 'Entendido', style: 'default' }]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return { ...alert, triggered: true };
      }

      return alert;
    });

    if (hasTriggered) {
      saveAlerts(updatedAlerts);
    }
  };

  // Crear nueva alerta
  const handleCreateAlert = useCallback(async () => {
    const value = parseFloat(newAlertValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Ingresa un valor válido mayor a 0');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const newAlert: RateAlert = {
      id: Date.now().toString(),
      type: newAlertType,
      value,
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const updatedAlerts = [...alerts, newAlert];
    await saveAlerts(updatedAlerts);
    setNewAlertValue('');

    Alert.alert(
      '✅ Alerta Creada',
      `Te avisaremos cuando el BCV ${newAlertType === 'above' ? 'suba a' : 'baje a'} ${value.toFixed(2)} Bs`
    );
  }, [newAlertValue, newAlertType, alerts]);

  // Toggle alerta
  const toggleAlert = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedAlerts = alerts.map(alert =>
      alert.id === id 
        ? { ...alert, enabled: !alert.enabled, triggered: false } 
        : alert
    );
    await saveAlerts(updatedAlerts);
  }, [alerts]);

  // Eliminar alerta
  const deleteAlert = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Eliminar Alerta',
      '¿Estás seguro de que quieres eliminar esta alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedAlerts = alerts.filter(a => a.id !== id);
            await saveAlerts(updatedAlerts);
          },
        },
      ]
    );
  }, [alerts]);

  // Resetear alerta disparada
  const resetAlert = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedAlerts = alerts.map(alert =>
      alert.id === id ? { ...alert, triggered: false } : alert
    );
    await saveAlerts(updatedAlerts);
  }, [alerts]);

  const currentRate = rates?.bcv.usd || 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleIcon}>
            <Icon name="light" size={28} color="#F59E0B" />
          </View>
          <View>
            <Text style={styles.title}>Alertas</Text>
            <Text style={styles.subtitle}>Recibe avisos de cambios en la tasa</Text>
          </View>
        </View>
      </View>

      {/* Tasa actual */}
      <View style={styles.currentRateCard}>
        <Text style={styles.currentRateLabel}>TASA BCV ACTUAL</Text>
        <Text style={styles.currentRateValue}>
          {currentRate.toFixed(2)} <Text style={styles.currentRateUnit}>Bs/$</Text>
        </Text>
      </View>

      {/* Crear nueva alerta */}
      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>CREAR NUEVA ALERTA</Text>
        
        {/* Tipo de alerta */}
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, newAlertType === 'above' && styles.typeButtonActive]}
            onPress={() => setNewAlertType('above')}
            accessibilityRole="button"
            accessibilityLabel="Alertar cuando suba"
          >
            <View style={styles.typeIconContainer}>
              <Icon name="sube" size={24} color={newAlertType === 'above' ? '#10B981' : '#94A3B8'} />
            </View>
            <Text style={[styles.typeText, newAlertType === 'above' && styles.typeTextActive]}>
              Si sube a
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.typeButton, newAlertType === 'below' && styles.typeButtonActive]}
            onPress={() => setNewAlertType('below')}
            accessibilityRole="button"
            accessibilityLabel="Alertar cuando baje"
          >
            <View style={styles.typeIconContainer}>
              <Icon name="baja" size={24} color={newAlertType === 'below' ? '#EF4444' : '#94A3B8'} />
            </View>
            <Text style={[styles.typeText, newAlertType === 'below' && styles.typeTextActive]}>
              Si baja a
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input de valor */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputPrefix}>Bs</Text>
          <TextInput
            style={styles.input}
            value={newAlertValue}
            onChangeText={setNewAlertValue}
            keyboardType="numeric"
            placeholder={currentRate.toFixed(0)}
            placeholderTextColor="#475569"
          />
        </View>

        {/* Botón crear */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreateAlert}
          accessibilityRole="button"
          accessibilityLabel="Crear alerta"
        >
          <Text style={styles.createButtonText}>➕ Crear Alerta</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de alertas */}
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>
          MIS ALERTAS ({alerts.length})
        </Text>

        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Icon name="alert" size={48} color="#64748B" />
            </View>
            <Text style={styles.emptyText}>No tienes alertas configuradas</Text>
            <Text style={styles.emptySubtext}>
              Crea una alerta arriba para recibir avisos
            </Text>
          </View>
        ) : (
          alerts.map(alert => (
            <View 
              key={alert.id} 
              style={[
                styles.alertCard,
                alert.triggered && styles.alertCardTriggered,
                !alert.enabled && styles.alertCardDisabled
              ]}
            >
              <View style={styles.alertHeader}>
                <View style={styles.alertInfo}>
                  <View style={styles.alertIconContainer}>
                    {alert.triggered ? (
                      <Icon name="alert" size={24} color="#10B981" />
                    ) : alert.type === 'above' ? (
                      <Icon name="sube" size={24} color="#10B981" />
                    ) : (
                      <Icon name="baja" size={24} color="#EF4444" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.alertTitle}>
                      {alert.type === 'above' ? 'Si sube a' : 'Si baja a'} {alert.value.toFixed(2)} Bs
                    </Text>
                    <Text style={styles.alertStatus}>
                      {alert.triggered 
                        ? '¡Ya se disparó!' 
                        : (alert.enabled ? 'Activa' : 'Pausada')
                      }
                    </Text>
                  </View>
                </View>
                
                <Switch
                  value={alert.enabled && !alert.triggered}
                  onValueChange={() => toggleAlert(alert.id)}
                  trackColor={{ false: '#334155', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.alertActions}>
                {alert.triggered && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => resetAlert(alert.id)}
                  >
                    <Text style={styles.resetButtonText}>🔄 Reactivar</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAlert(alert.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️ Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Icon name="light" size={16} color="#F59E0B" />
        <Text style={styles.infoText}>
          Las alertas se verifican cada vez que se actualizan las tasas
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  currentRateCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  currentRateLabel: {
    fontSize: 11,
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  currentRateValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
  },
  currentRateUnit: {
    fontSize: 18,
    color: '#94A3B8',
  },
  createSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  typeIconContainer: {
    marginRight: 8,
  },
  typeText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#10B981',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputPrefix: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  alertsSection: {
    marginBottom: 20,
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIconContainer: {
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
  alertCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  alertCardTriggered: {
    borderColor: '#10B981',
    backgroundColor: '#1E3A2B',
  },
  alertCardDisabled: {
    opacity: 0.6,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  alertStatus: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  resetButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 8,
    textAlign: 'center',
  },
});
