import { dropBaseRally } from '../lib';
import { Candle } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';

// Drop 1 of 2: open:150→close:132, body=18, range=26, ratio=0.692 → decisive bearish
const bearishDecisive1 = (ts: number): Candle => ({ open: 150, close: 132, high: 152, low: 126, timestamp: ts });
// Drop 2 of 2: opens near prior close (133), drops further: body=15, range=23, ratio=0.652 → decisive bearish
const bearishDecisive2 = (ts: number): Candle => ({ open: 133, close: 118, high: 135, low: 112, timestamp: ts });
// Base 1 of 2: tight ~116–121 consolidation, body=1, range=5, ratio=0.2 → indecisive
const indecisive1 = (ts: number): Candle => ({ open: 119, close: 118, high: 121, low: 116, timestamp: ts });
// Base 2 of 2: opens near prior close (118), body=1, range=3, ratio=0.333 → indecisive
const indecisive2 = (ts: number): Candle => ({ open: 118, close: 119, high: 120, low: 117, timestamp: ts });
// Explosive rally 1 of 2: opens near base low (117), body=21, range=24, ratio=0.875 → explosive bullish
const bullishExplosive1 = (ts: number): Candle => ({ open: 117, close: 138, high: 140, low: 116, timestamp: ts });
// Explosive rally 2 of 2: opens near prior close (138), body=20, range=23, ratio=0.870 → explosive bullish
const bullishExplosive2 = (ts: number): Candle => ({ open: 138, close: 158, high: 160, low: 137, timestamp: ts });

describe('dropBaseRally', () => {
    it('returns null for arrays shorter than MIN_ZONE_CANDLES', () => {
        const candles = [bearishDecisive1(1), bearishDecisive2(2), indecisive1(3), indecisive2(4), bullishExplosive1(5)];
        expect(dropBaseRally(candles)).toBeNull();
    });

    it('returns null when the sequence does not begin with a bearish decisive candle', () => {
        const candles = [indecisive1(1), indecisive2(2), indecisive1(3), indecisive2(4), bullishExplosive1(5), bullishExplosive2(6)];
        expect(dropBaseRally(candles)).toBeNull();
    });

    it('returns null when the base is shorter than MIN_BASE_CANDLES', () => {
        const candles = [bearishDecisive1(1), bearishDecisive2(2), indecisive1(3), bullishExplosive1(4), bullishExplosive2(5), bullishExplosive2(6)];
        expect(dropBaseRally(candles)).toBeNull();
    });

    it('returns null when no bullish explosive candle follows the base', () => {
        const candles = [bearishDecisive1(1), bearishDecisive2(2), indecisive1(3), indecisive2(4), indecisive1(5), indecisive2(6)];
        expect(dropBaseRally(candles)).toBeNull();
    });

    it('returns a DemandZone for a valid drop-base-rally pattern', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        expect(dropBaseRally(candles)).not.toBeNull();
    });

    it('sets direction to DEMAND and type to DROP_BASE_RALLY', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const zone = dropBaseRally(candles)!;
        expect(zone.direction).toBe(ZONE_DIRECTION.DEMAND);
        expect(zone.type).toBe(ZONE_TYPE.DROP_BASE_RALLY);
    });

    it('sets proximalLine to the maximum high of the base candles', () => {
        const base1: Candle = { open: 120, close: 121, high: 126, low: 119, timestamp: 3 };
        const base2: Candle = { open: 121, close: 120, high: 123, low: 118, timestamp: 4 };
        const candles = [bearishDecisive1(1), bearishDecisive2(2), base1, base2, bullishExplosive1(5), bullishExplosive2(6)];
        expect(dropBaseRally(candles)!.proximalLine).toBe(126);
    });

    it('sets distalLine to the minimum low of the base candles', () => {
        const base1: Candle = { open: 120, close: 121, high: 124, low: 116, timestamp: 3 };
        const base2: Candle = { open: 121, close: 120, high: 123, low: 119, timestamp: 4 };
        const candles = [bearishDecisive1(1), bearishDecisive2(2), base1, base2, bullishExplosive1(5), bullishExplosive2(6)];
        expect(dropBaseRally(candles)!.distalLine).toBe(116);
    });

    it('sets startTimestamp to the first candle and endTimestamp to the last candle of the pattern', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const zone = dropBaseRally(candles)!;
        expect(zone.startTimestamp).toBe(1);
        expect(zone.endTimestamp).toBe(6);
    });

    it('sets confidence to a number in [0, 1] for a valid pattern', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const zone = dropBaseRally(candles)!;
        expect(typeof zone.confidence).toBe('number');
        expect(zone.confidence).toBeGreaterThanOrEqual(0);
        expect(zone.confidence).toBeLessThanOrEqual(1);
    });
});
