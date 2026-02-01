import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRates } from '../hooks/useRates';
import { convertUsdToBs } from '../utils/formatCurrency';

export function MixedPaymentScreen() {
  const { data: rates } = useRates();
  const [totalAmount, setTotalAmount] = useState('');
  const [cashAmount, setCashAmount] = useState('');

  const activeRate = rates?.bestOption === 'bcv' ? rates?.bcv.usd : rates?.binance;
  const activeRateLabel = rates?.bestOption === 'bcv' ? 'BCV' : 'Binance';

  const calculateRemaining = () => {
    const total = parseFloat(totalAmount) || 0;
    const cash = parseFloat(cashAmount) || 0;
    const remainingUsd = total - cash;
    
    if (remainingUsd <= 0) return { usd: 0, bs: 0 };
    
    return {
      usd: remainingUsd,
      bs: convertUsdToBs(remainingUsd, activeRate || 0)
    };
  };

  const result = calculateRemaining();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🧮 Calculadora de Pago Mixto</Text>
          <Text style={styles.subtitle}>
            Calcula el restante exacto en bolívares al pagar con divisas.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>TOTAL A PAGAR ($)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>$</Text>
            <TextInput
              style={styles.input}
              value={totalAmount}
              onChangeText={setTotalAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>EFECTIVO ENTREGADO ($)</Text>
            <View style={styles.presets}>
              {['5', '10', '20', '50'].map((val) => (
                <TouchableOpacity 
                  key={val} 
                  style={styles.presetButton}
                  onPress={() => setCashAmount(val)}
                >
                  <Text style={styles.presetText}>${val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>$</Text>
            <TextInput
              style={styles.input}
              value={cashAmount}
              onChangeText={setCashAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>RESTANTE EN BOLÍVARES</Text>
            <Text style={styles.resultEmoji}>💵</Text>
          </View>
          
          <View style={styles.amountContainer}>
            <Text style={styles.amountBs}>
              {result.bs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.currencyBs}>Bs</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View>
              <Text style={styles.detailLabel}>DIFERENCIA USD</Text>
              <Text style={styles.detailValue}>$ {result.usd.toFixed(2)}</Text>
            </View>
            <View style={styles.detailRight}>
              <Text style={styles.detailLabel}>TASA ({activeRateLabel})</Text>
              <Text style={styles.detailValueRate}>
                {activeRate?.toFixed(2)} Bs/$
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => { setTotalAmount(''); setCashAmount(''); }}
        >
          <Text style={styles.resetText}>🔄 Reiniciar Calculadora</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    fontSize: 20,
    color: '#94A3B8',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  presets: {
    flexDirection: 'row',
  },
  presetButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    marginLeft: 6,
  },
  presetText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  resultEmoji: {
    fontSize: 20,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 20,
  },
  amountBs: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  currencyBs: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 20,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRight: {
    alignItems: 'flex-end',
  },
  detailLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    color: '#F8FAFC',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  detailValueRate: {
    fontSize: 16,
    color: '#10B981',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  resetButton: {
    alignItems: 'center',
    marginTop: 24,
    padding: 12,
  },
  resetText: {
    color: '#64748B',
    fontSize: 14,
  }
});
