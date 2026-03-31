import { DEFAULT_EXPLOSIVE_THRESHOLD } from "../constants";
import { Candle } from "../types";
import { candleBody } from "./candleBody";
import { candleRange } from "./candleRange";

/**
 * Determines if a given candle is considered "explosive" based on its body-to-range ratio
 * and, optionally, whether its total range is large enough relative to the local ATR.
 *
 * Per spec §2.1: the body must represent >= 70% of the total range, and the total range
 * must be >= `minATR` (typically 1.5× ATR) to confirm the candle is the Leg-out (ERC).
 *
 * @param candle - The candle object containing the data to analyze.
 * @param threshold - The body/range ratio threshold (default `DEFAULT_EXPLOSIVE_THRESHOLD` = 0.70).
 * @param minATR - Minimum required total range. When > 0, candles whose range falls below
 *                 this value are rejected even if their body ratio qualifies. Pass 0 (default)
 *                 to skip the ATR magnitude check.
 * @returns `true` if the candle qualifies as an ERC, otherwise `false`.
 */
export function isExplosiveCandle(candle: Candle, threshold: number = DEFAULT_EXPLOSIVE_THRESHOLD, minATR: number = 0): boolean {
    if (candleBody(candle) === 0) return false;
    if (minATR > 0 && candleRange(candle) < minATR) return false;
    return candleBody(candle) / candleRange(candle) >= threshold;
};
