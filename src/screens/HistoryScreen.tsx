import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import { useHistory } from '../hooks/useHistory';
import { Icon } from '../components/Icon';
import { HistoryEntry } from '../services/api';

const CHART_HEIGHT = 200;
const PADDING = 20;

type Period = 7 | 30 | 90;

// Componente de gráfico SVG optimizado con useMemo
const LineChart = React.memo(({ data, width, height }: { 
  data: HistoryEntry[]; 
  width: number; 
  height: number;
}) => {
  // Memoizar todos los cálculos matemáticos para evitar recálculos innecesarios
  const chartData = useMemo(() => {
    if (!data || data.length < 2) {
      return null;
    }

    // Calcular escala
    const values = data.map(d => d.bcvUsd);
    const minVal = Math.min(...values) * 0.995;
    const maxVal = Math.max(...values) * 1.005;
    const range = maxVal - minVal || 1;

    // Generar puntos del path
    const points = data.map((entry, i) => {
      const x = PADDING + (i / (data.length - 1)) * (width - PADDING * 2);
      const y = PADDING + (1 - (entry.bcvUsd - minVal) / range) * (height - PADDING * 2);
      return { x, y, value: entry.bcvUsd };
    });

    // Crear path SVG
    const pathD = points.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x} ${point.y}`;
      return `${acc} L ${point.x} ${point.y}`;
    }, '');

    // Crear área bajo la curva
    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - PADDING} L ${PADDING} ${height - PADDING} Z`;

    // Líneas de guía horizontales
    const gridLines = [0.25, 0.5, 0.75].map(pct => {
      const y = PADDING + pct * (height - PADDING * 2);
      const value = maxVal - pct * range;
      return { y, value };
    });

    return { points, pathD, areaD, gridLines };
  }, [data, width, height]);

  // Sin datos suficientes
  if (!chartData) {
    return (
      <View style={[styles.chartContainer, { width, height }]}>
        <Text style={styles.noDataText}>Sin datos suficientes para mostrar</Text>
      </View>
    );
  }

  const { points, pathD, areaD, gridLines } = chartData;

  return (
    <View 
      style={[styles.chartContainer, { width, height }]}
      accessible={true}
      accessibilityLabel={`Gráfico de líneas mostrando ${points.length} puntos de datos del dólar BCV`}
      accessibilityRole="image"
    >
      <Svg width={width} height={height}>
        {/* Líneas de guía */}
        {gridLines.map((line, i) => (
          <React.Fragment key={i}>
            <Line
              x1={PADDING}
              y1={line.y}
              x2={width - PADDING}
              y2={line.y}
              stroke="#334155"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={width - 5}
              y={line.y + 4}
              fontSize={10}
              fill="#64748B"
              textAnchor="end"
            >
              {line.value.toFixed(1)}
            </SvgText>
          </React.Fragment>
        ))}
        
        {/* Área bajo la curva */}
        <Path
          d={areaD}
          fill="rgba(16, 185, 129, 0.1)"
        />
        
        {/* Línea principal */}
        <Path
          d={pathD}
          stroke="#10B981"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Punto inicial */}
        <Circle
          cx={points[0].x}
          cy={points[0].y}
          r={4}
          fill="#1E293B"
          stroke="#64748B"
          strokeWidth={2}
        />
        
        {/* Punto final (actual) */}
        <Circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={6}
          fill="#10B981"
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
});

