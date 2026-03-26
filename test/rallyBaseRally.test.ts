import { rallyBaseRally } from '../lib';
import { Candle } from '../types';
import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';

// body=6, range=11, ratio≈0.545 → decisive (>0.5), NOT explosive (≤0.7), bullish
const bullishDecisive = (ts: number): Candle => ({ open: 100, close: 106, high: 110, low: 99, timestamp: ts });
// body=2, range=11, ratio≈0.182 → indecisive (≤0.5)
const indecisive = (ts: number): Candle => ({ open: 100, close: 102, high: 110, low: 99, timestamp: ts });
// body=9, range=11, ratio≈0.818 → explosive (>0.7), bullish
const bullishExplosive = (ts: number): Candle => ({ open: 100, close: 109, high: 110, low: 99, timestamp: ts });

describe('rallyBaseRally', () => {
    it('returns null for arrays shorter than MIN_ZONE_CANDLES', () => {
        const candles = [bullishDecisive(1), bullishDecisive(2), indecisive(3), indecisive(4), bullishExplosive(5)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns null when the sequence does not begin with a bullish decisive candle', () => {
        const candles = [indecisive(1), indecisive(2), indecisive(3), indecisive(4), bullishExplosive(5), bullishExplosive(6)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns null when the base is shorter than MIN_BASE_CANDLES', () => {
        const candles = [bullishDecisive(1), bullishDecisive(2), indecisive(3), bullishExplosive(4), bullishExplosive(5), bullishExplosive(6)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns null when no bullish explosive candle follows the base', () => {
        const candles = [bullishDecisive(1), bullishDecisive(2), indecisive(3), indecisive(4), indecisive(5), indecisive(6)];
        expect(rallyBaseRally(candles)).toBeNull();
    });

    it('returns a DemandZone for a valid rally-base-rally pattern', () => {
        const candles = [
            bullishDecisive(1), bullishDecisive(2),
            indecisive(3), indecisive(4),
            bullishExplosive(5), bullishExplosive(6),
        ];
        expect(rallyBaseRally(candles)).not.toBeNull();
    });

    it('sets direction to DEMAND and type to RALLY_BASE_RALLY', () => {
        const candles = [
            bullishDecisive(1), bullishDecisive(2),
            indecisive(3), indecisive(4),
            bullishExplosive(5), bullishExplosive(6),
        ];
        const zone = rallyBaseRally(candles)!;
        expect(zone.direction).toBe(ZONE_DIRECTION.DEMAND);
        expect(zone.type).toBe(ZONE_TYPE.RALLY_BASE_RALLY);
    });

    it('sets proximalLine to the maximum high of the base candles', () => {
        const base1: Candle = { open: 100, close: 102, high: 112, low: 97, timestamp: 3 };
        const base2: Candle = { open: 100, close: 101, high: 108, low: 99, timestamp: 4 };
        const candles = [bullishDecisive(1), bullishDecisive(2), base1, base2, bullishExplosive(5), bullishExplosive(6)];
        expect(rallyBaseRally(candles)!.proximalLine).toBe(112);
    });

    it('sets distalLine to the minimum low of the base candles', () => {
        const base1: Candle = { open: 100, close: 102, high: 112, low: 97, timestamp: 3 };
        const base2: Candle = { open: 100, close: 101, high: 108, low: 99, timestamp: 4 };
        const candles = [bullishDecisive(1), bullishDecisive(2), base1, base2, bullishExplosive(5), bullishExplosive(6)];
        expect(rallyBaseRally(candles)!.distalLine).toBe(97);
    });

    it('sets startTimestamp to the first candle and endTimestamp to the last candle of the pattern', () => {
        const candles = [
            bullishDecisive(1), bullishDecisive(2),
            indecisive(3), indecisive(4),
            bullishExplosive(5), bullishExplosive(6),
        ];
        const zone = rallyBaseRally(candles)!;
        expect(zone.startTimestamp).toBe(1);
        expect(zone.endTimestamp).toBe(6);
    });
});
