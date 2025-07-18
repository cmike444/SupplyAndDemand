"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDecisiveCandle = isDecisiveCandle;
const constants_1 = require("../constants");
const candleBody_1 = require("./candleBody");
const candleRange_1 = require("./candleRange");
/**
 * Determines if a candlestick is "decisive" based on its body-to-range ratio.
 *
 * A candle is considered decisive if:
 * - The body size is greater than zero
 * - The body-to-range ratio exceeds the specified threshold
 *
 * @param candle - An object representing a candlestick, containing `open`, `close`, `high`, and `low` properties.
 * @param threshold - The minimum body-to-range ratio for a candle to be considered decisive (default: 0.5).
 * @returns True if the candle is decisive, false otherwise.
 */
function isDecisiveCandle(candle, threshold = constants_1.DEFAULT_DECISIVE_THRESHOLD) {
    if ((0, candleBody_1.candleBody)(candle) === 0)
        return false;
    return (0, candleBody_1.candleBody)(candle) / (0, candleRange_1.candleRange)(candle) > threshold;
}
;
