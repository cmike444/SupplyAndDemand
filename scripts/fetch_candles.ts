/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import YahooFinance from 'yahoo-finance2';

const VALID_INTERVALS = ['1m', '2m', '5m', '15m', '30m', '60m', '1d'] as const;
type Interval = typeof VALID_INTERVALS[number];

const PERIOD_MAP: Record<string, () => Date> = {
  '1d':  () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; },
  '5d':  () => { const d = new Date(); d.setDate(d.getDate() - 5); return d; },
  '7d':  () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; },
  '1mo': () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d; },
  '3mo': () => { const d = new Date(); d.setMonth(d.getMonth() - 3); return d; },
  '6mo': () => { const d = new Date(); d.setMonth(d.getMonth() - 6); return d; },
  '1y':  () => { const d = new Date(); d.setFullYear(d.getFullYear() - 1); return d; },
};

const symbol   = process.argv[2];
const interval = (process.argv[3] ?? '1m') as Interval;
const period   = process.argv[4] ?? '7d';

if (!symbol) {
  console.error('Usage: fetch_candles <SYMBOL> [INTERVAL] [PERIOD]');
  console.error('  INTERVAL: 1m, 2m, 5m, 15m, 30m, 60m, 1d  (default: 1m)');
  console.error('  PERIOD:   1d, 5d, 7d, 1mo, 3mo, 6mo, 1y  (default: 7d)');
  process.exit(1);
}

if (!VALID_INTERVALS.includes(interval as Interval)) {
  console.error(`Invalid interval "${interval}". Valid values: ${VALID_INTERVALS.join(', ')}`);
  process.exit(1);
}

if (!(period in PERIOD_MAP)) {
  console.error(`Invalid period "${period}". Valid values: ${Object.keys(PERIOD_MAP).join(', ')}`);
  process.exit(1);
}

const period1 = PERIOD_MAP[period]();

function toDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

const yahooFinance = new YahooFinance();

(async () => {
  let result;
  try {
    result = await yahooFinance.chart(symbol.toUpperCase(), {
      period1,
      interval: interval as '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '1d',
      return: 'array',
    });
  } catch (error) {
    console.error(`Failed to fetch data for "${symbol}":`, error);
    process.exit(1);
  }

  const quotes = result.quotes.filter(
    (q) => q.open !== null && q.high !== null && q.low !== null && q.close !== null
  );

  if (quotes.length === 0) {
    console.error('No data returned. Check the symbol, interval, and period.');
    process.exit(1);
  }

  const candles = quotes.map((q) => ({
    timestamp: q.date.getTime(),
    open:      Math.round(q.open!  * 100) / 100,
    high:      Math.round(q.high!  * 100) / 100,
    low:       Math.round(q.low!   * 100) / 100,
    close:     Math.round(q.close! * 100) / 100,
    volume:    Math.round(q.volume ?? 0),
  }));

  const startDate = toDateString(quotes[0].date);
  const endDate   = toDateString(quotes[quotes.length - 1].date);
  const filename  = `${symbol.toUpperCase()}_${interval}_${startDate}_${endDate}.json`;
  const outputPath = path.resolve(__dirname, '../data', filename);

  fs.writeFileSync(outputPath, JSON.stringify(candles, null, 2));
  console.log(`Saved ${candles.length} candles → ${filename}`);
})();
