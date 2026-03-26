import { identifyZones } from '../lib';
import { Candle } from '../types';
import { ZONE_TYPE } from '../enums';

// body=6, range=11, ratio≈0.545 → decisive (>0.5), NOT explosive (≤0.7), bearish
const bearishDecisive = (ts: number): Candle => ({ open: 106, close: 100, high: 110, low: 99, timestamp: ts });
// body=2, range=11, ratio≈0.182 → indecisive (≤0.5)
const indecisive = (ts: number): Candle => ({ open: 100, close: 102, high: 110, low: 99, timestamp: ts });
// body=9, range=11, ratio≈0.818 → explosive (>0.7), bearish
const bearishExplosive = (ts: number): Candle => ({ open: 109, close: 100, high: 110, low: 99, timestamp: ts });
// body=9, range=11, ratio≈0.818 → explosive (>0.7), bullish
const bullishExplosive = (ts: number): Candle => ({ open: 100, close: 109, high: 110, low: 99, timestamp: ts });
// body=6, range=11, ratio≈0.545 → decisive (>0.5), NOT explosive (≤0.7), bullish
const bullishDecisive = (ts: number): Candle => ({ open: 100, close: 106, high: 110, low: 99, timestamp: ts });

describe('identifyZones', () => {
    it('returns empty arrays for an empty candle list', () => {
        const result = identifyZones([]);
        expect(result.supplyZones).toHaveLength(0);
        expect(result.demandZones).toHaveLength(0);
    });

    it('returns empty arrays when no zone patterns are present', () => {
        const candles = Array.from({ length: 6 }, (_, i) => indecisive(i + 1));
        const result = identifyZones(candles);
        expect(result.supplyZones).toHaveLength(0);
        expect(result.demandZones).toHaveLength(0);
    });

    it('identifies a drop-base-drop supply zone', () => {
        const candles = [
            bearishDecisive(1), bearishDecisive(2),
            indecisive(3), indecisive(4),
            bearishExplosive(5), bearishExplosive(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(0);
        expect(supplyZones[0].type).toBe(ZONE_TYPE.DROP_BASE_DROP);
    });

    it('identifies a drop-base-rally demand zone', () => {
        const candles = [
            bearishDecisive(1), bearishDecisive(2),
            indecisive(3), indecisive(4),
            bullishExplosive(5), bullishExplosive(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(0);
        expect(demandZones).toHaveLength(1);
        expect(demandZones[0].type).toBe(ZONE_TYPE.DROP_BASE_RALLY);
    });

    it('identifies both a supply zone and a demand zone in a longer candle sequence', () => {
        const candles = [
            bearishDecisive(1),  bearishDecisive(2),  // leading drop
            indecisive(3),       indecisive(4),        // base
            bearishExplosive(5), bearishExplosive(6),  // trailing drop  → drop-base-drop (supply)
            bearishDecisive(7),  bearishDecisive(8),  // second leading drop
            indecisive(9),       indecisive(10),       // second base
            bullishExplosive(11), bullishExplosive(12), // trailing rally → drop-base-rally (demand)
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(1);
        expect(supplyZones[0].startTimestamp).toBe(1);
        expect(supplyZones[0].endTimestamp).toBe(6);
        expect(demandZones[0].startTimestamp).toBe(7);
        expect(demandZones[0].endTimestamp).toBe(12);
    });

    it('identifies a rally-base-drop supply zone', () => {
        const candles = [
            bullishDecisive(1), bullishDecisive(2),
            indecisive(3), indecisive(4),
            bearishExplosive(5), bearishExplosive(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(0);
        expect(supplyZones[0].type).toBe(ZONE_TYPE.RALLY_BASE_DROP);
    });

    it('identifies a rally-base-rally demand zone', () => {
        const candles = [
            bullishDecisive(1), bullishDecisive(2),
            indecisive(3), indecisive(4),
            bullishExplosive(5), bullishExplosive(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(0);
        expect(demandZones).toHaveLength(1);
        expect(demandZones[0].type).toBe(ZONE_TYPE.RALLY_BASE_RALLY);
    });
});
