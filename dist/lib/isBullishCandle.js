"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBullishCandle = isBullishCandle;
/**
 * Determines if a given candlestick represents a bullish candle.
 * A candlestick is considered bullish if the closing price is higher than the opening price.
 *
 * @param candle - The candlestick object containing `open` and `close` properties.
 * @returns `true` if the candlestick is bullish, otherwise `false`.
 */
function isBullishCandle(candle) {
    return candle.close > candle.open;
}
;
