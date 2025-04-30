import { Candle } from "../types";

/**
 * Calculates the body size of a candlestick by taking the absolute difference
 * between its closing and opening prices.
 *
 * @param candle - An object representing a candlestick, containing `open` and `close` properties.
 * @returns The absolute difference between the `close` and `open` prices of the candlestick.
 */
export function candleBody(candle: Candle): number {
    return Math.abs(candle.close - candle.open);
};
