import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

interface RatesForWhatsApp {
  bcv: number;
  binance: number;
  bestOption: string;
}

export async function copyRatesToClipboard(rates: RatesForWhatsApp): Promise<void> {
  const now = new Date();
  const hora = now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
  const fecha = now.toLocaleDateString('es-VE');

  const bestOptionEmoji = {
    bcv: '🏦',
    binance: '🔷',
  }[rates.bestOption] || '✅';

  const texto = `💰 *TASAS V-RATE*
━━━━━━━━━━━━━━━
🏦 BCV: Bs. ${rates.bcv.toFixed(2)}
🔷 Binance: Bs. ${rates.binance.toFixed(2)}
━━━━━━━━━━━━━━━
${bestOptionEmoji} Mejor: ${rates.bestOption.toUpperCase()}
🕐 ${hora} | 📅 ${fecha}
━━━━━━━━━━━━━━━
_Generado por V-Rate App_`;

  await Clipboard.setStringAsync(texto);
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
