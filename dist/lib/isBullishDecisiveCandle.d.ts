import { Candle } from "../types";
/**
 * Determines if a given candle is both bullish and decisive.
 *
 * A candle is considered bullish if it meets the criteria defined
 * in the `isBullishCandle` function, and decisive if it meets the criteria
 * defined in the `isDecisiveCandle` function.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both bullish and decisive, otherwise `false`.
 */
export declare function isBullishDecisiveCandle(candle: Candle): boolean;
