import { Candle, SupplyZone, DemandZone } from '../types';
/**
 * Identifies all supply and demand zones in a given JSON file of candles.
 *
 * @param filePath - The path to the JSON file containing an array of Candle objects.
 * @returns An object containing arrays of identified supply and demand zones.
 */
export declare function identifyZones(candles: Candle[]): {
    supplyZones: SupplyZone[];
    demandZones: DemandZone[];
};
