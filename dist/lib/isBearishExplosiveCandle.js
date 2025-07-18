"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBearishExplosiveCandle = isBearishExplosiveCandle;
const isBearishCandle_1 = require("./isBearishCandle");
const isExplosiveCandle_1 = require("./isExplosiveCandle");
/**
 * Determines if a given candle is a bearish explosive candle.
 *
 * A bearish explosive candle is defined as a candle that satisfies both
 * the conditions of being an explosive candle and being bearish.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both explosive and bearish, otherwise `false`.
 */
function isBearishExplosiveCandle(candle) {
    return (0, isExplosiveCandle_1.isExplosiveCandle)(candle) && (0, isBearishCandle_1.isBearishCandle)(candle);
}
