import { rallyBaseDrop } from '../lib';
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
// Explosive drop 1 of 2: opens near base high (116), body=25, range=28, ratio=0.893 → explosive bearish
const bearishExplosive1 = (ts: number): Candle => ({ open: 116, close: 91, high: 118, low: 90, timestamp: ts });
// Explosive drop 2 of 2: opens near prior close (92), body=22, range=24, ratio=0.917 → explosive bearish
const bearishExplosive2 = (ts: number): Candle => ({ open: 92, close: 70, high: 93, low: 69, timestamp: ts });

describe('rallyBaseDrop', () => {
    it('returns null for arrays shorter than MIN_ZONE_CANDLES', () => {
        const candles = [bullishDecisive1(1), bullishDecisive2(2), indecisive1(3), indecisive2(4)];
        expect(rallyBaseDrop(candles)).toBeNull();
    });

    it('returns null when the sequence does not begin with a bullish decisive candle', () => {
        const candles = [indecisive1(1), indecisive2(2), indecisive1(3), indecisive2(4), bearishExplosive1(5), bearishExplosive2(6)];
        expect(rallyBaseDrop(candles)).toBeNull();
    });

    it('returns null when the base is shorter than MIN_BASE_CANDLES', () => {
        // 0 indecisive candles between the rally and the explosive leg → no base at all
        const candles = [bullishDecisive1(1), bullishDecisive2(2), bearishExplosive1(3), bearishExplosive2(4), bearishExplosive2(5), bearishExplosive2(6)];
        expect(rallyBaseDrop(candles)).toBeNull();
    });

    it('returns null when no bearish explosive candle follows the base', () => {
        const candles = [bullishDecisive1(1), bullishDecisive2(2), indecisive1(3), indecisive2(4), indecisive1(5), indecisive2(6)];
        expect(rallyBaseDrop(candles)).toBeNull();
    });

    it('returns a SupplyZone for a valid rally-base-drop pattern', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        expect(rallyBaseDrop(candles)).not.toBeNull();
    });

    it('sets direction to SUPPLY and type to RALLY_BASE_DROP', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const zone = rallyBaseDrop(candles)!;
        expect(zone.direction).toBe(ZONE_DIRECTION.SUPPLY);
        expect(zone.type).toBe(ZONE_TYPE.RALLY_BASE_DROP);
    });

    it('sets proximal to the minimum body (open/close) of the base candles', () => {
        const base1: Candle = { open: 101, close: 102, high: 105, low: 96, timestamp: 3 };
        const base2: Candle = { open: 102, close: 103, high: 104, low: 100, timestamp: 4 };
        const candles = [bullishDecisive1(1), bullishDecisive2(2), base1, base2, bearishExplosive1(5), bearishExplosive2(6)];
        // proximal = min(min(101,102), min(102,103)) = 101
        expect(rallyBaseDrop(candles)!.proximalLine).toBe(101);
    });

    it('sets distal to the maximum high of the full formation (leg-in + base + leg-out)', () => {
        const base1: Candle = { open: 101, close: 102, high: 108, low: 100, timestamp: 3 };
        const base2: Candle = { open: 102, close: 103, high: 104, low: 101, timestamp: 4 };
        const candles = [bullishDecisive1(1), bullishDecisive2(2), base1, base2, bearishExplosive1(5), bearishExplosive2(6)];
        // highs across full formation: 104, 118, 108, 104, 118, 93 → max = 118
        expect(rallyBaseDrop(candles)!.distalLine).toBe(118);
    });

    it('sets startTs to the first candle and endTs to the last candle of the pattern', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const zone = rallyBaseDrop(candles)!;
        expect(zone.startTimestamp).toBe(1);
        expect(zone.endTimestamp).toBe(6);
    });

    it('sets confidence to a number in [0, 1] for a valid pattern', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const zone = rallyBaseDrop(candles)!;
        expect(typeof zone.confidence).toBe('number');
        expect(zone.confidence).toBeGreaterThanOrEqual(0);
        expect(zone.confidence).toBeLessThanOrEqual(1);
    });
});
