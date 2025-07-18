"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBullishDecisiveCandle = isBullishDecisiveCandle;
const isBullishCandle_1 = require("./isBullishCandle");
const isDecisiveCandle_1 = require("./isDecisiveCandle");
/**
 * Determines if a given candle is both bullish and decisive.
 *
 * A candle is considered bullish if it meets the criteria defined
 * in the `isBullishCandle` function, and decisive if it meets the criteria
 * defined in the `isDecisiveCandle` function.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both bullish and decisive, otherwise `false`.
 */
function isBullishDecisiveCandle(candle) {
    return (0, isDecisiveCandle_1.isDecisiveCandle)(candle) && (0, isBullishCandle_1.isBullishCandle)(candle);
}
