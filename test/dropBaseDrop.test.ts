import { dropBaseDrop } from '../lib';
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
// Explosive drop 1 of 2: opens near base low (117), body=22, range=24, ratio=0.917 → explosive bearish
const bearishExplosive1 = (ts: number): Candle => ({ open: 117, close: 95, high: 118, low: 94, timestamp: ts });
// Explosive drop 2 of 2: opens near prior close (96), body=21, range=23, ratio=0.913 → explosive bearish
const bearishExplosive2 = (ts: number): Candle => ({ open: 96, close: 75, high: 97, low: 74, timestamp: ts });

describe('dropBaseDrop', () => {
    it('returns null for arrays shorter than MIN_ZONE_CANDLES', () => {
        const candles = [bearishDecisive1(1), bearishDecisive2(2), indecisive1(3), indecisive2(4), bearishExplosive1(5)];
        expect(dropBaseDrop(candles)).toBeNull();
    });

    it('returns null when the sequence does not begin with a bearish decisive candle', () => {
        const candles = [indecisive1(1), indecisive2(2), indecisive1(3), indecisive2(4), bearishExplosive1(5), bearishExplosive2(6)];
        expect(dropBaseDrop(candles)).toBeNull();
    });

    it('returns null when the base is shorter than MIN_BASE_CANDLES', () => {
        const candles = [bearishDecisive1(1), bearishDecisive2(2), indecisive1(3), bearishExplosive1(4), bearishExplosive2(5), bearishExplosive2(6)];
        expect(dropBaseDrop(candles)).toBeNull();
    });

    it('returns null when no bearish explosive candle follows the base', () => {
        const candles = [bearishDecisive1(1), bearishDecisive2(2), indecisive1(3), indecisive2(4), indecisive1(5), indecisive2(6)];
        expect(dropBaseDrop(candles)).toBeNull();
    });

    it('returns a SupplyZone for a valid drop-base-drop pattern', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        expect(dropBaseDrop(candles)).not.toBeNull();
    });

    it('sets direction to SUPPLY and type to DROP_BASE_DROP', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const zone = dropBaseDrop(candles)!;
        expect(zone.direction).toBe(ZONE_DIRECTION.SUPPLY);
        expect(zone.type).toBe(ZONE_TYPE.DROP_BASE_DROP);
    });

    it('sets proximalLine to the minimum low of the base candles', () => {
        const base1: Candle = { open: 120, close: 121, high: 124, low: 116, timestamp: 3 };
        const base2: Candle = { open: 121, close: 120, high: 123, low: 119, timestamp: 4 };
        const candles = [bearishDecisive1(1), bearishDecisive2(2), base1, base2, bearishExplosive1(5), bearishExplosive2(6)];
        expect(dropBaseDrop(candles)!.proximalLine).toBe(116);
    });

    it('sets distalLine to the maximum high of the base candles', () => {
        const base1: Candle = { open: 120, close: 121, high: 126, low: 119, timestamp: 3 };
        const base2: Candle = { open: 121, close: 120, high: 123, low: 118, timestamp: 4 };
        const candles = [bearishDecisive1(1), bearishDecisive2(2), base1, base2, bearishExplosive1(5), bearishExplosive2(6)];
        expect(dropBaseDrop(candles)!.distalLine).toBe(126);
    });

    it('sets startTimestamp to the first candle and endTimestamp to the last candle of the pattern', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const zone = dropBaseDrop(candles)!;
        expect(zone.startTimestamp).toBe(1);
        expect(zone.endTimestamp).toBe(6);
    });
});
