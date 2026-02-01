// Utilidades para manejo de monedas VES/USD

export function parseCurrencyInput(text: string): number {
  if (!text || text.trim() === '') return 0;
  
  let cleaned = text.trim();
  const dots = (cleaned.match(/\./g) || []).length;
  const commas = (cleaned.match(/,/g) || []).length;
  
  if (dots === 1 && commas === 0) {
    const parts = cleaned.split('.');
    if (parts[1] && parts[1].length === 3 && parts[0].length <= 3) {
      return parseFloat(cleaned.replace('.', '')) || 0;
    }
    return parseFloat(cleaned) || 0;
  }
  
  if (commas === 1 && dots === 0) {
    const parts = cleaned.split(',');
    if (parts[1] && parts[1].length === 3 && parts[0].length <= 3) {
      return parseFloat(cleaned.replace(',', '')) || 0;
    }
    return parseFloat(cleaned.replace(',', '.')) || 0;
  }
  
  if (dots > 1 || (dots >= 1 && commas >= 1)) {
    const lastDot = cleaned.lastIndexOf('.');
    const lastComma = cleaned.lastIndexOf(',');
    
    if (lastComma > lastDot) {
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) || 0;
    } else {
      return parseFloat(cleaned.replace(/,/g, '')) || 0;
    }
  }
  
  if (commas > 1) {
    return parseFloat(cleaned.replace(/,/g, '')) || 0;
  }
  
  return parseFloat(cleaned.replace(/[^\d]/g, '')) || 0;
}

export function formatCurrencyDisplay(value: number, currency: 'VES' | 'USD'): string {
  if (isNaN(value) || value === 0) return '';
  
  const locale = currency === 'VES' ? 'es-VE' : 'en-US';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatForCopy(value: number): string {
  if (isNaN(value)) return '0.00';
  return value.toFixed(2);
}
