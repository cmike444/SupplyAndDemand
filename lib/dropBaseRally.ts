import { Candle, DemandZone, ZONE_DIRECTION, ZONE_TYPE } from '../types';
import { MAX_BASE_CANDLES, MIN_BASE_CANDLES, MIN_ZONE_CANDLES } from '../constants';
import { isIndecisiveCandle } from './isIndecisiveCandle';
import { findPatternEnd } from './findPatternEnd';
import { isBearishDecisiveCandle } from './isBearishDecisiveCandle';
import { isBullishExplosiveCandle } from './isBullishExplosiveCandle';

/**
 * Identifies a drop-base-rally pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A DemandZone object if the pattern is identified, otherwise `null`.
 */
export function dropBaseRally(candles: Candle[]): DemandZone | null {
    if (candles.length < MIN_ZONE_CANDLES) return null;

    // Identify the drop
    const dropEndIndex = findPatternEnd(candles, 0, isBearishDecisiveCandle);
    if (dropEndIndex === 0) return null;

    // Identify the base
    const baseEndIndex = findPatternEnd(candles, dropEndIndex, isIndecisiveCandle, MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - dropEndIndex;
    if (baseCandleCount < MIN_BASE_CANDLES) return null;

    // Identify the rally
    const rallyStartIndex = findPatternEnd(candles, baseEndIndex, isBullishExplosiveCandle);
    if (rallyStartIndex === baseEndIndex) return null;

    // Return the identified drop-base-rally pattern as a DemandZone
    const baseCandles = candles.slice(dropEndIndex, baseEndIndex);

    return {
        direction: ZONE_DIRECTION.DEMAND,
        type: ZONE_TYPE.DROP_BASE_RALLY,
        proximalLine: Math.max(...baseCandles.map(c => c.high)),
        distalLine: Math.min(...baseCandles.map(c => c.low)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[rallyStartIndex - 1].timestamp,
    };
};
