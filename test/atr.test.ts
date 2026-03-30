import { atr } from '../lib';
import { Candle } from '../types';

const c = (open: number, close: number, high: number, low: number, ts: number): Candle =>
    ({ open, close, high, low, timestamp: ts });

describe('atr', () => {
    it('returns 0 for an empty array', () => {
        expect(atr([])).toBe(0);
    });

    it('returns high − low for a single candle', () => {
        const candle = c(100, 105, 110, 95, 1);
        expect(atr([candle])).toBe(15); // 110 - 95
    });

    it('computes TR using only high − low when no gap from prior close', () => {
        // prev.close = 100, curr.open = 100
        // TR = max(110-95, |110-100|, |95-100|) = max(15, 10, 5) = 15
        const candles = [
            c(98, 100, 102, 97, 1),
            c(100, 108, 110, 95, 2),
        ];
        expect(atr(candles)).toBeCloseTo(15); // one TR value of 15
    });

    it('uses |high − prev.close| when the gap is larger than the bar range', () => {
        // prev.close = 90, curr.high = 110, curr.low = 108
        // TR = max(110-108, |110-90|, |108-90|) = max(2, 20, 18) = 20
        const candles = [
            c(88, 90, 92, 87, 1),
            c(108, 109, 110, 108, 2),
        ];
        expect(atr(candles)).toBeCloseTo(20);
    });

    it('uses |low − prev.close| when the gap down is larger than the bar range', () => {
        // prev.close = 110, curr.high = 92, curr.low = 88
        // TR = max(92-88, |92-110|, |88-110|) = max(4, 18, 22) = 22
        const candles = [
            c(112, 110, 114, 109, 1),
            c(90, 89, 92, 88, 2),
        ];
        expect(atr(candles)).toBeCloseTo(22);
    });

    it('averages TR values across multiple candles', () => {
        // TR values: 10, 20  → mean = 15
        const candles = [
            c(100, 100, 105, 95, 1),   // seed (no TR)
            c(100, 100, 106, 96, 2),   // TR = max(10, 6, 4) = 10
            c(100, 100, 112, 102, 3),  // TR = max(10, 12, 0) = 12... let me recalculate
        ];
        // candle[1]: prev.close=100, H=106, L=96 → TR = max(10, 6, 4) = 10
        // candle[2]: prev.close=100, H=112, L=102 → TR = max(10, 12, 2) = 12
        // mean = (10 + 12) / 2 = 11
        expect(atr(candles)).toBeCloseTo(11);
    });

    it('uses only the last `period` TR values when more are available', () => {
        // Build 5 candles whose TRs are 10, 20, 30, 40, then ask for period=2
        // We want the mean of the last 2 TRs (30 and 40), which is 35
        const candles: Candle[] = [
            c(100, 100, 105, 95, 1),  // seed
            c(100, 100, 106, 96, 2),  // TR = 10
            c(100, 100, 112, 92, 3),  // TR = 20
            c(100, 100, 118, 88, 4),  // TR = 30
            c(100, 100, 124, 84, 5),  // TR = 40
        ];
        expect(atr(candles, 2)).toBeCloseTo(35);
    });

    it('uses all available TRs when fewer than period candles are supplied', () => {
        // 2 candles → 1 TR value of 10; period=14 → mean = 10
        const candles = [
            c(100, 100, 105, 95, 1),
            c(100, 100, 106, 96, 2), // TR = 10
        ];
        expect(atr(candles, 14)).toBeCloseTo(10);
    });
});
