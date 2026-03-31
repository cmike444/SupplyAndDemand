import { Candle, DemandZone } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';
import { DEFAULT_EXPLOSIVE_THRESHOLD, MAX_BASE_CANDLES, MIN_BASE_CANDLES, MIN_EXPLOSIVE_ATR_MULTIPLIER, MIN_ZONE_CANDLES } from '../constants';
import { isIndecisiveCandle } from './isIndecisiveCandle';
import { findPatternEnd } from './findPatternEnd';
import { isBearishDecisiveCandle } from './isBearishDecisiveCandle';
import { isBullishCandle } from './isBullishCandle';
import { isBearishCandle } from './isBearishCandle';
import { isExplosiveCandle } from './isExplosiveCandle';
import { isValidBase } from './isValidBase';
import { calculateConfidence } from './calculateConfidence';

/**
 * Identifies a drop-base-rally pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A DemandZone object if the pattern is identified, otherwise `null`.
 */
export function dropBaseRally(candles: Candle[], localATR: number = 0): DemandZone | null {
    if (candles.length < MIN_ZONE_CANDLES) return null;

    // Identify the drop
    const dropEndIndex = findPatternEnd(candles, 0, isBearishDecisiveCandle);
    if (dropEndIndex === 0) return null;

    // Identify the base
    const baseEndIndex = findPatternEnd(candles, dropEndIndex, isIndecisiveCandle, MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - dropEndIndex;
    if (baseCandleCount < MIN_BASE_CANDLES) return null;

    // Identify the rally (ERC bullish departure, with ATR magnitude check)
    const rallyZoneStartIndex = findPatternEnd(
        candles,
        baseEndIndex,
        c => isExplosiveCandle(c, DEFAULT_EXPLOSIVE_THRESHOLD, MIN_EXPLOSIVE_ATR_MULTIPLIER * localATR) && isBullishCandle(c),
    );
    if (rallyZoneStartIndex === baseEndIndex) return null;

    // Return the identified drop-base-rally pattern as a DemandZone
    const baseCandles = candles.slice(dropEndIndex, baseEndIndex);
    if (!isValidBase(baseCandles, candles[dropEndIndex - 1], localATR)) return null;

    // Follow-through check: first candle of the rally (after the base) must not be bearish
    const firstRallyCandle = candles[baseEndIndex];
    if (firstRallyCandle && isBearishCandle(firstRallyCandle)) return null;

    const departureCandles = candles.slice(baseEndIndex, rallyZoneStartIndex);
    const fullFormation = candles.slice(0, rallyZoneStartIndex);
    return {
        direction: ZONE_DIRECTION.DEMAND,
        type: ZONE_TYPE.DROP_BASE_RALLY,
        proximalLine: Math.max(...baseCandles.map(c => Math.max(c.open, c.close))),
        distalLine: Math.min(...fullFormation.map(c => c.low)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[rallyZoneStartIndex - 1].timestamp,
        confidence: calculateConfidence(departureCandles, baseCandles, localATR, true),
    };
};
