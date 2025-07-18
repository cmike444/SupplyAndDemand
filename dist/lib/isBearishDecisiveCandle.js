"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBearishDecisiveCandle = isBearishDecisiveCandle;
const isBearishCandle_1 = require("./isBearishCandle");
const isDecisiveCandle_1 = require("./isDecisiveCandle");
/**
 * Determines if a given candle is both bearish and decisive.
 *
 * A candle is considered bearish if it indicates a downward price movement,
 * and decisive if it meets certain criteria for strong market sentiment.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is bearish and decisive, otherwise `false`.
 */
function isBearishDecisiveCandle(candle) {
    return (0, isDecisiveCandle_1.isDecisiveCandle)(candle) && (0, isBearishCandle_1.isBearishCandle)(candle);
}
