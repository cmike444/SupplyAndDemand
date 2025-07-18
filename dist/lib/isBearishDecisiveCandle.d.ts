import { Candle } from "../types";
/**
 * Determines if a given candle is both bearish and decisive.
 *
 * A candle is considered bearish if it indicates a downward price movement,
 * and decisive if it meets certain criteria for strong market sentiment.
 *
 * @param candle - The candle object to evaluate.
 * @returns `true` if the candle is bearish and decisive, otherwise `false`.
 */
export declare function isBearishDecisiveCandle(candle: Candle): boolean;
