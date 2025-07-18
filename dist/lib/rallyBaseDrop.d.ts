import { Candle, SupplyZone } from '../types';
/**
 * Identifies a rally-base-drop pattern in a series of candlestick data.
 *
 * @param candles - Array of Candle objects to evaluate.
 * @returns A SupplyZone object if the pattern is identified, otherwise `null`.
 */
export declare function rallyBaseDrop(candles: Candle[]): SupplyZone | null;
