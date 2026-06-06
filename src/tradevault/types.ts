export type Page = 'dashboard' | 'journal' | 'calendar' | 'analytics' | 'mistakes';

export type TradeDirection = 'long' | 'short' | 'be';

export interface Trade {
  id: string;
  date: string;
  symbol: string;
  direction: TradeDirection;
  pnl: number;
  riskAmount: number;
  rMultiple: number;
  strategy: string;
  mistakes: string[];
  setupQuality: number;
  notes: string;
  screenshots: string[];
  entryTime: string;
  exitTime: string;
  confluences: string[];
  confidence: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface TradeStats {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  wins: number;
  losses: number;
  breakEven: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'be' | 'none';
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  avgRR: number;
  dailyPnl: Record<string, number>;
  pnlByStrategy: Record<string, { pnl: number; count: number; wins: number; breakEven: number }>;
  pnlByDayOfWeek: Record<number, { pnl: number; count: number; wins: number; breakEven: number }>;
  equityCurve: { date: string; equity: number }[];
  mistakeStats: Record<string, { count: number; totalPnl: number }>;
}

export function isBreakEven(t: Trade): boolean {
  return t.direction === 'be';
}

export const STRATEGIES = [
  'Scalping', 'Momentum', 'Reversal', 'Breakout',
  'Trend Following', 'VWAP Play', 'Gap Fill', 'Range Trading', 'Other',
] as const;

export const MISTAKE_OPTIONS = [
  'No stop loss', 'Overtrading', 'Revenge trade', 'FOMO entry',
  'Premature exit', 'Holding too long', 'Size too large', 'Ignored plan',
  'Chased entry', 'Averaged down', 'Ignored market conditions', 'Low liquidity',
] as const;

export const DEFAULT_CONFLUENCES = [
  'Support/Resistance', 'Trend line', 'Fibonacci', 'VWAP',
  'EMA alignment', 'Volume confirmation', 'Market structure', 'Order block',
  'Supply/Demand zone', 'Liquidity sweep', 'Divergence', 'Break of structure',
];
