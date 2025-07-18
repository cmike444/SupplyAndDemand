"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropBaseDrop = dropBaseDrop;
const enums_1 = require("../enums");
const constants_1 = require("../constants");
const isBearishDecisiveCandle_1 = require("./isBearishDecisiveCandle");
const isIndecisiveCandle_1 = require("./isIndecisiveCandle");
const findPatternEnd_1 = require("./findPatternEnd");
const isBearishExplosiveCandle_1 = require("./isBearishExplosiveCandle");
/**
 * Identifies a drop-base-drop pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A SupplyZone object if the pattern is identified, otherwise `null`.
 */
function dropBaseDrop(candles) {
    if (candles.length < constants_1.MIN_ZONE_CANDLES)
        return null;
    // Identify the first drop
    const dropEndIndex = (0, findPatternEnd_1.findPatternEnd)(candles, 0, isBearishDecisiveCandle_1.isBearishDecisiveCandle);
    if (dropEndIndex === 0)
        return null;
    // Identify the base
    const baseEndIndex = (0, findPatternEnd_1.findPatternEnd)(candles, dropEndIndex, isIndecisiveCandle_1.isIndecisiveCandle, constants_1.MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - dropEndIndex;
    if (baseCandleCount < constants_1.MIN_BASE_CANDLES)
        return null;
    // Identify the second drop
    const dropStartIndex = (0, findPatternEnd_1.findPatternEnd)(candles, baseEndIndex, isBearishExplosiveCandle_1.isBearishExplosiveCandle);
    if (dropStartIndex === baseEndIndex)
        return null;
    // Return the identified drop-base-drop pattern as a SupplyZone
    const baseCandles = candles.slice(dropEndIndex, baseEndIndex);
    return {
        direction: enums_1.ZONE_DIRECTION.SUPPLY,
        type: enums_1.ZONE_TYPE.DROP_BASE_DROP,
        proximalLine: Math.min(...baseCandles.map(c => c.low)),
        distalLine: Math.max(...baseCandles.map(c => c.high)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[dropStartIndex - 1].timestamp,
    };
}
;
