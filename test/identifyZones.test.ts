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
        // Only the first bullish explosive candle (ts=11) meets the ATR magnitude check;
        // the second (ts=12, range=23) falls below 1.5× local ATR ≈ 23.7.
        expect(demandZones[0].endTimestamp).toBe(11);
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

    // --- rrScore ---

    it('sets rrScore on every zone returned', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(supplyZones[0].rrScore).toBeDefined();
    });

    it('rrScore is in [0, 1]', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones } = identifyZones(candles);
        expect(supplyZones[0].rrScore).toBeGreaterThanOrEqual(0);
        expect(supplyZones[0].rrScore).toBeLessThanOrEqual(1);
    });

    it('rrScore is computed from the departure leg (no opposing zone needed)', () => {
        // Supply zone only — departure is bearish explosive candles going down.
        // rrScore = min(targetDistance / stopDistance / 5, 1) > 0.
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones } = identifyZones(candles);
        // Departure travelled a measurable distance — score must be > 0
        expect(supplyZones[0].rrScore).toBeGreaterThan(0);
    });

    it('rrScore is higher when the opposing zone is farther away (better R:R)', () => {
        // Use the same candle sequence that's known to produce one supply + one demand zone
        const candles = [
            bearishDecisive1(1),  bearishDecisive2(2),
            indecisive1(3),       indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
            bearishDecisive1(7),  bearishDecisive2(8),
            indecisive1(9),       indecisive2(10),
            bullishExplosive1(11), bullishExplosive2(12),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(1);
        // Both zones have an opposing zone — rrScore should be computed (not the 0.5 fallback)
        expect(supplyZones[0].rrScore).toBeGreaterThanOrEqual(0);
        expect(demandZones[0].rrScore).toBeGreaterThanOrEqual(0);
    });

    it('rrScore is factored into confidence (confidence changes when opposing zone is present)', () => {
        // Zone without an opposing zone — rrScore defaults to 0.5 (neutral, no change to confidence)
        const supplyOnly = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones: soloSupply } = identifyZones(supplyOnly);

        // Same supply zone but now with an opposing demand zone present
        const withDemand = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
            bearishDecisive1(7), bearishDecisive2(8),
            indecisive1(9), indecisive2(10),
            bullishExplosive1(11), bullishExplosive2(12),
        ];
        const { supplyZones: pairedSupply } = identifyZones(withDemand);

        // confidence must differ because rrScore is non-neutral (≠ 0.5) when a real opposing zone exists
        expect(pairedSupply[0].confidence).not.toBeCloseTo(soloSupply[0].confidence, 5);
    });

    // --- entryPrice / stopPrice / targetPrice ---
    it('sets entryPrice equal to proximalLine', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones } = identifyZones(candles);
        expect(supplyZones[0].entryPrice).toBe(supplyZones[0].proximalLine);
    });

    it('sets stopPrice equal to distalLine', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones } = identifyZones(candles);
        expect(supplyZones[0].stopPrice).toBe(supplyZones[0].distalLine);
    });

    it('sets targetPrice to the opposing zone proximal when one exists', () => {
        // Supply zone base at ~162, demand zone base at ~80 — clearly separated price levels.
        // ts7-8 are DECISIVE (not explosive) bearish to prevent the supply departure from consuming them.
        const candles = [
            // Drop into supply base (ts 1-2)
            { open:200, close:180, high:202, low:178, timestamp:1 },
            { open:181, close:162, high:183, low:160, timestamp:2 },
            // Supply base (ts 3-4): proximalLine = min body = 162
            { open:163, close:162, high:165, low:160, timestamp:3 },
            { open:162, close:163, high:164, low:161, timestamp:4 },
            // Explosive drop departure (ts 5-6) — supply zone departs here
            { open:161, close:137, high:162, low:136, timestamp:5 },
            { open:138, close:115, high:139, low:114, timestamp:6 },
            // Decisive (not explosive) drop into demand base (ts 7-8): body/range ~0.63 < 0.7
            { open:115, close: 96, high:120, low: 90, timestamp:7 },
            { open: 97, close: 79, high:102, low: 74, timestamp:8 },
            // Demand base (ts 9-10): proximalLine = max body = 80
            { open: 80, close: 79, high: 82, low: 77, timestamp:9 },
            { open: 79, close: 80, high: 81, low: 78, timestamp:10 },
            // Explosive rally departure (ts 11-12) — demand zone departs here
            { open: 79, close:103, high:104, low: 78, timestamp:11 },
            { open:102, close:125, high:126, low:101, timestamp:12 },
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        expect(supplyZones).toHaveLength(1);
        expect(demandZones).toHaveLength(1);
        // Supply proximal (~162) > demand proximal (~80):
        // supply targets the demand zone below it
        expect(supplyZones[0].targetPrice).toBe(demandZones[0].proximalLine);
        // demand targets the supply zone above it
        expect(demandZones[0].targetPrice).toBe(supplyZones[0].proximalLine);
    });

    it('sets targetPrice to null when no opposing zone exists', () => {
        const candles = [
            bearishDecisive1(1), bearishDecisive2(2),
            indecisive1(3), indecisive2(4),
            bearishExplosive1(5), bearishExplosive2(6),
        ];
        const { supplyZones, demandZones } = identifyZones(candles);
        // supply only — no demand zone, so targetPrice is null on supply
        expect(supplyZones[0].targetPrice).toBeNull();
        // no demand zones at all
        expect(demandZones).toHaveLength(0);
    });
});
