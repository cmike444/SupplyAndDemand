import { Candle, SupplyZone, DemandZone } from '../types';
import { rallyBaseDrop } from './rallyBaseDrop';
import { dropBaseDrop } from './dropBaseDrop';
import { dropBaseRally } from './dropBaseRally';
import { rallyBaseRally } from './rallyBaseRally';

/**
 * Identifies all supply and demand zones in a given JSON file of candles.
 *
 * @param filePath - The path to the JSON file containing an array of Candle objects.
 * @returns An object containing arrays of identified supply and demand zones.
 */
export function identifyZones(candles: Candle[]): { supplyZones: SupplyZone[]; demandZones: DemandZone[] } {
    const supplyZones: SupplyZone[] = [];
    const demandZones: DemandZone[] = [];

    console.log(`Starting zone identification for ${candles.length} candles...`);

    try {
        // Iterate through the candles to identify zones
        for (let i = 0; i < candles.length; i++) {
            const remainingCandles = candles.slice(i);

            // Check for supply zones
            const rallyBaseDropZone = rallyBaseDrop(remainingCandles);
            if (rallyBaseDropZone) {
                console.log(`Identified a Rally-Base-Drop zone at index ${i}`);
                supplyZones.push(rallyBaseDropZone);

                // Skip the number of candles in the identified zone
                const zoneLength = remainingCandles.findIndex(c => c.timestamp === rallyBaseDropZone.endTimestamp) + 1;
                i += zoneLength - 1; // Subtract 1 because the loop will increment `i` again
                continue;
            }

            const dropBaseDropZone = dropBaseDrop(remainingCandles);
            if (dropBaseDropZone) {
                console.log(`Identified a Drop-Base-Drop zone at index ${i}`);
                supplyZones.push(dropBaseDropZone);

                const zoneLength = remainingCandles.findIndex(c => c.timestamp === dropBaseDropZone.endTimestamp) + 1;
                i += zoneLength - 1;
                continue;
            }

            // Check for demand zones
            const dropBaseRallyZone = dropBaseRally(remainingCandles);
            if (dropBaseRallyZone) {
                console.log(`Identified a Drop-Base-Rally zone at index ${i}`);
                demandZones.push(dropBaseRallyZone);

                const zoneLength = remainingCandles.findIndex(c => c.timestamp === dropBaseRallyZone.endTimestamp) + 1;
                i += zoneLength - 1;
                continue;
            }

            const rallyBaseRallyZone = rallyBaseRally(remainingCandles);
            if (rallyBaseRallyZone) {
                console.log(`Identified a Rally-Base-Rally zone at index ${i}`);
                demandZones.push(rallyBaseRallyZone);

                const zoneLength = remainingCandles.findIndex(c => c.timestamp === rallyBaseRallyZone.endTimestamp) + 1;
                i += zoneLength - 1;
                continue;
            }
        }
    } catch (error) {
            console.error('Error during zone identification:', error);
    }

    console.log(`Zone identification complete. Found ${supplyZones.length} supply zones and ${demandZones.length} demand zones.`);
    return { supplyZones, demandZones };
}
