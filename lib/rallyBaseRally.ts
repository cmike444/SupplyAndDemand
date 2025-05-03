import { Candle, DemandZone } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';
import { MAX_BASE_CANDLES, MIN_BASE_CANDLES, MIN_ZONE_CANDLES } from '../constants';
import { isBullishDecisiveCandle } from './isBullishDecisiveCandle';
import { isIndecisiveCandle } from './isIndecisiveCandle';
import { findPatternEnd } from './findPatternEnd';
import { isBullishExplosiveCandle } from './isBullishExplosiveCandle';

/**
 * Identifies a rally-base-rally pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A DemandZone object if the pattern is identified, otherwise `null`.
 */
export function rallyBaseRally(candles: Candle[]): DemandZone | null {
    if (candles.length < MIN_ZONE_CANDLES) return null;

    // Identify the rally
    const rallyEndIndex = findPatternEnd(candles, 0, isBullishDecisiveCandle);
    if (rallyEndIndex === 0) return null;

    // Identify the base
    const baseEndIndex = findPatternEnd(candles, rallyEndIndex, isIndecisiveCandle, MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - rallyEndIndex;
    if (baseCandleCount < MIN_BASE_CANDLES) return null;

    // Identify the second rally
    const rallyStartIndex = findPatternEnd(candles, baseEndIndex, isBullishExplosiveCandle);
    if (rallyStartIndex === baseEndIndex) return null;

    // Return the identified rally-base-rally pattern as a DemandZone
    const baseCandles = candles.slice(rallyEndIndex, baseEndIndex);

    return {
        direction: ZONE_DIRECTION.DEMAND,
        type: ZONE_TYPE.RALLY_BASE_RALLY,
        proximalLine: Math.max(...baseCandles.map(c => c.high)),
        distalLine: Math.min(...baseCandles.map(c => c.low)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[rallyStartIndex - 1].timestamp,
    };
};
