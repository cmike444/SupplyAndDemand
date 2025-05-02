import { Candle, SupplyZone, ZONE_DIRECTION, ZONE_TYPE } from '../types';
import { MAX_BASE_CANDLES, MIN_BASE_CANDLES, MIN_ZONE_CANDLES } from '../constants';
import { isBearishDecisiveCandle } from './isBearishDecisiveCandle';
import { isIndecisiveCandle } from './isIndecisiveCandle';
import { findPatternEnd } from './findPatternEnd';
import { isBearishExplosiveCandle } from './isBearishExplosiveCandle';

/**
 * Identifies a drop-base-drop pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A SupplyZone object if the pattern is identified, otherwise `null`.
 */
export function dropBaseDrop(candles: Candle[]): SupplyZone | null {
    if (candles.length < MIN_ZONE_CANDLES) return null;

    // Identify the first drop
    const dropEndIndex = findPatternEnd(candles, 0, isBearishDecisiveCandle);
    if (dropEndIndex === 0) return null;

    // Identify the base
    const baseEndIndex = findPatternEnd(candles, dropEndIndex, isIndecisiveCandle, MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - dropEndIndex;
    if (baseCandleCount < MIN_BASE_CANDLES) return null;

    // Identify the second drop
    const dropStartIndex = findPatternEnd(candles, baseEndIndex, isBearishExplosiveCandle);
    if (dropStartIndex === baseEndIndex) return null;

    // Return the identified drop-base-drop pattern as a SupplyZone
    const baseCandles = candles.slice(dropEndIndex, baseEndIndex);

    return {
        direction: ZONE_DIRECTION.SUPPLY,
        type: ZONE_TYPE.DROP_BASE_DROP,
        proximalLine: Math.min(...baseCandles.map(c => c.low)),
        distalLine: Math.max(...baseCandles.map(c => c.high)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[dropStartIndex - 1].timestamp,
    };
};
