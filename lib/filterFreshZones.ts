import { SupplyZone, DemandZone } from '../types';

/**
 * Filters out stale zones based on price-level freshness rules:
 *
 * - A demand zone can never be priced above a supply zone. If `demand.proximal`
 *   (the upper edge of the demand zone) is greater than `supply.proximal`
 *   (the lower edge of the supply zone), the zones are in conflict.
 *
 * - When a conflict is detected, the zone with the older `endTs` is removed —
 *   it was effectively consumed by the price move that created the newer zone.
 *   On a tie, the demand zone is removed.
 *
 * The returned arrays preserve the original ordering of the surviving zones.
 *
 * @param supplyZones - Array of identified supply zones.
 * @param demandZones - Array of identified demand zones.
 * @returns A new object containing only the fresh, non-conflicting zones.
 */
export function filterFreshZones(
    supplyZones: SupplyZone[],
    demandZones: DemandZone[],
): { supplyZones: SupplyZone[]; demandZones: DemandZone[] } {
    const staleSupply = new Set<SupplyZone>();
    const staleDemand = new Set<DemandZone>();

    for (const demand of demandZones) {
        for (const supply of supplyZones) {
            if (demand.proximalLine > supply.proximalLine) {
                // Conflict: demand upper edge is above supply lower edge
                if (demand.endTimestamp < supply.endTimestamp) {
                    staleDemand.add(demand);
                } else if (supply.endTimestamp < demand.endTimestamp) {
                    staleSupply.add(supply);
                } else {
                    // Tie: remove demand zone
                    staleDemand.add(demand);
                }
            }
        }
    }

    return {
        supplyZones: supplyZones.filter(z => !staleSupply.has(z)),
        demandZones: demandZones.filter(z => !staleDemand.has(z)),
    };
}
