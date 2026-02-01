import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

import BcvIcon from '../../assets/icons/Bank-icon-bcv.svg';
import BinanceIcon from '../../assets/icons/Binance-icon.svg';
import CalculatorIcon from '../../assets/icons/Calculator.svg';
import DollarIcon from '../../assets/icons/Dollar.svg';
import ArrowDownIcon from '../../assets/icons/Down-arrow.svg';
import EuroIcon from '../../assets/icons/Euro-icon.svg';
import GraphicIcon from '../../assets/icons/Graphic.svg';
import LightIcon from '../../assets/icons/Light.svg';
import HistorialMenuIcon from '../../assets/icons/Historialmenu.svg';
import NotificacionesMenuIcon from '../../assets/icons/notificacionesMenu.svg';
import TendenciaIcon from '../../assets/icons/tendencia.svg';
import AlertIcon from '../../assets/icons/alert.svg';
import CopiarIcon from '../../assets/icons/copiar-pegar.svg';
import SiSubeIcon from '../../assets/icons/Sisube.svg';
import SiBajaIcon from '../../assets/icons/Sibaja.svg';

const icons = {
  bcv: BcvIcon,
  binance: BinanceIcon,
  calculator: CalculatorIcon,
  dollar: DollarIcon,
  arrowDown: ArrowDownIcon,
  euro: EuroIcon,
  graphic: GraphicIcon,
  light: LightIcon,
  historialMenu: HistorialMenuIcon,
  notificacionesMenu: NotificacionesMenuIcon,
  tendencia: TendenciaIcon,
  alert: AlertIcon,
  copiar: CopiarIcon,
  sube: SiSubeIcon,
  baja: SiBajaIcon,
} as const;

export type IconName = keyof typeof icons;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: any;
}

export function Icon({ name, size = 24, color = '#F8FAFC', style }: IconProps) {
  const SvgIcon = icons[name];
  if (!SvgIcon) return null;

  return (
    <View style={[styles.container, style]}>
      <SvgIcon width={size} height={size} fill={color} />
    </View>
  );
}

export function AppLogo({ size = 50 }: { size?: number }) {
  return (
    <View style={[styles.logoContainer, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Image
        source={require('../../assets/icon.png')}
        style={{ width: size, height: size, borderRadius: size * 0.28 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  logoContainer: { overflow: 'hidden' },
});
