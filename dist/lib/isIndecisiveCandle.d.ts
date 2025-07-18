import { Candle } from '../types';
/**
 * Determines if a given candle is an indecisive candle based on its body-to-range ratio.
 *
 * An indecisive candle typically has a small body relative to its range, indicating market uncertainty.
 *
 * @param candle - The candle object containing the data for the analysis.
 * @param threshold - The maximum ratio of the candle body to the candle range to consider it indecisive.
 *                     Defaults to `DEFAULT_DECISIVE_THRESHOLD`.
 * @returns `true` if the candle is indecisive, otherwise `false`.
 */
export declare function isIndecisiveCandle(candle: Candle, threshold?: number): boolean;
