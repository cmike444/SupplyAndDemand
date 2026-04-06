import { rallyBaseRally } from '../lib';
import { Candle } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';

// Rally 1 of 2: open:82→close:98, body=16, range=26, ratio=0.615 → decisive bullish
const bullishDecisive1 = (ts: number): Candle => ({ open: 82, close: 98, high: 104, low: 78, timestamp: ts });
// Rally 2 of 2: opens near prior close (97), closes at 114: body=17, range=25, ratio=0.68 → decisive bullish
const bullishDecisive2 = (ts: number): Candle => ({ open: 97, close: 114, high: 118, low: 93, timestamp: ts });
// Base 1 of 2: tight ~112–117 consolidation, body=1, range=5, ratio=0.2 → indecisive
const indecisive1 = (ts: number): Candle => ({ open: 115, close: 114, high: 117, low: 112, timestamp: ts });
// Base 2 of 2: opens near prior close (114), body=1, range=3, ratio=0.333 → indecisive
const indecisive2 = (ts: number): Candle => ({ open: 114, close: 115, high: 116, low: 113, timestamp: ts });
// Explosive rally 1 of 2: opens near base high (116), body=25, range=28, ratio=0.893 → explosive bullish
const bullishExplosive1 = (ts: number): Candle => ({ open: 116, close: 141, high: 143, low: 115, timestamp: ts });
// Explosive rally 2 of 2: opens near prior close (140), body=23, range=26, ratio=0.885 → explosive bullish
const bullishExplosive2 = (ts: number): Candle => ({ open: 140, close: 163, high: 165, low: 139, timestamp: ts });

describe('rallyBaseRally', () => {
    it('returns null for arrays shorter than MIN_ZONE_CANDLES', () => {
        const candles = [bullishDecisive1(1), bullishDecisive2(2), indecisive1(3), indecisive2(4)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns null when the sequence does not begin with a bullish decisive candle', () => {
        const candles = [indecisive1(1), indecisive2(2), indecisive1(3), indecisive2(4), bullishExplosive1(5), bullishExplosive2(6)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns null when the base is shorter than MIN_BASE_CANDLES', () => {
        // 0 indecisive candles between the rally and the explosive leg → no base at all
        const candles = [bullishDecisive1(1), bullishDecisive2(2), bullishExplosive1(3), bullishExplosive2(4), bullishExplosive2(5), bullishExplosive2(6)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns null when no bullish explosive candle follows the base', () => {
        const candles = [bullishDecisive1(1), bullishDecisive2(2), indecisive1(3), indecisive2(4), indecisive1(5), indecisive2(6)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns a DemandZone for a valid rally-base-rally pattern', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        expect(rallyBaseRally(candles)).not.toBeNull();
    });

    it('sets direction to DEMAND and type to RALLY_BASE_RALLY', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const zone = rallyBaseRally(candles)!;
        expect(zone.direction).toBe(ZONE_DIRECTION.DEMAND);
        expect(zone.type).toBe(ZONE_TYPE.RALLY_BASE_RALLY);
    });

    it('sets proximal to the maximum body (open/close) of the base candles', () => {
        const base1: Candle = { open: 101, close: 102, high: 108, low: 100, timestamp: 3 };
        const base2: Candle = { open: 102, close: 103, high: 104, low: 101, timestamp: 4 };
        const candles = [bullishDecisive1(1), bullishDecisive2(2), base1, base2, bullishExplosive1(5), bullishExplosive2(6)];
        // proximal = max(max(101,102), max(102,103)) = 103
        expect(rallyBaseRally(candles)!.proximalLine).toBe(103);
    });

    it('sets distal to the minimum low of the full formation (leg-in + base + leg-out)', () => {
        const base1: Candle = { open: 101, close: 102, high: 105, low: 96, timestamp: 3 };
        const base2: Candle = { open: 102, close: 103, high: 104, low: 100, timestamp: 4 };
        const candles = [bullishDecisive1(1), bullishDecisive2(2), base1, base2, bullishExplosive1(5), bullishExplosive2(6)];
        // lows across full formation: 78, 93, 96, 100, 115, 139 → min = 78
        expect(rallyBaseRally(candles)!.distalLine).toBe(78);
    });

    it('sets startTs to the first candle and endTs to the last candle of the pattern', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const zone = rallyBaseRally(candles)!;
        expect(zone.startTimestamp).toBe(1);
        expect(zone.endTimestamp).toBe(6);
    });

    it('sets confidence to a number in [0, 1] for a valid pattern', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const zone = rallyBaseRally(candles)!;
        expect(typeof zone.confidence).toBe('number');
        expect(zone.confidence).toBeGreaterThanOrEqual(0);
        expect(zone.confidence).toBeLessThanOrEqual(1);
    });
});
