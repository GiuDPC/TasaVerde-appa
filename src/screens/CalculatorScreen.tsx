import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useRates } from '../hooks/useRates';
import { Icon } from '../components/Icon';
import { 
  parseCurrencyInput, 
  formatCurrencyDisplay, 
  formatForCopy 
} from '../utils/currency';

type ConversionMode = 'usdToBs' | 'bsToUsd';

export function CalculatorScreen() {
  const { data: rates, isLoading, isError } = useRates();
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<ConversionMode>('usdToBs');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Manejar cambio de input
  const handleAmountChange = useCallback((text: string) => {
    // Permitir escribir libremente, solo filtrar caracteres invalidos
    const cleaned = text.replace(/[^\d.,]/g, '');
    setInputValue(cleaned);
  }, []);

  // Obtener valor numerico para calculos
  const getNumericValue = useCallback((): number => {
    return parseCurrencyInput(inputValue);
  }, [inputValue]);

  // Funcion para copiar resultado al portapapeles
  const copyToClipboard = async (value: number, index: number) => {
    const formattedValue = formatForCopy(value);
    await Clipboard.setStringAsync(formattedValue);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Cargando tasas...</Text>
      </View>
    );
  }

  if (isError || !rates) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert" size={48} color="#EF4444" />
        <Text style={styles.errorText}>Error de conexion</Text>
        <Text style={styles.errorSubtext}>Verifica que el servidor este corriendo</Text>
      </View>
    );
  }

  const numericAmount = getNumericValue();

  // Calcular conversiones
  const calculateConversion = (rate: number): number => {
    if (mode === 'usdToBs') {
      return numericAmount * rate;
    } else {
      return numericAmount / rate;
    }
  };

  const bcvUsdResult = calculateConversion(rates.bcv.usd);
  const bcvEurResult = calculateConversion(rates.bcv.eur);
  const binanceResult = calculateConversion(rates.binance);

  // Formatear resultado segun modo
  const formatResult = (value: number): string => {
    if (value === 0 || isNaN(value)) return mode === 'usdToBs' ? 'Bs. 0,00' : '$ 0.00';
    
    if (mode === 'usdToBs') {
      // Resultado en Bolivares: formato VES
      return `Bs. ${formatCurrencyDisplay(value, 'VES')}`;
    } else {
      // Resultado en Dolares: formato USD
      return `$ ${formatCurrencyDisplay(value, 'USD')}`;
    }
  };

  const toggleMode = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMode(mode === 'usdToBs' ? 'bsToUsd' : 'usdToBs');
    setInputValue('');
  };

  // Haptic feedback al seleccionar monto rapido
  const handleQuickAmount = async (val: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue(val);
  };

  // Placeholder segun modo
  const getPlaceholder = (): string => {
    if (mode === 'usdToBs') {
      return '100.00';
    } else {
      return '37025.00';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleIcon}>
            <Icon name="calculator" size={28} color="#10B981" />
          </View>
          <View>
            <Text style={styles.title}>Calculadora</Text>
            <Text style={styles.subtitle}>Convierte entre divisas y bolivares</Text>
          </View>
        </View>
      </View>

      {/* Mode Toggle */}
      <TouchableOpacity style={styles.modeToggle} onPress={toggleMode}>
        <View style={[styles.modeOption, mode === 'usdToBs' && styles.modeActive]}>
          <View style={styles.modeContent}>
            <Icon name="dollar" size={20} color={mode === 'usdToBs' ? '#FFFFFF' : '#94A3B8'} />
            <Icon name="arrowDown" size={16} color={mode === 'usdToBs' ? '#FFFFFF' : '#94A3B8'} style={{ transform: [{ rotate: '-90deg' }], marginHorizontal: 4 }} />
            <Text style={[styles.modeText, mode === 'usdToBs' && styles.modeTextActive]}>Bs</Text>
          </View>
        </View>
        <View style={styles.swapIcon}>
          <Icon name="arrowDown" size={18} color="#F8FAFC" style={{ transform: [{ rotate: '90deg' }] }} />
        </View>
        <View style={[styles.modeOption, mode === 'bsToUsd' && styles.modeActive]}>
          <View style={styles.modeContent}>
            <Text style={[styles.modeText, mode === 'bsToUsd' && styles.modeTextActive]}>Bs</Text>
            <Icon name="arrowDown" size={16} color={mode === 'bsToUsd' ? '#FFFFFF' : '#94A3B8'} style={{ transform: [{ rotate: '-90deg' }], marginHorizontal: 4 }} />
            <Icon name="dollar" size={20} color={mode === 'bsToUsd' ? '#FFFFFF' : '#94A3B8'} />
          </View>
        </View>
      </TouchableOpacity>

      {/* Input */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>
          {mode === 'usdToBs' ? 'MONTO EN DOLARES (USD)' : 'MONTO EN BOLIVARES (VES)'}
        </Text>
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
            <Icon name="dollar" size={24} color="#10B981" />
          </View>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={handleAmountChange}
            keyboardType="decimal-pad"
            placeholder={getPlaceholder()}
            placeholderTextColor="#475569"
          />
          <Text style={styles.inputSuffix}>
            {mode === 'usdToBs' ? 'USD' : 'VES'}
          </Text>
        </View>
        {numericAmount > 0 && (
          <Text style={styles.parsedValue}>
            Valor: {formatCurrencyDisplay(numericAmount, mode === 'usdToBs' ? 'USD' : 'VES')}
          </Text>
        )}
      </View>

      {/* Quick Amount Buttons */}
      <View style={styles.quickAmounts}>
        {(mode === 'usdToBs' 
          ? ['5', '10', '20', '50', '100'] 
          : ['1000', '5000', '10000', '50000', '100000']
        ).map((val) => (
          <TouchableOpacity
            key={val}
            style={styles.quickButton}
            onPress={() => handleQuickAmount(val)}
          >
            <Text style={styles.quickButtonText}>
              {mode === 'usdToBs' ? `$${val}` : formatCurrencyDisplay(parseInt(val), 'VES').split(',')[0]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.resultsTitle}>
          {mode === 'usdToBs' ? 'RESULTADO EN BOLIVARES' : 'RESULTADO EN DOLARES'}
        </Text>

        {/* BCV USD */}
        <View style={[styles.resultCard, rates.bestOption === 'bcv' && styles.resultCardBest]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Icon name="bcv" size={22} color="#10B981" />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>BCV Dolar</Text>
              <Text style={styles.resultRate}>{rates.bcv.usd.toFixed(2)} Bs/$</Text>
            </View>
            <TouchableOpacity 
              style={[styles.copyButton, copiedIndex === 0 && styles.copyButtonSuccess]}
              onPress={() => copyToClipboard(bcvUsdResult, 0)}
            >
              {copiedIndex === 0 ? (
                <Text style={styles.checkIcon}>OK</Text>
              ) : (
                <Icon name="copiar" size={20} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.resultValue}>{formatResult(bcvUsdResult)}</Text>
          {rates.bestOption === 'bcv' && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>MEJOR TASA</Text>
            </View>
          )}
        </View>

        {/* BCV EUR */}
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Icon name="euro" size={22} color="#3B82F6" />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>BCV Euro</Text>
              <Text style={styles.resultRate}>{rates.bcv.eur.toFixed(2)} Bs/EUR</Text>
            </View>
            <TouchableOpacity 
              style={[styles.copyButton, copiedIndex === 1 && styles.copyButtonSuccess]}
              onPress={() => copyToClipboard(bcvEurResult, 1)}
            >
              {copiedIndex === 1 ? (
                <Text style={styles.checkIcon}>OK</Text>
              ) : (
                <Icon name="copiar" size={20} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.resultValue}>{formatResult(bcvEurResult)}</Text>
        </View>

        {/* Binance */}
        <View style={[styles.resultCard, rates.bestOption === 'binance' && styles.resultCardBest]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIconContainer, { backgroundColor: 'rgba(240, 185, 11, 0.2)' }]}>
              <Icon name="binance" size={22} color="#F0B90B" />
            </View>
            <View style={styles.resultInfo}>
              <Text style={styles.resultName}>Binance P2P</Text>
              <Text style={styles.resultRate}>{rates.binance.toFixed(2)} Bs/$</Text>
            </View>
            <TouchableOpacity 
              style={[styles.copyButton, copiedIndex === 2 && styles.copyButtonSuccess]}
              onPress={() => copyToClipboard(binanceResult, 2)}
            >
              {copiedIndex === 2 ? (
                <Text style={styles.checkIcon}>OK</Text>
              ) : (
                <Icon name="copiar" size={20} color="#94A3B8" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.resultValue}>{formatResult(binanceResult)}</Text>
          {rates.bestOption === 'binance' && (
            <View style={styles.bestBadge}>
              <Text style={styles.bestBadgeText}>MEJOR TASA</Text>
            </View>
          )}
        </View>
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Icon name="light" size={16} color="#F59E0B" />
        <Text style={styles.infoText}>
          Puedes escribir 3500 o 3.500 o 3,500 - la app lo entiende
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  errorText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#94A3B8',
    fontSize: 14,
  },
  header: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
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
  modeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
  },
  modeOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeActive: {
    backgroundColor: '#10B981',
  },
  modeText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  swapIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    paddingHorizontal: 16,
    height: 70,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 28,
    color: '#F8FAFC',
    fontWeight: 'bold',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 8,
  },
  parsedValue: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    marginLeft: 4,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quickButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  resultCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resultCardBest: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#1E3A2B',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 15,
    color: '#F8FAFC',
    fontWeight: '600',
  },
  resultRate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  resultValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#10B981',
    marginLeft: 52,
  },
  bestBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bestBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  copyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  copyButtonSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  infoText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 8,
  },
});
