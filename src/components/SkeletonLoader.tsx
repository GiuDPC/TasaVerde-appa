import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

/**
 * Componente SkeletonLoader - Muestra un placeholder animado mientras carga el contenido
 * Se usa en lugar de ActivityIndicator para una experiencia más premium
 */

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

// Skeleton individual con animación de pulso
export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
}

// Skeleton para tarjeta de tasa principal (BCV Dólar)
export function MainCardSkeleton() {
  return (
    <View style={styles.mainCard}>
      <View style={styles.cardHeader}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={styles.cardTitleContainer}>
          <Skeleton width={100} height={18} style={{ marginBottom: 6 }} />
          <Skeleton width={160} height={12} />
        </View>
      </View>
      <View style={styles.rateRow}>
        <Skeleton width={150} height={52} borderRadius={8} />
        <Skeleton width={50} height={20} style={{ marginLeft: 12 }} />
      </View>
    </View>
  );
}

// Skeleton para tarjetas secundarias (Euro, Binance)
export function SecondaryCardSkeleton() {
  return (
    <View style={styles.secondaryCard}>
      <Skeleton width={40} height={40} borderRadius={10} style={{ marginBottom: 10 }} />
      <Skeleton width={70} height={12} style={{ marginBottom: 8 }} />
      <Skeleton width={80} height={26} borderRadius={6} />
      <Skeleton width={40} height={12} style={{ marginTop: 4 }} />
    </View>
  );
}

// Skeleton para el banner de mejor opción
export function BannerSkeleton() {
  return (
    <View style={styles.banner}>
      <Skeleton width={28} height={28} borderRadius={14} style={{ marginRight: 12 }} />
      <View style={{ flex: 1 }}>
        <Skeleton width={180} height={15} style={{ marginBottom: 6 }} />
        <Skeleton width={140} height={12} />
      </View>
    </View>
  );
}

// Pantalla completa de loading con skeletons
export function DashboardSkeleton() {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Skeleton width={50} height={50} borderRadius={14} style={{ marginRight: 12 }} />
          <View>
            <Skeleton width={80} height={26} style={{ marginBottom: 4 }} />
            <Skeleton width={120} height={12} />
          </View>
        </View>
        <View style={styles.updateInfo}>
          <Skeleton width={80} height={10} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={16} />
        </View>
      </View>

      {/* Banner Skeleton */}
      <BannerSkeleton />

      {/* Main Card Skeleton */}
      <MainCardSkeleton />

      {/* Grid Skeleton */}
      <View style={styles.cardGrid}>
        <SecondaryCardSkeleton />
        <SecondaryCardSkeleton />
      </View>

      {/* Comparison Card Skeleton */}
      <View style={styles.comparisonCard}>
        <View style={styles.comparisonHeader}>
          <Skeleton width={20} height={20} borderRadius={10} style={{ marginRight: 8 }} />
          <Skeleton width={140} height={14} />
        </View>
        <Skeleton width="100%" height={40} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
    paddingTop: 50,
  },
  skeleton: {
    backgroundColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateInfo: {
    alignItems: 'flex-end',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mainCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  secondaryCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  comparisonCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  comparisonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
