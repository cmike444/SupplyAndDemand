import { filterFreshZones } from '../lib';
import { SupplyZone, DemandZone } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';

// Supply zone: proximalLine is the LOWER edge (bottom of supply)
const supply = (proximal: number, distal: number, endTs: number): SupplyZone => ({
    direction: ZONE_DIRECTION.SUPPLY,
    type: ZONE_TYPE.RALLY_BASE_DROP,
    proximalLine: proximal,
    distalLine: distal,
    startTimestamp: 1,
    endTimestamp: endTs,
    confidence: 0.5,
});

// Demand zone: proximalLine is the UPPER edge (top of demand)
const demand = (proximal: number, distal: number, endTs: number): DemandZone => ({
    direction: ZONE_DIRECTION.DEMAND,
    type: ZONE_TYPE.DROP_BASE_RALLY,
    proximalLine: proximal,
    distalLine: distal,
    startTimestamp: 1,
    endTimestamp: endTs,
    confidence: 0.5,
});

describe('filterFreshZones', () => {

    it('returns unchanged arrays when there are no conflicts', () => {
        // supply at 200–210, demand at 100–90 → demand proximal(100) < supply proximal(200): no conflict
        const s = supply(200, 210, 10);
        const d = demand(100, 90, 5);
        const result = filterFreshZones([s], [d]);
        expect(result.supplyZones).toEqual([s]);
        expect(result.demandZones).toEqual([d]);
    });

    it('returns unchanged arrays when both arrays are empty', () => {
        const result = filterFreshZones([], []);
        expect(result.supplyZones).toHaveLength(0);
        expect(result.demandZones).toHaveLength(0);
    });

    it('returns unchanged arrays when only supply zones exist', () => {
        const s = supply(200, 210, 10);
        const result = filterFreshZones([s], []);
        expect(result.supplyZones).toEqual([s]);
    });

    it('returns unchanged arrays when only demand zones exist', () => {
        const d = demand(100, 90, 5);
        const result = filterFreshZones([], [d]);
        expect(result.demandZones).toEqual([d]);
    });

    // --- Conflict: demand.proximalLine > supply.proximalLine ---

    it('removes the demand zone when it is older than the conflicting supply zone', () => {
        // demand proximal=250 > supply proximal=200: conflict
        // demand endTs=5 < supply endTs=10 → demand is older → remove demand
        const s = supply(200, 210, 10);
        const d = demand(250, 230, 5);
        const result = filterFreshZones([s], [d]);
        expect(result.supplyZones).toEqual([s]);
        expect(result.demandZones).toHaveLength(0);
    });

    it('removes the supply zone when it is older than the conflicting demand zone', () => {
        // demand proximal=250 > supply proximal=200: conflict
        // supply endTs=3 < demand endTs=10 → supply is older → remove supply
        const s = supply(200, 210, 3);
        const d = demand(250, 230, 10);
        const result = filterFreshZones([s], [d]);
        expect(result.supplyZones).toHaveLength(0);
        expect(result.demandZones).toEqual([d]);
    });

    it('removes the demand zone as tie-break when both zones have equal endTimestamp', () => {
        const s = supply(200, 210, 5);
        const d = demand(250, 230, 5);
        const result = filterFreshZones([s], [d]);
        expect(result.supplyZones).toEqual([s]);
        expect(result.demandZones).toHaveLength(0);
    });

    it('handles multiple conflicts, removing each older zone independently', () => {
        // Pair 1: d1 wins over s1 → s1 removed
        //   d1.proximal(100) > s1.proximal(50): conflict; s1.endTs(2) < d1.endTs(8) → s1 stale
        //   d1.proximal(100) <= s2.proximal(150): no conflict with s2
        // Pair 2: s2 wins over d2 → d2 removed
        //   d2.proximal(200) > s1.proximal(50): conflict; s1.endTs(2) < d2.endTs(4) → s1 already stale, no change to d2
        //   d2.proximal(200) > s2.proximal(150): conflict; d2.endTs(4) < s2.endTs(9) → d2 stale
        const s1 = supply(50, 60, 2);
        const s2 = supply(150, 160, 9);
        const d1 = demand(100, 90, 8);
        const d2 = demand(200, 190, 4);

        const result = filterFreshZones([s1, s2], [d1, d2]);
        expect(result.supplyZones).not.toContain(s1);
        expect(result.supplyZones).toContain(s2);
        expect(result.demandZones).toContain(d1);
        expect(result.demandZones).not.toContain(d2);
    });

    it('preserves order of surviving zones', () => {
        // d2.proximal(250) > s2.proximal(200): conflict; s2 older → s2 removed
        // d2.proximal(250) <= s1.proximal(400): no conflict with s1
        // d2.proximal(250) <= s3.proximal(300): no conflict with s3
        const s1 = supply(400, 410, 10);
        const s2 = supply(200, 210, 12); // will be removed
        const s3 = supply(300, 310, 14);

        const d1 = demand(50, 40, 5);    // no conflict with any supply
        const d2 = demand(250, 240, 15); // conflicts with s2 only; s2 older → s2 removed

        const result = filterFreshZones([s1, s2, s3], [d1, d2]);
        expect(result.supplyZones).toEqual([s1, s3]);
        expect(result.demandZones).toEqual([d1, d2]);
    });

    it('does not mutate the input arrays', () => {
        const s = supply(200, 210, 3);
        const d = demand(250, 230, 10);
        const supplyInput = [s];
        const demandInput = [d];
        filterFreshZones(supplyInput, demandInput);
        expect(supplyInput).toHaveLength(1);
        expect(demandInput).toHaveLength(1);
    });
});
