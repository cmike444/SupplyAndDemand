import { isValidBase } from '../lib';
import { Candle } from '../types';

const c = (open: number, close: number, high: number, low: number, ts: number): Candle =>
    ({ open, close, high, low, timestamp: ts });

// ATR of 10 used throughout
const ATR = 10;

// A tight 2-candle base (no gaps, height = 3) — always valid
const preceding = c(100, 100, 101, 99, 0);
const base1      = c(100, 101, 102, 99, 1);  // open == preceding.close → no gap
const base2      = c(101, 100, 103, 100, 2); // open ≈ base1.close → no gap

describe('isValidBase', () => {
    it('returns true when localATR is 0 (skip all checks)', () => {
        // Even a wildly gapped base should pass when ATR = 0
        const gappedBase = [c(200, 210, 215, 195, 1), c(210, 215, 220, 205, 2)];
        expect(isValidBase(gappedBase, preceding, 0)).toBe(true);
    });

    it('returns true for a clean base with no gaps and tight height', () => {
        expect(isValidBase([base1, base2], preceding, ATR)).toBe(true);
    });

    it('rejects when the first base candle gaps too far from the preceding candle close', () => {
        // preceding.close = 100; base open = 106 → gap = 6 > 0.5 × 10 = 5
        const gappedFirst = c(106, 107, 108, 105, 1);
        expect(isValidBase([gappedFirst, base2], preceding, ATR)).toBe(false);
    });

    it('rejects when two consecutive base candles have a gap between them', () => {
        // base1.close = 101; base2.open = 107 → gap = 6 > 5
        const gappedSecond = c(107, 108, 110, 106, 2);
        expect(isValidBase([base1, gappedSecond], preceding, ATR)).toBe(false);
    });

    it('accepts when a gap is exactly at the threshold (≤ 0.5 × ATR)', () => {
        // preceding.close = 100; base open = 105 → gap = 5 == 0.5 × 10 → allowed
        const edgeBase = c(105, 106, 107, 104, 1);
        expect(isValidBase([edgeBase, base2], preceding, ATR)).toBe(true);
    });

    it('rejects when base height exceeds 1.5 × ATR', () => {
        // maxHigh = 116, minLow = 99 → height = 17 > 1.5 × 10 = 15
        const tallBase1 = c(100, 102, 104, 99, 1);
        const tallBase2 = c(102, 104, 116, 101, 2);
        expect(isValidBase([tallBase1, tallBase2], preceding, ATR)).toBe(false);
    });

    it('accepts when base height is exactly at the threshold (= 1.5 × ATR)', () => {
        // maxHigh = 114, minLow = 99 → height = 15 == 1.5 × 10 → allowed
        const edgeHigh = c(100, 102, 114, 100, 1);
        const edgeLow  = c(102, 101, 103, 99, 2);
        expect(isValidBase([edgeHigh, edgeLow], preceding, ATR)).toBe(true);
    });

    it('rejects when both gap and height violations are present', () => {
        const gappedTall1 = c(110, 115, 120, 109, 1); // gap = 10 > 5
        const gappedTall2 = c(115, 120, 125, 90, 2);  // height across both = 35
        expect(isValidBase([gappedTall1, gappedTall2], preceding, ATR)).toBe(false);
    });
});
