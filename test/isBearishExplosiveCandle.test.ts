import { isBearishExplosiveCandle } from '../lib';
import { explosiveCandle, bearishDecisiveCandle, bearishIndecisiveCandle } from '../data';
import { Candle } from '../types';

describe('isBearishExplosiveCandle', () => {
    it('returns false for a bullish explosive candle', () => {
        // explosiveCandle: open=154, close=164.5 → bullish, not bearish
        expect(isBearishExplosiveCandle(explosiveCandle)).toBe(false);
    });

    it('returns false for a bearish decisive candle that is not explosive', () => {
        // bearishDecisiveCandle: open=148.5, close=130, high=155, low=128
        // body=18.5, range=27, ratio≈0.685 < 0.7 → NOT explosive
        expect(isBearishExplosiveCandle(bearishDecisiveCandle)).toBe(false);
    });

    it('returns false for an indecisive candle', () => {
        expect(isBearishExplosiveCandle(bearishIndecisiveCandle)).toBe(false);
    });

    it('returns true for a bearish explosive candle', () => {
        // body=9, range=11, ratio≈0.818 > 0.7, bearish ✓
        const candle: Candle = { open: 109, close: 100, high: 110, low: 99, timestamp: 1 };
        expect(isBearishExplosiveCandle(candle)).toBe(true);
    });

    it('returns false for a candle with zero range', () => {
        const candle: Candle = { open: 100, close: 100, high: 100, low: 100, timestamp: 1 };
        expect(isBearishExplosiveCandle(candle)).toBe(false);
    });
});
