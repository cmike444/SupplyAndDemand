import { rvol } from '../lib';
import { Candle } from '../types';

const c = (volume: number): Candle =>
    ({ open: 100, close: 101, high: 102, low: 99, timestamp: volume, volume });

describe('rvol', () => {
    it('returns an empty array for an empty input', () => {
        expect(rvol([])).toEqual([]);
    });

    it('returns [1] for a single candle (no prior context)', () => {
        expect(rvol([c(500)])).toEqual([1]);
    });

    it('first candle is always 1.0 regardless of its volume', () => {
        const result = rvol([c(9999), c(100), c(200)]);
        expect(result[0]).toBe(1);
    });

    it('second candle = vol[1] / vol[0] (one prior candle)', () => {
        const candles = [c(200), c(400)];
        const result = rvol(candles);
        expect(result[1]).toBeCloseTo(2.0);
    });

    it('returns 1.0 when current volume equals the prior average', () => {
        const candles = [c(100), c(100), c(100)];
        const result = rvol(candles);
        expect(result[2]).toBeCloseTo(1.0);
    });

    it('correctly averages over exactly `period` prior candles', () => {
        // 21 candles: first 20 all have volume 100, last has volume 300
        // period=20 → avg of prior 20 = 100; RVOL of last = 3.0
        const candles: Candle[] = Array.from({ length: 20 }, (_, i) => c(100));
        candles.push(c(300));
        const result = rvol(candles, 20);
        expect(result[20]).toBeCloseTo(3.0);
    });

    it('uses only the last `period` prior candles when more are available', () => {
        // 22 candles: first candle vol=9999 (outside window), next 20 vol=100, last vol=200
        // period=20 → avg of prior 20 = 100; RVOL of last = 2.0 (first candle excluded)
        const candles: Candle[] = [c(9999)];
        for (let i = 0; i < 20; i++) candles.push(c(100));
        candles.push(c(200));
        const result = rvol(candles, 20);
        expect(result[21]).toBeCloseTo(2.0);
    });

    it('falls back to all available prior candles when fewer than period exist', () => {
        // 3 candles with period=20: index 2 averages over indices 0 and 1 only
        const candles = [c(100), c(200), c(300)];
        // avg(100, 200) = 150; RVOL = 300 / 150 = 2.0
        const result = rvol(candles, 20);
        expect(result[2]).toBeCloseTo(2.0);
    });

    it('returns array same length as input', () => {
        const candles = Array.from({ length: 50 }, (_, i) => c((i + 1) * 100));
        const result = rvol(candles, 14);
        expect(result).toHaveLength(50);
    });

    it('returns 1.0 when the prior average volume is 0 (guard against division by zero)', () => {
        const candles = [c(0), c(0), c(500)];
        const result = rvol(candles);
        expect(result[2]).toBe(1);
    });
});
