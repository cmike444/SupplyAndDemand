import { Candle } from "../types";
/**
 * Determines if a given candle is a bearish explosive candle.
 *
 * A bearish explosive candle is defined as a candle that satisfies both
 * the conditions of being an explosive candle and being bearish.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both explosive and bearish, otherwise `false`.
 */
export declare function isBearishExplosiveCandle(candle: Candle): boolean;
