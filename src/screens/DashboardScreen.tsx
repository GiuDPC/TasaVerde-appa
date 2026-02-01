import React, { useMemo, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRates } from '../hooks/useRates';
import { FadeInView, PulsingBadge } from '../components/AnimatedComponents';
import { Icon, AppLogo } from '../components/Icon';
import { DashboardSkeleton } from '../components/SkeletonLoader';

const RateHeader = ({ lastUpdated }: { lastUpdated: string }) => (
  <View style={styles.header}>
    <View style={styles.logoContainer}>
      <AppLogo size={50} />
      <View>
        <Text style={styles.logo}>Kambio</Text>
        <Text style={styles.logoSubtitle}>Tasas en Tiempo Real</Text>
      </View>
    </View>
    <View style={styles.updateInfo}>
      <Text style={styles.updateLabel}>ACTUALIZADO</Text>
      <Text style={styles.updateTime}>{lastUpdated}</Text>
    </View>
  </View>
);

export function DashboardScreen() {
  const { data: rates, isLoading, isError, refetch, isRefetching } = useRates();

  const diferencia = useMemo(() => {
    if (!rates) return "0.0";
    return ((rates.binance - rates.bcv.usd) / rates.bcv.usd * 100).toFixed(1);
  }, [rates]);

  // Refetch con haptic feedback
  const handleRefresh = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    refetch();
  }, [refetch]);

  // Retry con haptic feedback
  const handleRetry = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    refetch();
  }, [refetch]);

  if (isLoading) return <DashboardSkeleton />;

  if (isError || !rates) return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorText}>Error al cargar las tasas</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
        <Text style={styles.retryText}>🔄 Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  const lastUpdated = rates.lastUpdated 
    ? new Date(rates.lastUpdated).toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }) 
    : '--:--';

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
      <FadeInView delay={0}>
        <RateHeader lastUpdated={lastUpdated} />
      </FadeInView>

      <FadeInView delay={100}>
        <View style={styles.bestOptionBanner}>
          <View style={styles.lightIconContainer}>
             <Icon name="light" size={28} color="#F59E0B" />
          </View>
          <View style={styles.bestOptionText}>
            <Text style={styles.bestOptionTitle}>
              Mejor opción: <Text style={styles.bestOptionHighlight}>{rates.bestOption === 'bcv' ? 'BCV' : 'Binance'}</Text>
            </Text>
            <Text style={styles.bestOptionSubtitle}>Diferencia del {diferencia}% entre tasas</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={200}>
        <View style={[styles.mainCard, rates.bestOption === 'bcv' && styles.mainCardBest]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}><Icon name="bcv" size={26} color="#10B981" /></View>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>BCV Dólar</Text>
              <Text style={styles.cardSubtitle}>Banco Central de Venezuela</Text>
            </View>
            {rates.bestOption === 'bcv' && <PulsingBadge text="MEJOR" color="#10B981" />}
          </View>
          <View style={styles.rateRow}>
            <Text style={styles.mainRate}>{rates.bcv.usd.toFixed(2)}</Text>
            <Text style={styles.mainCurrency}>Bs/$</Text>
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={300}>
        <View style={styles.cardGrid}>
          <View style={styles.secondaryCard}>
             <View style={[styles.secondaryIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}><Icon name="euro" size={24} color="#3B82F6" /></View>
             <Text style={styles.secondaryTitle}>BCV Euro</Text>
             <Text style={styles.secondaryRate}>{rates.bcv.eur.toFixed(2)}</Text>
             <Text style={styles.secondaryUnit}>Bs/€</Text>
          </View>

          <View style={[styles.secondaryCard, rates.bestOption === 'binance' && styles.secondaryCardBest]}>
             <View style={[styles.secondaryIcon, { backgroundColor: 'rgba(240, 185, 11, 0.2)' }]}><Icon name="binance" size={24} color="#F0B90B" /></View>
             <Text style={styles.secondaryTitle}>Binance P2P</Text>
             <Text style={styles.secondaryRate}>{rates.binance.toFixed(2)}</Text>
             <Text style={styles.secondaryUnit}>Bs/$</Text>
             {rates.bestOption === 'binance' && (
               <View style={styles.secondaryBestBadge}>
                 <Text style={styles.secondaryBestText}>MEJOR</Text>
               </View>
             )}
          </View>
        </View>
      </FadeInView>

      <FadeInView delay={400}>
        <View style={styles.comparisonCard}>
          <View style={styles.comparisonHeader}>
            <Icon name="graphic" size={20} color="#10B981" />
            <Text style={styles.comparisonTitle}>Comparación de Tasas</Text>
          </View>
          <View style={styles.comparisonRow}>
            <Text style={styles.comparisonLabel}>BCV vs Binance:</Text>
            <Text style={[
              styles.comparisonValue,
              parseFloat(diferencia) > 0 ? styles.comparisonUp : styles.comparisonDown
            ]}>
              {parseFloat(diferencia) > 0 ? '📈' : '📉'} {diferencia}%
            </Text>
          </View>
          <Text style={styles.comparisonExplain}>
            {parseFloat(diferencia) > 0 
              ? `Binance está ${diferencia}% más alto que BCV`
              : `BCV está ${Math.abs(parseFloat(diferencia))}% más alto que Binance`
            }
          </Text>
        </View>
      </FadeInView>

      <FadeInView delay={500}>
        <View style={styles.footerContainer}>
          <Icon name="arrowDown" size={16} color="#64748B" />
          <Text style={styles.footer}>Desliza hacia abajo para actualizar</Text>
        </View>
      </FadeInView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  loadingText: { color: '#94A3B8', marginTop: 16, fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A', padding: 20 },
  errorEmoji: { fontSize: 64, marginBottom: 16 },
  errorText: { color: '#F8FAFC', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  retryButton: { backgroundColor: '#10B981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  logo: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC' },
  logoSubtitle: { fontSize: 12, color: '#94A3B8' },
  updateInfo: { alignItems: 'flex-end' },
  updateLabel: { fontSize: 10, color: '#64748B', letterSpacing: 0.5 },
  updateTime: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  bestOptionBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: '#10B981', borderRadius: 16, padding: 16, marginBottom: 20 },
  lightIconContainer: { marginRight: 12 },
  bestOptionText: { flex: 1 },
  bestOptionTitle: { fontSize: 15, color: '#F8FAFC' },
  bestOptionHighlight: { color: '#10B981', fontWeight: 'bold' },
  bestOptionSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  mainCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  mainCardBest: { backgroundColor: '#1E3A2B', borderColor: '#10B981', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cardIconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(16, 185, 129, 0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardTitleContainer: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#F8FAFC' },
  cardSubtitle: { fontSize: 12, color: '#64748B' },
  rateRow: { flexDirection: 'row', alignItems: 'baseline' },
  mainRate: { fontSize: 52, fontWeight: 'bold', color: '#F8FAFC' },
  mainCurrency: { fontSize: 20, color: '#94A3B8', marginLeft: 8 },
  cardGrid: { flexDirection: 'row', marginBottom: 16 },
  secondaryCard: { flex: 1, backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginHorizontal: 6, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
  secondaryCardBest: { borderColor: '#10B981', borderWidth: 2, backgroundColor: '#1E3A2B' },
  secondaryIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  secondaryTitle: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  secondaryRate: { fontSize: 26, fontWeight: 'bold', color: '#F8FAFC' },
  secondaryUnit: { fontSize: 12, color: '#64748B' },
  secondaryBestBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#10B981', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  secondaryBestText: { fontSize: 8, fontWeight: 'bold', color: '#FFFFFF' },
  comparisonCard: { backgroundColor: '#1E293B', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  comparisonHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  comparisonTitle: { fontSize: 14, fontWeight: 'bold', color: '#F8FAFC', marginLeft: 8 },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  comparisonLabel: { fontSize: 14, color: '#94A3B8' },
  comparisonValue: { fontSize: 16, fontWeight: 'bold' },
  comparisonUp: { color: '#EF4444' },
  comparisonDown: { color: '#10B981' },
  comparisonExplain: { fontSize: 12, color: '#64748B', fontStyle: 'italic' },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  footer: { color: '#64748B', fontSize: 12, marginLeft: 8 },
});
