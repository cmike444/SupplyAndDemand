import { Candle } from '../types';
import { DEFAULT_ATR_PERIOD } from '../constants';

/**
 * Computes the Average True Range (ATR) for a series of candles using a simple mean.
 *
 * True Range for each candle (after the first) is:
 *   TR = max(high − low, |high − prev.close|, |low − prev.close|)
 *
 * For the first candle (no previous close), TR = high − low.
 *
 * @param candles - Array of Candle objects. Should contain the context window preceding the zone.
 * @param period  - Number of TR values to average (default: DEFAULT_ATR_PERIOD).
 * @returns The mean TR over the last `period` values, or 0 if the array is empty.
 */
export function atr(candles: Candle[], period: number = DEFAULT_ATR_PERIOD): number {
    if (candles.length === 0) return 0;
    if (candles.length === 1) return candles[0].high - candles[0].low;

    const trValues: number[] = [];
    for (let i = 1; i < candles.length; i++) {
        const curr = candles[i];
        const prev = candles[i - 1];
        trValues.push(Math.max(
            curr.high - curr.low,
            Math.abs(curr.high - prev.close),
            Math.abs(curr.low - prev.close),
        ));
    }

    const relevant = trValues.slice(-period);
    return relevant.reduce((sum, v) => sum + v, 0) / relevant.length;
}
