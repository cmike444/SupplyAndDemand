import { Candle, DemandZone } from '../types';
/**
 * Identifies a drop-base-rally pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A DemandZone object if the pattern is identified, otherwise `null`.
 */
export declare function dropBaseRally(candles: Candle[]): DemandZone | null;
