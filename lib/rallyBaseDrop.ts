import { Candle, SupplyZone } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';
import { DEFAULT_EXPLOSIVE_THRESHOLD, MAX_BASE_CANDLES, MIN_BASE_CANDLES, MIN_EXPLOSIVE_ATR_MULTIPLIER, MIN_ZONE_CANDLES } from '../constants';
import { isBullishDecisiveCandle } from './isBullishDecisiveCandle';
import { isIndecisiveCandle } from './isIndecisiveCandle';
import { findPatternEnd } from './findPatternEnd';
import { isBearishCandle } from './isBearishCandle';
import { isBullishCandle } from './isBullishCandle';
import { isExplosiveCandle } from './isExplosiveCandle';
import { isValidBase } from './isValidBase';
import { calculateConfidence } from './calculateConfidence';

/**
 * Identifies a rally-base-drop pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A SupplyZone object if the pattern is identified, otherwise `null`.
 */
export function rallyBaseDrop(candles: Candle[], localATR: number = 0): SupplyZone | null {
    if (candles.length < MIN_ZONE_CANDLES) return null;

    // Identify the rally
    const rallyEndIndex = findPatternEnd(candles, 0, isBullishDecisiveCandle);
    if (rallyEndIndex === 0) return null;

    // Identify the base
    const baseEndIndex = findPatternEnd(candles, rallyEndIndex, isIndecisiveCandle, MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - rallyEndIndex;
    if (baseCandleCount < MIN_BASE_CANDLES) return null;

    // Identify the drop (ERC bearing down, with ATR magnitude check)
    const dropZoneStartIndex = findPatternEnd(
        candles,
        baseEndIndex,
        c => isExplosiveCandle(c, DEFAULT_EXPLOSIVE_THRESHOLD, MIN_EXPLOSIVE_ATR_MULTIPLIER * localATR) && isBearishCandle(c),
    );
    if (dropZoneStartIndex === baseEndIndex) return null;

    // Return the identified rally-base-drop pattern as a SupplyZone
    const baseCandles = candles.slice(rallyEndIndex, baseEndIndex);
    if (!isValidBase(baseCandles, candles[rallyEndIndex - 1], localATR)) return null;

    // Follow-through check: first candle of the drop (after the base) must not be bullish
    const firstDropCandle = candles[baseEndIndex];
    if (firstDropCandle && isBullishCandle(firstDropCandle)) return null;

    const departureCandles = candles.slice(baseEndIndex, dropZoneStartIndex);
    const fullFormation = candles.slice(0, dropZoneStartIndex);
    return {
        direction: ZONE_DIRECTION.SUPPLY,
        type: ZONE_TYPE.RALLY_BASE_DROP,
        proximalLine: Math.min(...baseCandles.map(c => Math.min(c.open, c.close))),
        distalLine: Math.max(...fullFormation.map(c => c.high)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[dropZoneStartIndex - 1].timestamp,
        confidence: calculateConfidence(departureCandles, baseCandles, localATR, false),
    };
};
