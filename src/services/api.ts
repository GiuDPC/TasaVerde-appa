import axios from 'axios';

// URL de produccion (Render)
const API_URL = 'https://kambio-server.onrender.com/api';

export interface Rates {
  bcv: {
    usd: number;
    eur: number;
    date: string | null;
  };
  binance: number;
  bestOption: 'bcv' | 'binance';
  lastUpdated: string;
}

export interface HistoryEntry {
  timestamp: string;
  bcvUsd: number;
  bcvEur: number;
  binance: number;
}

export interface Trend {
  direction: 'up' | 'down' | 'stable';
  changePercent: number;
  minBcv: number;
  maxBcv: number;
  avgBcv: number;
  firstValue: number;
  lastValue: number;
  dataPoints: number;
}

export interface HistoryResponse {
  period: number;
  trend: Trend;
  data: HistoryEntry[];
}

export async function fetchAllRates(): Promise<Rates> {
  const response = await axios.get(`${API_URL}/rates`);
  return response.data;
}

export async function fetchHistory(days: number = 7): Promise<HistoryResponse> {
  const response = await axios.get(`${API_URL}/history`, { params: { days } });
  return response.data;
}

export async function fetchTrend(days: number = 7): Promise<Trend> {
  const response = await axios.get(`${API_URL}/trend`, { params: { days } });
  return response.data;
}
