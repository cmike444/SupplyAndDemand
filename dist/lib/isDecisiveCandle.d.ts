import { Candle } from "../types";
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
export declare function isDecisiveCandle(candle: Candle, threshold?: number): boolean;
