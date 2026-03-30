import { Candle } from '../types';
import { MAX_BASE_GAP_ATR_MULTIPLIER, MAX_ZONE_ATR_MULTIPLIER } from '../constants';

/**
 * Validates that a base (a run of indecisive candles) is well-formed relative to
 * local volatility. Two checks are applied:
 *
 * 1. **Gap check** — rejects the base if any consecutive open-to-prior-close gap
 *    within [precedingCandle, ...baseCandles] exceeds MAX_BASE_GAP_ATR_MULTIPLIER × ATR.
 *
 * 2. **Height check** — rejects the base if its overall high-to-low range exceeds
 *    MAX_ZONE_ATR_MULTIPLIER × ATR.
 *
 * When `localATR` is zero or negative (e.g. insufficient data at the start of a series),
 * the checks are skipped and `true` is returned.
 *
 * @param baseCandles     - The indecisive candles that form the base.
 * @param precedingCandle - The candle immediately before the first base candle.
 * @param localATR        - ATR computed from the context window around the base.
 * @returns `true` if the base is valid, `false` if either check fails.
 */
export function isValidBase(baseCandles: Candle[], precedingCandle: Candle, localATR: number): boolean {
    if (localATR <= 0) return true;

    // Gap check: scan [precedingCandle, base[0], base[1], ...]
    const sequence = [precedingCandle, ...baseCandles];
    for (let i = 1; i < sequence.length; i++) {
        if (Math.abs(sequence[i].open - sequence[i - 1].close) > MAX_BASE_GAP_ATR_MULTIPLIER * localATR) {
            return false;
        }
    }

    // Height check: full high-to-low span of the base
    const maxHigh = Math.max(...baseCandles.map(c => c.high));
    const minLow = Math.min(...baseCandles.map(c => c.low));
    if (maxHigh - minLow > MAX_ZONE_ATR_MULTIPLIER * localATR) {
        return false;
    }

    return true;
}
