import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { calcularDiferenciaPorcentual } from '../utils/formatCurrency';

interface BestOptionBadgeProps {
  bcvRate: number;
  binanceRate: number;
}

export function BestOptionBadge({ bcvRate, binanceRate }: BestOptionBadgeProps) {
  // Encontrar la tasa más baja (mejor para el consumidor)
  const rates = [
    { name: 'BCV (oficial)', rate: bcvRate },
    { name: 'Binance P2P', rate: binanceRate },
  ];
  
  const sorted = [...rates].sort((a, b) => a.rate - b.rate);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  
  const diferencia = calcularDiferenciaPorcentual(best.rate, worst.rate);

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.emoji}>💡</Text>
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            Pagar con <Text style={styles.highlight}>{best.name}</Text> es
          </Text>
          <Text style={styles.percentage}>
            {diferencia.toFixed(1)}% más barato hoy
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 12,
    padding: 12,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 14,
  },
  highlight: {
    color: '#22C55E',
    fontWeight: 'bold',
  },
  percentage: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
