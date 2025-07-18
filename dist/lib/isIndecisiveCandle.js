"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIndecisiveCandle = isIndecisiveCandle;
const constants_1 = require("../constants");
const candleRange_1 = require("./candleRange");
const candleBody_1 = require("./candleBody");
/**
 * Determines if a given candle is an indecisive candle based on its body-to-range ratio.
 *
 * An indecisive candle typically has a small body relative to its range, indicating market uncertainty.
 *
 * @param candle - The candle object containing the data for the analysis.
 * @param threshold - The maximum ratio of the candle body to the candle range to consider it indecisive.
 *                     Defaults to `DEFAULT_DECISIVE_THRESHOLD`.
 * @returns `true` if the candle is indecisive, otherwise `false`.
 */
function isIndecisiveCandle(candle, threshold = constants_1.DEFAULT_DECISIVE_THRESHOLD) {
    if ((0, candleBody_1.candleBody)(candle) === 0)
        return true;
    return ((0, candleBody_1.candleBody)(candle) / (0, candleRange_1.candleRange)(candle)) <= threshold;
}
;
