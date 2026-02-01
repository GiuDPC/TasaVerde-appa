/**
 * Formatea un número como moneda venezolana (Bolívares)
 */
export function formatBs(amount: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('VES', 'Bs.');
}

/**
 * Formatea un número como dólares USD
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convierte USD a Bolívares usando una tasa específica
 */
export function convertUsdToBs(usd: number, rate: number): number {
  return usd * rate;
}

/**
 * Calcula el vuelto en bolívares
 * @param montoCompra - Precio del producto en USD
 * @param billeteEntregado - Billete con el que se paga en USD
 * @param tasa - Tasa de cambio a usar
 * @returns Vuelto en Bolívares
 */
export function calcularVuelto(
  montoCompra: number,
  billeteEntregado: number,
  tasa: number
): number {
  const vueltoEnDolares = billeteEntregado - montoCompra;
  if (vueltoEnDolares < 0) return 0;
  return vueltoEnDolares * tasa;
}

/**
 * Calcula el porcentaje de diferencia entre dos tasas
 */
export function calcularDiferenciaPorcentual(tasa1: number, tasa2: number): number {
  return ((tasa2 - tasa1) / tasa1) * 100;
}
