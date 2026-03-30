import { Candle } from '../types';
import { DEFAULT_RVOL_PERIOD } from '../constants';

/**
 * Computes Relative Volume (RVOL) for every candle in the series.
 *
 * RVOL[i] = candles[i].volume / mean(candles[i-period … i-1].volume)
 *
 * The lookback is exclusive of the current candle — it answers "how does this
 * bar's volume compare to the N bars that preceded it?"
 *
 * - Index 0 (no prior context) → 1.0 (neutral).
 * - When fewer than `period` prior candles exist, the average is taken over all
 *   available prior candles (same graceful fallback as `atr`).
 *
 * @param candles - Array of Candle objects with a defined `volume` field.
 * @param period  - Number of prior candles to average (default: DEFAULT_RVOL_PERIOD).
 * @returns Array of RVOL values, one per candle, in the same order.
 */
export function rvol(candles: Candle[], period: number = DEFAULT_RVOL_PERIOD): number[] {
    if (candles.length === 0) return [];

    return candles.map((candle, i) => {
        if (i === 0) return 1;

        const start = Math.max(0, i - period);
        const prior = candles.slice(start, i);
        const avg = prior.reduce((sum, c) => sum + (c.volume as number), 0) / prior.length;

        if (avg === 0) return 1;
        return (candle.volume as number) / avg;
    });
}
