import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatBs } from '../utils/formatCurrency';

interface RateCardProps {
  title: string;
  emoji: string;
  rate: number;
  convertedAmount?: number;
  isBestOption?: boolean;
  accentColor?: string;
}

export function RateCard({
  title,
  emoji,
  rate,
  convertedAmount,
  isBestOption = false,
  accentColor = '#10B981',
}: RateCardProps) {
  return (
    <View style={[styles.card, isBestOption && { borderColor: '#22C55E', borderWidth: 2 }]}>
      {isBestOption && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>✓ MEJOR OPCIÓN</Text>
        </View>
      )}
      
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rateContainer}>
        <Text style={styles.rateLabel}>Tasa:</Text>
        <Text style={[styles.rateValue, { color: accentColor }]}>
          Bs. {rate.toFixed(2)}
        </Text>
      </View>
      
      {convertedAmount !== undefined && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Resultado:</Text>
          <Text style={styles.resultValue}>{formatBs(convertedAmount)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  bestBadge: {
    position: 'absolute',
    top: -10,
    right: 10,
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rateLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  resultLabel: {
    color: '#94A3B8',
    fontSize: 14,
  },
  resultValue: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
