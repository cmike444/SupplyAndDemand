import { DEFAULT_DECISIVE_THRESHOLD } from "../constants";
import { Candle } from "../types";
import { candleBody } from "./candleBody";

/**
 * Determines if a given candle is decisive based on its body size.
 *
 * A candle is considered decisive if its body size exceeds the specified threshold.
 *
 * @param candle - The candle object to evaluate.
 * @param threshold - The minimum body size required for the candle to be considered decisive.
 *                     Defaults to `DEFAULT_DECISIVE_THRESHOLD`.
 * @returns `true` if the candle's body size is greater than the threshold, otherwise `false`.
 */
export function isDecisiveCandle(candle: Candle, threshold: number = DEFAULT_DECISIVE_THRESHOLD): boolean {
    return candleBody(candle) > threshold;
};
