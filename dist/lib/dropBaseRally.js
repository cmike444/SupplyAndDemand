"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropBaseRally = dropBaseRally;
const enums_1 = require("../enums");
const constants_1 = require("../constants");
const isIndecisiveCandle_1 = require("./isIndecisiveCandle");
const findPatternEnd_1 = require("./findPatternEnd");
const isBearishDecisiveCandle_1 = require("./isBearishDecisiveCandle");
const isBullishExplosiveCandle_1 = require("./isBullishExplosiveCandle");
/**
 * Identifies a drop-base-rally pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A DemandZone object if the pattern is identified, otherwise `null`.
 */
function dropBaseRally(candles) {
    if (candles.length < constants_1.MIN_ZONE_CANDLES)
        return null;
    // Identify the drop
    const dropEndIndex = (0, findPatternEnd_1.findPatternEnd)(candles, 0, isBearishDecisiveCandle_1.isBearishDecisiveCandle);
    if (dropEndIndex === 0)
        return null;
    // Identify the base
    const baseEndIndex = (0, findPatternEnd_1.findPatternEnd)(candles, dropEndIndex, isIndecisiveCandle_1.isIndecisiveCandle, constants_1.MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - dropEndIndex;
    if (baseCandleCount < constants_1.MIN_BASE_CANDLES)
        return null;
    // Identify the rally
    const rallyStartIndex = (0, findPatternEnd_1.findPatternEnd)(candles, baseEndIndex, isBullishExplosiveCandle_1.isBullishExplosiveCandle);
    if (rallyStartIndex === baseEndIndex)
        return null;
    // Return the identified drop-base-rally pattern as a DemandZone
    const baseCandles = candles.slice(dropEndIndex, baseEndIndex);
    return {
        direction: enums_1.ZONE_DIRECTION.DEMAND,
        type: enums_1.ZONE_TYPE.DROP_BASE_RALLY,
        proximalLine: Math.max(...baseCandles.map(c => c.high)),
        distalLine: Math.min(...baseCandles.map(c => c.low)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[rallyStartIndex - 1].timestamp,
    };
}
;
