"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.candleRange = candleRange;
/**
 * Calculates the range of a candle by subtracting its low value from its high value.
 *
 * @param candle - An object representing a candle with `high` and `low` properties.
 * @returns The numerical range of the candle.
 */
function candleRange(candle) {
    return candle.high - candle.low;
}
;
