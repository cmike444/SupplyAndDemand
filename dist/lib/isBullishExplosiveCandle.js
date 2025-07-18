"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBullishExplosiveCandle = isBullishExplosiveCandle;
const isBullishCandle_1 = require("./isBullishCandle");
const isExplosiveCandle_1 = require("./isExplosiveCandle");
/**
 * Determines if a given candle is a bullish explosive candle.
 *
 * A bullish explosive candle is defined as a candle that satisfies both
 * the conditions of being an explosive candle and being bullish.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both explosive and bullish, otherwise `false`.
 */
function isBullishExplosiveCandle(candle) {
    return (0, isExplosiveCandle_1.isExplosiveCandle)(candle) && (0, isBullishCandle_1.isBullishCandle)(candle);
}
