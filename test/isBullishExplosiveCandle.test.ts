import { isBullishExplosiveCandle } from '../lib';
import { explosiveCandle, bearishDecisiveCandle, bearishIndecisiveCandle } from '../data';
import { Candle } from '../types';

describe('isBullishExplosiveCandle', () => {
    it('returns true for a bullish explosive candle', () => {
        // explosiveCandle: open=154, close=164.5, high=165, low=153.5
        // body=10.5, range=11.5, ratio≈0.913 > 0.7 and bullish ✓
        expect(isBullishExplosiveCandle(explosiveCandle)).toBe(true);
    });

    it('returns false for a bearish decisive candle', () => {
        // bearishDecisiveCandle is bearish, not bullish
        expect(isBullishExplosiveCandle(bearishDecisiveCandle)).toBe(false);
    });

    it('returns false for an indecisive candle', () => {
        expect(isBullishExplosiveCandle(bearishIndecisiveCandle)).toBe(false);
    });

    it('returns false for a candle with zero range', () => {
        const candle: Candle = { open: 100, close: 100, high: 100, low: 100, timestamp: 1 };
        expect(isBullishExplosiveCandle(candle)).toBe(false);
    });

    it('returns false for a bullish candle that is decisive but not explosive', () => {
        // body=6, range=11, ratio≈0.545 → decisive but NOT explosive (≤0.7)
        const candle: Candle = { open: 100, close: 106, high: 110, low: 99, timestamp: 1 };
        expect(isBullishExplosiveCandle(candle)).toBe(false);
    });
});
