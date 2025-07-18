"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rallyBaseRally = rallyBaseRally;
const enums_1 = require("../enums");
const constants_1 = require("../constants");
const isBullishDecisiveCandle_1 = require("./isBullishDecisiveCandle");
const isIndecisiveCandle_1 = require("./isIndecisiveCandle");
const findPatternEnd_1 = require("./findPatternEnd");
const isBullishExplosiveCandle_1 = require("./isBullishExplosiveCandle");
/**
 * Identifies a rally-base-rally pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A DemandZone object if the pattern is identified, otherwise `null`.
 */
function rallyBaseRally(candles) {
    if (candles.length < constants_1.MIN_ZONE_CANDLES)
        return null;
    // Identify the rally
    const rallyEndIndex = (0, findPatternEnd_1.findPatternEnd)(candles, 0, isBullishDecisiveCandle_1.isBullishDecisiveCandle);
    if (rallyEndIndex === 0)
        return null;
    // Identify the base
    const baseEndIndex = (0, findPatternEnd_1.findPatternEnd)(candles, rallyEndIndex, isIndecisiveCandle_1.isIndecisiveCandle, constants_1.MAX_BASE_CANDLES);
    const baseCandleCount = baseEndIndex - rallyEndIndex;
    if (baseCandleCount < constants_1.MIN_BASE_CANDLES)
        return null;
    // Identify the second rally
    const rallyStartIndex = (0, findPatternEnd_1.findPatternEnd)(candles, baseEndIndex, isBullishExplosiveCandle_1.isBullishExplosiveCandle);
    if (rallyStartIndex === baseEndIndex)
        return null;
    // Return the identified rally-base-rally pattern as a DemandZone
    const baseCandles = candles.slice(rallyEndIndex, baseEndIndex);
    return {
        direction: enums_1.ZONE_DIRECTION.DEMAND,
        type: enums_1.ZONE_TYPE.RALLY_BASE_RALLY,
        proximalLine: Math.max(...baseCandles.map(c => c.high)),
        distalLine: Math.min(...baseCandles.map(c => c.low)),
        startTimestamp: candles[0].timestamp,
        endTimestamp: candles[rallyStartIndex - 1].timestamp,
    };
}
;
