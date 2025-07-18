"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyZones = identifyZones;
const rallyBaseDrop_1 = require("./rallyBaseDrop");
const dropBaseDrop_1 = require("./dropBaseDrop");
const dropBaseRally_1 = require("./dropBaseRally");
const rallyBaseRally_1 = require("./rallyBaseRally");
/**
 * Identifies all supply and demand zones in a given JSON file of candles.
 *
 * @param filePath - The path to the JSON file containing an array of Candle objects.
 * @returns An object containing arrays of identified supply and demand zones.
 */
function identifyZones(candles) {
    const supplyZones = [];
    const demandZones = [];
    console.log(`Starting zone identification for ${candles.length} candles...`);
    try {
        // Iterate through the candles to identify zones
        for (let i = 0; i < candles.length; i++) {
            const remainingCandles = candles.slice(i);
            // Check for supply zones
            const rallyBaseDropZone = (0, rallyBaseDrop_1.rallyBaseDrop)(remainingCandles);
            if (rallyBaseDropZone) {
                console.log(`Identified a Rally-Base-Drop zone at index ${i}`);
                supplyZones.push(rallyBaseDropZone);
                // Skip the number of candles in the identified zone
                const zoneLength = remainingCandles.findIndex(c => c.timestamp === rallyBaseDropZone.endTimestamp) + 1;
                i += zoneLength - 1; // Subtract 1 because the loop will increment `i` again
                continue;
            }
            const dropBaseDropZone = (0, dropBaseDrop_1.dropBaseDrop)(remainingCandles);
            if (dropBaseDropZone) {
                console.log(`Identified a Drop-Base-Drop zone at index ${i}`);
                supplyZones.push(dropBaseDropZone);
                const zoneLength = remainingCandles.findIndex(c => c.timestamp === dropBaseDropZone.endTimestamp) + 1;
                i += zoneLength - 1;
                continue;
            }
            // Check for demand zones
            const dropBaseRallyZone = (0, dropBaseRally_1.dropBaseRally)(remainingCandles);
            if (dropBaseRallyZone) {
                console.log(`Identified a Drop-Base-Rally zone at index ${i}`);
                demandZones.push(dropBaseRallyZone);
                const zoneLength = remainingCandles.findIndex(c => c.timestamp === dropBaseRallyZone.endTimestamp) + 1;
                i += zoneLength - 1;
                continue;
            }
            const rallyBaseRallyZone = (0, rallyBaseRally_1.rallyBaseRally)(remainingCandles);
            if (rallyBaseRallyZone) {
                console.log(`Identified a Rally-Base-Rally zone at index ${i}`);
                demandZones.push(rallyBaseRallyZone);
                const zoneLength = remainingCandles.findIndex(c => c.timestamp === rallyBaseRallyZone.endTimestamp) + 1;
                i += zoneLength - 1;
                continue;
            }
        }
    }
    catch (error) {
        console.error('Error during zone identification:', error);
    }
    console.log(`Zone identification complete. Found ${supplyZones.length} supply zones and ${demandZones.length} demand zones.`);
    return { supplyZones, demandZones };
}
