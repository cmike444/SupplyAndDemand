import { Candle } from "../types";
/**
 * Determines if a given candle is a bullish explosive candle.
 *
 * A bullish explosive candle is defined as a candle that satisfies both
 * the conditions of being an explosive candle and being bullish.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both explosive and bullish, otherwise `false`.
 */
export declare function isBullishExplosiveCandle(candle: Candle): boolean;
