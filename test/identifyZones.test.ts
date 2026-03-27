import { identifyZones } from '../lib';
import { Candle } from '../types';
import { ZONE_TYPE } from '../enums';

// Drop 1 of 2: open:150→close:132, body=18, range=26, ratio=0.692 → decisive bearish
const bearishDecisive1 = (ts: number): Candle => ({ open: 150, close: 132, high: 152, low: 126, timestamp: ts });
// Drop 2 of 2: opens near prior close (133), body=15, range=23, ratio=0.652 → decisive bearish
const bearishDecisive2 = (ts: number): Candle => ({ open: 133, close: 118, high: 135, low: 112, timestamp: ts });
// Base 1 of 2: tight ~116–121, body=1, range=5, ratio=0.2 → indecisive
const indecisive1 = (ts: number): Candle => ({ open: 119, close: 118, high: 121, low: 116, timestamp: ts });
// Base 2 of 2: opens near prior close (118), body=1, range=3, ratio=0.333 → indecisive
const indecisive2 = (ts: number): Candle => ({ open: 118, close: 119, high: 120, low: 117, timestamp: ts });
// Explosive drop 1 of 2: opens at base low (117), body=22, range=24, ratio=0.917 → explosive bearish
const bearishExplosive1 = (ts: number): Candle => ({ open: 117, close: 95, high: 118, low: 94, timestamp: ts });
// Explosive drop 2 of 2: opens near prior close (96), body=21, range=23, ratio=0.913 → explosive bearish
const bearishExplosive2 = (ts: number): Candle => ({ open: 96, close: 75, high: 97, low: 74, timestamp: ts });
// Explosive rally 1 of 2: opens at base low (117), body=21, range=24, ratio=0.875 → explosive bullish
const bullishExplosive1 = (ts: number): Candle => ({ open: 117, close: 138, high: 140, low: 116, timestamp: ts });
// Explosive rally 2 of 2: opens near prior close (138), body=20, range=23, ratio=0.870 → explosive bullish
const bullishExplosive2 = (ts: number): Candle => ({ open: 138, close: 158, high: 160, low: 137, timestamp: ts });
// Rally 1 of 2: open:82→close:98, body=16, range=26, ratio=0.615 → decisive bullish
const bullishDecisive1 = (ts: number): Candle => ({ open: 82, close: 98, high: 104, low: 78, timestamp: ts });
// Rally 2 of 2: opens near prior close (97), closes at 114, body=17, range=25, ratio=0.68 → decisive bullish
const bullishDecisive2 = (ts: number): Candle => ({ open: 97, close: 114, high: 118, low: 93, timestamp: ts });
// Rally base 1 of 2: tight ~112–117, body=1, range=5, ratio=0.2 → indecisive
const rallyIndecisive1 = (ts: number): Candle => ({ open: 115, close: 114, high: 117, low: 112, timestamp: ts });
// Rally base 2 of 2: opens near prior close (114), body=1, range=3, ratio=0.333 → indecisive
const rallyIndecisive2 = (ts: number): Candle => ({ open: 114, close: 115, high: 116, low: 113, timestamp: ts });
// Rally explosive drop 1 of 2: opens at base high (116), body=25, range=28, ratio=0.893 → explosive bearish
const rallyBearishExplosive1 = (ts: number): Candle => ({ open: 116, close: 91, high: 118, low: 90, timestamp: ts });
// Rally explosive drop 2 of 2: opens near prior close (92), body=22, range=24, ratio=0.917 → explosive bearish
const rallyBearishExplosive2 = (ts: number): Candle => ({ open: 92, close: 70, high: 93, low: 69, timestamp: ts });
// Rally explosive 1 of 2: opens at base high (116), body=25, range=28, ratio=0.893 → explosive bullish
const rallyBullishExplosive1 = (ts: number): Candle => ({ open: 116, close: 141, high: 143, low: 115, timestamp: ts });
// Rally explosive 2 of 2: opens near prior close (140), body=23, range=26, ratio=0.885 → explosive bullish
const rallyBullishExplosive2 = (ts: number): Candle => ({ open: 140, close: 163, high: 165, low: 139, timestamp: ts });

describe('identifyZones', () => {
    it('returns empty arrays for an empty candle list', () => {
        const result = identifyZones([]);
        expect(result.supplyZones).toHaveLength(0);
        expect(result.demandZones).toHaveLength(0);
    });

    it('returns empty arrays when no zone patterns are present', () => {
        const candles = Array.from({ length: 6 }, (_, i) => indecisive1(i + 1));
        const result = identifyZones(candles);
        expect(result.supplyZones).toHaveLength(0);
        expect(result.demandZones).toHaveLength(0);
    });

    it('identifies a drop-base-drop supply zone', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(0);
        expect(supplyZones[0].type).toBe(ZONE_TYPE.DROP_BASE_DROP);
    });

    it('identifies a drop-base-rally demand zone', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bullishExplosive1(5), bullishExplosive2(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(0);
        expect(demandZones).toHaveLength(1);
        expect(demandZones[0].type).toBe(ZONE_TYPE.DROP_BASE_RALLY);
    });

    it('identifies both a supply zone and a demand zone in a longer candle sequence', () => {
        const candles = [
            bearishDecisive1(1),  bearishDecisive2(2),   // leading drop
            indecisive1(3),       indecisive2(4),         // base
            bearishExplosive1(5), bearishExplosive2(6),   // trailing drop  → drop-base-drop (supply)
            bearishDecisive1(7),  bearishDecisive2(8),   // second leading drop
            indecisive1(9),       indecisive2(10),        // second base
            bullishExplosive1(11), bullishExplosive2(12), // trailing rally → drop-base-rally (demand)
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
            bullishDecisive1(1), bullishDecisive2(2),
            rallyIndecisive1(3), rallyIndecisive2(4),
            rallyBearishExplosive1(5), rallyBearishExplosive2(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(0);
        expect(supplyZones[0].type).toBe(ZONE_TYPE.RALLY_BASE_DROP);
    });

    it('identifies a rally-base-rally demand zone', () => {
        const candles = [
            bullishDecisive1(1), bullishDecisive2(2),
            rallyIndecisive1(3), rallyIndecisive2(4),
            rallyBullishExplosive1(5), rallyBullishExplosive2(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(0);
        expect(demandZones).toHaveLength(1);
        expect(demandZones[0].type).toBe(ZONE_TYPE.RALLY_BASE_RALLY);
    });
});
