import { calculateConfidence } from '../lib';
import { Candle } from '../types';

// Helpers — produce candles with explicit characteristics
const c = (open: number, close: number, high: number, low: number, ts: number, volume?: number): Candle =>
    ({ open, close, high, low, timestamp: ts, ...(volume !== undefined ? { volume } : {}) });

// body=18, range=26, ratio≈0.692 → decisive AND explosive bullish (close > open)
const bullishStrong = (ts: number, volume?: number): Candle => c(100, 118, 120, 94, ts, volume);
// body=18, range=26, ratio≈0.692 → decisive AND explosive bearish (close < open)
const bearishStrong = (ts: number, volume?: number): Candle => c(118, 100, 120, 94, ts, volume);
// body=1, range=10, ratio=0.1 → indecisive (neither decisive nor explosive)
const weak = (ts: number, volume?: number): Candle => c(100, 101, 105, 95, ts, volume);

const ATR = 20;

describe('calculateConfidence', () => {

    // --- Edge cases ---

    it('returns 0 when departureCandles is empty', () => {
        expect(calculateConfidence([], [weak(1)], ATR, true)).toBe(0);
    });

    it('returns a value in [0, 1] for any valid input (bullish)', () => {
        const result = calculateConfidence([bullishStrong(1), bullishStrong(2)], [weak(3)], ATR, true);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });

    it('returns a value in [0, 1] for any valid input (bearish)', () => {
        const result = calculateConfidence([bearishStrong(1), bearishStrong(2)], [weak(3)], ATR, false);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
    });

    // --- Count factor ---

    it('countFactor is 1 when all departure candles are strong in the expected direction', () => {
        // All bullish strong → countFactor = 1
        // No volume → volumeFactor = 0.5
        // avgRange=26, ATR=20 → rangeFactor = min(26/20, 1) = 1
        // base has 1 candle → timeFactor = 1.0
        // score = (1 + 1 + 0.5 + 1) / 4 = 0.875
        const result = calculateConfidence(
            [bullishStrong(1), bullishStrong(2)],
            [weak(3)],
            ATR,
            true,
        );
        expect(result).toBeCloseTo((1 + 1 + 0.5 + 1) / 4);
    });

    it('countFactor is 0 when no departure candle is strong in the expected direction', () => {
        // weak candles used as departure — body ratio 0.1, not decisive or explosive
        // countFactor = 0, volumeFactor = 0.5 (no volume), rangeFactor = min(10/20,1) = 0.5
        // base has 1 candle → timeFactor = 1.0
        // score = (0 + 0.5 + 0.5 + 1) / 4 = 0.5
        const result = calculateConfidence(
            [weak(1), weak(2)],
            [weak(3)],
            ATR,
            true,
        );
        expect(result).toBeCloseTo((0 + 0.5 + 0.5 + 1) / 4);
    });

    it('does not count bearish strong candles toward bullish countFactor', () => {
        // bearishStrong candles used in upward departure → they should NOT count as strong
        // base has 1 candle → timeFactor = 1.0
        const result = calculateConfidence([bearishStrong(1)], [weak(2)], ATR, true);
        // countFactor = 0
        expect(result).toBeCloseTo((0 + Math.min(26 / ATR, 1) + 0.5 + 1) / 4);
    });

    it('does not count bullish strong candles toward bearish countFactor', () => {
        // base has 1 candle → timeFactor = 1.0
        const result = calculateConfidence([bullishStrong(1)], [weak(2)], ATR, false);
        expect(result).toBeCloseTo((0 + Math.min(26 / ATR, 1) + 0.5 + 1) / 4);
    });

    // --- Range factor ---

    it('rangeFactor falls back to 0.5 when localATR is 0', () => {
        // countFactor = 1 (all strong bullish), volumeFactor = 0.5 (no volume)
        // rangeFactor = 0.5 (fallback)
        // base has 1 candle → timeFactor = 1.0
        const result = calculateConfidence([bullishStrong(1)], [weak(2)], 0, true);
        expect(result).toBeCloseTo((1 + 0.5 + 0.5 + 1) / 4);
    });

    it('rangeFactor is clamped to 1 when avg range greatly exceeds ATR', () => {
        // range=26, ATR=5 → 26/5 = 5.2, clamped to 1
        // base has 1 candle → timeFactor = 1.0
        const result = calculateConfidence([bullishStrong(1)], [weak(2)], 5, true);
        // countFactor=1, rangeFactor=1, volumeFactor=0.5, timeFactor=1
        expect(result).toBeCloseTo((1 + 1 + 0.5 + 1) / 4);
    });

    it('rangeFactor is proportional when avg range is less than ATR', () => {
        // weak candle range=10, ATR=40 → rangeFactor = 10/40 = 0.25
        // base has 1 candle → timeFactor = 1.0
        const result = calculateConfidence([weak(1)], [weak(2)], 40, true);
        // countFactor=0, rangeFactor=0.25, volumeFactor=0.5, timeFactor=1
        expect(result).toBeCloseTo((0 + 0.25 + 0.5 + 1) / 4);
    });

    // --- Volume factor ---

    it('volumeFactor falls back to 0.5 when no candle has volume', () => {
        const result = calculateConfidence([bullishStrong(1)], [weak(2)], ATR, true);
        // volumeFactor must be exactly 0.5; base has 1 candle → timeFactor = 1.0
        const countFactor = 1;
        const rangeFactor = Math.min(26 / ATR, 1);
        expect(result).toBeCloseTo((countFactor + rangeFactor + 0.5 + 1) / 4);
    });

    it('volumeFactor is 0.5 when departure volume equals base volume', () => {
        // ratio = 1 → 1/(1+1) = 0.5
        // base has 1 candle → timeFactor = 1.0
        const departure = [bullishStrong(1, 100)];
        const base = [weak(2, 100)];
        const result = calculateConfidence(departure, base, ATR, true);
        const countFactor = 1;
        const rangeFactor = Math.min(26 / ATR, 1);
        const volumeFactor = 1 / 2; // 0.5
        expect(result).toBeCloseTo((countFactor + rangeFactor + volumeFactor + 1) / 4);
    });

    it('volumeFactor increases as departure volume increases beyond base volume', () => {
        const base = [weak(3, 100)];
        const low = calculateConfidence([bullishStrong(1, 100)], base, ATR, true);
        const high = calculateConfidence([bullishStrong(1, 500)], base, ATR, true);
        expect(high).toBeGreaterThan(low);
    });

    it('volumeFactor never reaches 1.0 regardless of how large departure volume is', () => {
        const departure = [bullishStrong(1, 1_000_000)];
        const base = [weak(2, 1)];
        const result = calculateConfidence(departure, base, ATR, true);
        expect(result).toBeLessThan(1);
    });

    it('volumeFactor falls back to 0.5 when base has no volume data', () => {
        // departure has volume but base does not — base avg = 0 → use fallback 0.5
        // base has 1 candle → timeFactor = 1.0
        const departure = [bullishStrong(1, 200)];
        const base = [weak(2)]; // no volume
        const result = calculateConfidence(departure, base, ATR, true);
        const countFactor = 1;
        const rangeFactor = Math.min(26 / ATR, 1);
        expect(result).toBeCloseTo((countFactor + rangeFactor + 0.5 + 1) / 4);
    });
});
