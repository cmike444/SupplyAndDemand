import { findPatternEnd } from '../lib';
import { Candle } from '../types';

const c = (ts: number): Candle => ({ open: 100, close: 101, high: 105, low: 99, timestamp: ts });

describe('findPatternEnd', () => {
    it('returns startIndex immediately when condition fails on first candle', () => {
        const candles = [c(1), c(2), c(3)];
        expect(findPatternEnd(candles, 0, () => false)).toBe(0);
    });

    it('advances through all candles when condition always passes', () => {
        const candles = [c(1), c(2), c(3)];
        expect(findPatternEnd(candles, 0, () => true)).toBe(3);
    });

    it('stops at the first candle that does not satisfy the condition', () => {
        const candles = [c(1), c(2), c(3), c(4)];
        expect(findPatternEnd(candles, 0, (candle) => candle.timestamp < 3)).toBe(2);
    });

    it('respects maxCount and stops after the specified number of matching candles', () => {
        const candles = [c(1), c(2), c(3), c(4)];
        expect(findPatternEnd(candles, 0, () => true, 2)).toBe(2);
    });

    it('starts advancing from startIndex, not from 0', () => {
        const candles = [c(1), c(2), c(3), c(4)];
        expect(findPatternEnd(candles, 2, () => true)).toBe(4);
    });

    it('returns the array length when all remaining candles satisfy the condition', () => {
        const candles = [c(1), c(2)];
        expect(findPatternEnd(candles, 0, () => true)).toBe(2);
    });

    it('returns startIndex when startIndex equals array length', () => {
        const candles = [c(1), c(2)];
        expect(findPatternEnd(candles, 2, () => true)).toBe(2);
    });
});
