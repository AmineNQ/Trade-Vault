import { supabase as supabaseClient } from '@/integrations/supabase/client';
// Cast to `any` because Supabase generated types haven't synced for these tables yet.
// Runtime behavior is unchanged; RLS still enforces auth.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = supabaseClient as any;
import { Trade, DEFAULT_CONFLUENCES } from './types';

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

interface TradeRow {
  id: string;
  user_id?: string;
  trade_date: string;
  symbol: string;
  direction: string;
  pnl: number;
  risk_amount: number;
  r_multiple: number;
  strategy: string;
  mistakes: string[];
  setup_quality: number;
  notes: string;
  screenshots: string[];
  entry_time: string;
  exit_time: string;
  confluences: string[];
  confidence: number;
}

function rowToTrade(r: TradeRow): Trade {
  const dir = r.direction === 'short' ? 'short' : r.direction === 'be' ? 'be' : 'long';
  return {
    id: r.id,
    date: r.trade_date,
    symbol: r.symbol,
    direction: dir,
    pnl: Number(r.pnl),
    riskAmount: Number(r.risk_amount),
    rMultiple: Number(r.r_multiple),
    strategy: r.strategy,
    mistakes: r.mistakes ?? [],
    setupQuality: r.setup_quality,
    notes: r.notes ?? '',
    screenshots: r.screenshots ?? [],
    entryTime: r.entry_time ?? '',
    exitTime: r.exit_time ?? '',
    confluences: r.confluences ?? [],
    confidence: r.confidence,
  };
}

function tradeToRow(t: Trade, userId: string): TradeRow {
  return {
    id: t.id,
    user_id: userId,
    trade_date: t.date,
    symbol: t.symbol,
    direction: t.direction,
    pnl: t.pnl,
    risk_amount: t.riskAmount,
    r_multiple: t.rMultiple,
    strategy: t.strategy,
    mistakes: t.mistakes,
    setup_quality: t.setupQuality,
    notes: t.notes,
    screenshots: t.screenshots,
    entry_time: t.entryTime,
    exit_time: t.exitTime,
    confluences: t.confluences,
    confidence: t.confidence,
  };
}

// ── Trades ──
const LOCAL_STORAGE_KEY_PREFIX = 'tradevault-trades-';

function loadLocalTrades(userId: string): Trade[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? (JSON.parse(raw) as Trade[]) : [];
  } catch {
    return [];
  }
}

function saveLocalTrades(userId: string, trades: Trade[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(trades));
}

export async function loadUserTrades(userId: string): Promise<Trade[]> {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('trade_date', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((r: TradeRow) => rowToTrade(r));
  } catch (error) {
    console.warn('Supabase loadUserTrades failed, falling back to local storage', error);
    return loadLocalTrades(userId);
  }
}

export async function upsertTrade(userId: string, trade: Trade): Promise<void> {
  try {
    const { error } = await supabase
      .from('trades')
      .upsert(tradeToRow(trade, userId) as never, { onConflict: 'id', returning: 'minimal' });
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase upsertTrade failed, falling back to local storage', error);
    const trades = loadLocalTrades(userId);
    const updated = trades.some(t => t.id === trade.id)
      ? trades.map(t => (t.id === trade.id ? trade : t))
      : [trade, ...trades];
    saveLocalTrades(userId, updated);
  }
}

export async function deleteTrade(userId: string, id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase deleteTrade failed, falling back to local storage', error);
    saveLocalTrades(userId, loadLocalTrades(userId).filter(t => t.id !== id));
  }
}

export async function deleteAllTrades(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  } catch (error) {
    console.warn('Supabase deleteAllTrades failed, falling back to local storage', error);
    saveLocalTrades(userId, []);
  }
}

// ── Confluences (stored on profile) ──
export async function loadConfluences(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('confluences')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  const list = data?.confluences as string[] | undefined;
  return list && list.length > 0 ? list : [...DEFAULT_CONFLUENCES];
}

export async function saveConfluences(userId: string, confluences: string[]): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ confluences } as never)
    .eq('id', userId);
  if (error) throw error;
}

// ── Account balance (stored on profile) ──
export async function loadAccountBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('account_balance')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  const bal = data?.account_balance as number | undefined;
  return typeof bal === 'number' ? bal : 25000;
}

export async function saveAccountBalance(userId: string, balance: number): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ account_balance: balance } as never)
    .eq('id', userId);
  if (error) throw error;
}

// ── Screenshots (Supabase Storage) ──
const SCREENSHOTS_BUCKET = 'trade-screenshots';

export async function uploadScreenshot(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'png';
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
  const { error } = await supabase.storage.from(SCREENSHOTS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return path;
}

export async function getScreenshotUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SCREENSHOTS_BUCKET)
    .createSignedUrl(path, 60 * 60);
  if (error) throw error;
  return data.signedUrl;
}

export async function deleteScreenshot(path: string): Promise<void> {
  const { error } = await supabase.storage.from(SCREENSHOTS_BUCKET).remove([path]);
  if (error) throw error;
}
