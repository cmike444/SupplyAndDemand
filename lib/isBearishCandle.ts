import { Candle } from "../types";

/**
 * Determines if a given candlestick represents a bearish candle.
 * A candlestick is considered bearish if the closing price is less than the opening price.
 *
 * @param candle - The candlestick object containing `open` and `close` properties.
 * @returns `true` if the candlestick is bearish, otherwise `false`.
 */
export function isBearish(candle: Candle): boolean {
    return candle.close < candle.open;
}
