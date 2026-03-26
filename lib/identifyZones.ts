import { Candle, SupplyZone, DemandZone } from '../types';
import { rallyBaseDrop } from './rallyBaseDrop';
import { dropBaseDrop } from './dropBaseDrop';
import { dropBaseRally } from './dropBaseRally';
import { rallyBaseRally } from './rallyBaseRally';

/**
 * Identifies all supply and demand zones in a given array of candles.
 *
 * @param candles - An array of Candle objects to scan.
 * @returns An object containing arrays of identified supply and demand zones.
 */
export function identifyZones(candles: Candle[]): { supplyZones: SupplyZone[]; demandZones: DemandZone[] } {
    const supplyZones: SupplyZone[] = [];
    const demandZones: DemandZone[] = [];

    for (let i = 0; i < candles.length; i++) {
        const remainingCandles = candles.slice(i);

        const rallyBaseDropZone = rallyBaseDrop(remainingCandles);
        if (rallyBaseDropZone) {
            supplyZones.push(rallyBaseDropZone);
            const endIdx = remainingCandles.findIndex(c => c.timestamp === rallyBaseDropZone.endTimestamp);
            if (endIdx !== -1) i += endIdx;
            continue;
        }

        const dropBaseDropZone = dropBaseDrop(remainingCandles);
        if (dropBaseDropZone) {
            supplyZones.push(dropBaseDropZone);
            const endIdx = remainingCandles.findIndex(c => c.timestamp === dropBaseDropZone.endTimestamp);
            if (endIdx !== -1) i += endIdx;
            continue;
        }

        const dropBaseRallyZone = dropBaseRally(remainingCandles);
        if (dropBaseRallyZone) {
            demandZones.push(dropBaseRallyZone);
            const endIdx = remainingCandles.findIndex(c => c.timestamp === dropBaseRallyZone.endTimestamp);
            if (endIdx !== -1) i += endIdx;
            continue;
        }

        const rallyBaseRallyZone = rallyBaseRally(remainingCandles);
        if (rallyBaseRallyZone) {
            demandZones.push(rallyBaseRallyZone);
            const endIdx = remainingCandles.findIndex(c => c.timestamp === rallyBaseRallyZone.endTimestamp);
            if (endIdx !== -1) i += endIdx;
            continue;
        }
    }

    return { supplyZones, demandZones };
}
