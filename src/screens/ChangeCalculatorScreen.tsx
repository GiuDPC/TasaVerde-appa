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

export function ChangeCalculatorScreen() {
  const { data: rates } = useRates();
  const [productPrice, setProductPrice] = useState('');
  const [amountGiven, setAmountGiven] = useState('');

  const activeRate = rates?.bestOption === 'bcv' ? rates?.bcv.usd : rates?.binance;

  const calculateChange = () => {
    const price = parseFloat(productPrice) || 0;
    const given = parseFloat(amountGiven) || 0;
    const changeUsd = given - price;
    
    if (changeUsd <= 0) return { usd: 0, bs: 0 };
    
    return {
      usd: changeUsd,
      bs: convertUsdToBs(changeUsd, activeRate || 0)
    };
  };

  const result = calculateChange();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>💰 Calculadora de Vuelto</Text>
          <Text style={styles.subtitle}>
            Calcula cuánto devolver en divisas o bolívares.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>PRECIO DEL PRODUCTO ($)</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>$</Text>
            <TextInput
              style={styles.input}
              value={productPrice}
              onChangeText={setProductPrice}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>BILLETE RECIBIDO ($)</Text>
            <View style={styles.presets}>
              {['10', '20', '50', '100'].map((val) => (
                <TouchableOpacity 
                  key={val} 
                  style={styles.presetButton}
                  onPress={() => setAmountGiven(val)}
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
              value={amountGiven}
              onChangeText={setAmountGiven}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#475569"
            />
          </View>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>VUELTO A ENTREGAR</Text>
            <Text style={styles.resultEmoji}>🪙</Text>
          </View>
          
          <View style={styles.splitResult}>
            <View style={styles.splitColumn}>
              <Text style={styles.splitLabel}>EN DÓLARES</Text>
              <Text style={styles.splitValue}>$ {result.usd.toFixed(2)}</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.splitColumnRight}>
              <Text style={styles.splitLabel}>EN BOLÍVARES</Text>
              <Text style={styles.splitValueBs}>
                Bs {result.bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.resetButton}
          onPress={() => { setProductPrice(''); setAmountGiven(''); }}
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
    marginBottom: 20,
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
  splitResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitColumn: {
    flex: 1,
  },
  splitColumnRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  splitLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  splitValue: {
    fontSize: 22,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  splitValueBs: {
    fontSize: 22,
    color: '#10B981',
    fontWeight: 'bold',
  },
  verticalDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
    marginHorizontal: 16,
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