// Selector de período optimizado con accesibilidad
const PeriodSelector = React.memo(({ 
  selected, 
  onSelect 
}: { 
  selected: Period; 
  onSelect: (p: Period) => void; 
}) => {
  const periods: { value: Period; label: string; accessibilityLabel: string }[] = [
    { value: 7, label: '7D', accessibilityLabel: 'Ver historial de 7 días' },
    { value: 30, label: '30D', accessibilityLabel: 'Ver historial de 30 días' },
    { value: 90, label: '90D', accessibilityLabel: 'Ver historial de 90 días' },
  ];

  return (
    <View style={styles.periodContainer} accessibilityRole="tablist">
      {periods.map(({ value, label, accessibilityLabel }) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.periodButton,
            selected === value && styles.periodButtonActive
          ]}
          onPress={() => onSelect(value)}
          accessibilityRole="tab"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ selected: selected === value }}
        >
          <Text style={[
            styles.periodText,
            selected === value && styles.periodTextActive
          ]}>
            {label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

// Tarjeta de estadística con accesibilidad
const StatCard = React.memo(({ 
  label, 
  value, 
  color = '#F8FAFC' 
}: { 
  label: string; 
  value: string; 
  color?: string;
}) => (
  <View 
    style={styles.statCard}
    accessible={true}
    accessibilityLabel={`${label}: ${value}`}
  >
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
));

export function HistoryScreen() {
  // Hook dinámico para dimensiones (soporta rotación de pantalla)
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 60;

  const [period, setPeriod] = useState<Period>(7);
  const { data, isLoading, isError, refetch, isRefetching } = useHistory(period);

  const handlePeriodChange = useCallback(async (newPeriod: Period) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPeriod(newPeriod);
  }, []);

  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  }, [refetch]);

  // Datos de tendencia memoizados
  const trend = data?.trend;
  
  const trendIcon = useMemo(() => {
    if (!trend) return '➡️';
    if (trend.direction === 'up') return '📈';
    if (trend.direction === 'down') return '📉';
    return '➡️';
  }, [trend]);

  const trendColor = useMemo(() => {
    if (!trend) return '#94A3B8';
    if (trend.direction === 'up') return '#EF4444';
    if (trend.direction === 'down') return '#10B981';
    return '#94A3B8';
  }, [trend]);

  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPadding}>
          <View style={styles.headerRow}>
            <View style={styles.titleIcon}>
              <Icon name="graphic" size={28} color="#10B981" />
            </View>
            <View>
              <Text style={styles.title}>Historial</Text>
              <Text style={styles.subtitle}>Cargando datos...</Text>
            </View>
          </View>
        </View>
        <View style={[styles.chartPlaceholder, { height: CHART_HEIGHT }]}>
          <Text style={styles.placeholderText}>Cargando gráfico...</Text>
        </View>
      </View>
    );
  }

  // Error o sin datos
  if (isError || !data) {
    return (
      <View style={styles.container}>
        <View style={styles.headerPadding}>
          <View style={styles.headerRow}>
            <View style={styles.titleIcon}>
              <Icon name="graphic" size={28} color="#10B981" />
            </View>
            <View>
              <Text style={styles.title}>Historial</Text>
              <Text style={styles.subtitle}>Sin datos disponibles</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Sin historial aún</Text>
          <Text style={styles.emptySubtitle}>
            El historial se genera automáticamente cada 30 minutos.
            Vuelve más tarde para ver la tendencia.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="Reintentar carga de datos"
          >
            <Text style={styles.retryText}>🔄 Reintentar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={handleRefresh}
          tintColor="#10B981"
          colors={['#10B981']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.titleIcon}>
            <Icon name="tendencia" size={28} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.title}>Historial</Text>
            <Text style={styles.subtitle}>Evolución del dólar BCV</Text>
          </View>
        </View>
      </View>

      {/* Selector de período */}
      <PeriodSelector selected={period} onSelect={handlePeriodChange} />

      {/* Tarjeta de tendencia */}
      <View 
        style={styles.trendCard}
        accessible={true}
        accessibilityLabel={`Tendencia últimos ${period} días: ${trend?.changePercent || 0}%`}
      >
        <View style={styles.trendHeader}>
          <Text style={styles.trendIcon}>{trendIcon}</Text>
          <View style={styles.trendInfo}>
            <Text style={styles.trendTitle}>
              Tendencia últimos {period} días
            </Text>
            <Text style={[styles.trendChange, { color: trendColor }]}>
              {trend && trend.changePercent > 0 ? '+' : ''}{trend?.changePercent || 0}%
            </Text>
          </View>
        </View>
        {trend && (
          <Text style={styles.trendDescription}>
            {trend.direction === 'up' && `El dólar subió de ${trend.firstValue?.toFixed(2)} a ${trend.lastValue?.toFixed(2)} Bs`}
            {trend.direction === 'down' && `El dólar bajó de ${trend.firstValue?.toFixed(2)} a ${trend.lastValue?.toFixed(2)} Bs`}
            {trend.direction === 'stable' && `El dólar se mantiene estable alrededor de ${trend.avgBcv?.toFixed(2)} Bs`}
          </Text>
        )}
      </View>

      {/* Gráfico con dimensiones dinámicas */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>BCV DÓLAR (Bs/$)</Text>
        <LineChart 
          data={data.data} 
          width={chartWidth} 
          height={CHART_HEIGHT} 
        />
      </View>

      {/* Estadísticas */}
      <View style={styles.statsGrid}>
        <StatCard 
          label="Mínimo" 
          value={trend && trend.dataPoints > 0 ? `${trend.minBcv?.toFixed(2)} Bs` : '--'} 
          color="#10B981" 
        />
        <StatCard 
          label="Máximo" 
          value={trend && trend.dataPoints > 0 ? `${trend.maxBcv?.toFixed(2)} Bs` : '--'} 
          color="#EF4444" 
        />
        <StatCard 
          label="Promedio" 
          value={trend && trend.dataPoints > 0 ? `${trend.avgBcv?.toFixed(2)} Bs` : '--'} 
        />
        <StatCard 
          label="Datos" 
          value={trend ? `${trend.dataPoints || 0} puntos` : '0 puntos'} 
        />
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <Icon name="light" size={16} color="#F59E0B" />
        <Text style={styles.infoText}>
          Las tasas se guardan cada 30 minutos
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
  headerPadding: {
    padding: 20,
    paddingTop: 50,
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
  periodContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#10B981',
  },
  periodText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  trendCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 14,
    color: '#94A3B8',
  },
  trendChange: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  trendDescription: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
  },
  chartCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chartTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlaceholder: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 14,
  },
  noDataText: {
    color: '#64748B',
    fontSize: 14,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    marginHorizontal: '1%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
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
