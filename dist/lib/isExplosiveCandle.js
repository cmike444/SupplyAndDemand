"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isExplosiveCandle = isExplosiveCandle;
const constants_1 = require("../constants");
const candleBody_1 = require("./candleBody");
const candleRange_1 = require("./candleRange");
/**
 * Determines if a given candle is considered "explosive" based on its body-to-range ratio.
 *
 * An explosive candle typically has a range abnormally larger than previous candles, indicating institutional activity.
 *
 * @param candle - The candle object containing the data to analyze.
 * @param threshold - The threshold ratio (default is `DEFAULT_EXPLOSIVE_THRESHOLD`)
 *                    above which the candle is considered explosive.
 * @returns `true` if the candle's body-to-range ratio exceeds the threshold, otherwise `false`.
 * @todo: Use Average True Range (ATR) to determine if the candle is significantly larger than previous candles.
 * @todo: Use candle's Relative Volume (RVOL) to increase confidence abour institutional activity.
 */
function isExplosiveCandle(candle, threshold = constants_1.DEFAULT_EXPLOSIVE_THRESHOLD) {
    if ((0, candleBody_1.candleBody)(candle) === 0)
        return false;
    return (0, candleBody_1.candleBody)(candle) / (0, candleRange_1.candleRange)(candle) > threshold;
}
;
