import { Candle } from '../types';
import { candleRange } from './candleRange';
import { isBullishExplosiveCandle } from './isBullishExplosiveCandle';
import { isBullishDecisiveCandle } from './isBullishDecisiveCandle';
import { isBearishExplosiveCandle } from './isBearishExplosiveCandle';
import { isBearishDecisiveCandle } from './isBearishDecisiveCandle';

/**
 * Calculates a confidence score (0–1) for a zone based on the strength of the departure leg.
 *
 * The score is the average of three equally-weighted factors:
 *
 * - **countFactor**: proportion of departure candles that are decisive or explosive in the
 *   departure direction. A higher proportion signals a wall of unfilled orders behind the zone.
 *
 * - **rangeFactor**: average candle range of the departure leg normalised by `localATR`,
 *   clamped to [0, 1]. Large candles relative to volatility indicate institutional conviction.
 *   Falls back to 0.5 when `localATR` is zero (insufficient data).
 *
 * - **volumeFactor**: average departure volume relative to average base volume, mapped through
 *   `ratio / (ratio + 1)` so that higher volume always increases confidence asymptotically toward 1.
 *   Sparse or declining departure volume scores below 0.5. Falls back to 0.5 when volume data is
 *   absent or base volume is zero.
 *
 * - **timeFactor**: encodes the "Time at Level" odds-enhancer from the spec. Fewer base candles
 *   imply a sharper, less-disputed imbalance. 1–3 candles → 1.0; 4–6 candles → 0.5.
 *
 * @param departureCandles   - Candles forming the explosive leg away from the zone.
 * @param baseCandles        - Candles forming the indecisive base of the zone.
 * @param localATR           - ATR computed for the context window around the zone.
 * @param isUpwardDeparture  - `true` for a bullish departure (demand zone), `false` for bearish (supply zone).
 * @returns A confidence score in the range [0, 1].
 */
export function calculateConfidence(
    departureCandles: Candle[],
    baseCandles: Candle[],
    localATR: number,
    isUpwardDeparture: boolean,
): number {
    if (departureCandles.length === 0) return 0;

    // --- Count factor ---
    const isStrong = isUpwardDeparture
        ? (c: Candle) => isBullishExplosiveCandle(c) || isBullishDecisiveCandle(c)
        : (c: Candle) => isBearishExplosiveCandle(c) || isBearishDecisiveCandle(c);

    const strongCount = departureCandles.filter(isStrong).length;
    const countFactor = strongCount / departureCandles.length;

    // --- Range factor ---
    const avgRange = departureCandles.reduce((sum, c) => sum + candleRange(c), 0) / departureCandles.length;
    const rangeFactor = localATR > 0
        ? Math.min(avgRange / localATR, 1)
        : 0.5;

    // --- Volume factor ---
    const hasVolume = departureCandles.some(c => c.volume !== undefined);
    let volumeFactor = 0.5;
    if (hasVolume) {
        const avgDepartureVolume = departureCandles.reduce((sum, c) => sum + (c.volume ?? 0), 0) / departureCandles.length;
        const avgBaseVolume = baseCandles.length > 0
            ? baseCandles.reduce((sum, c) => sum + (c.volume ?? 0), 0) / baseCandles.length
            : 0;
        const ratio = avgBaseVolume > 0 ? avgDepartureVolume / avgBaseVolume : 1;
        volumeFactor = ratio / (ratio + 1);
    }

    // --- Time factor (Time at Level) ---
    // Fewer base candles = sharper imbalance = higher institutional conviction.
    const baseCount = baseCandles.length;
    const timeFactor = baseCount <= 3 ? 1.0 : baseCount <= 6 ? 0.5 : 0;

    return (countFactor + rangeFactor + volumeFactor + timeFactor) / 4;
}
