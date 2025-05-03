import { Candle } from "../types";
import { isBearishCandle } from "./isBearishCandle";
import { isExplosiveCandle } from "./isExplosiveCandle";
/**
 * Determines if a given candle is a bearish explosive candle.
 *
 * A bearish explosive candle is defined as a candle that satisfies both
 * the conditions of being an explosive candle and being bearish.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is both explosive and bearish, otherwise `false`.
 */
export function isBearishExplosiveCandle(candle: Candle): boolean {
    return isExplosiveCandle(candle) && isBearishCandle(candle);
}
