import { isExplosiveCandle } from "../lib";
import { explosiveCandle, zeroRangeCandle, bearishIndecisiveCandle, negativeCandle } from '../data';

describe("isExplosiveCandle", () => {

    it("should return true for a candle with body-to-range ratio exceeding the threshold", () => {
        expect(isExplosiveCandle(explosiveCandle)).toBe(true);
    });

    it("should return false for a candle with body-to-range ratio below the threshold", () => {
        expect(isExplosiveCandle(bearishIndecisiveCandle)).toBe(false);
    });

    it("should use the default threshold if none is provided", () => {
        expect(isExplosiveCandle(explosiveCandle)).toBe(true);
    });

    it("should return false for a candle with zero range", () => {
        expect(isExplosiveCandle(zeroRangeCandle)).toBe(false);
    });

    it("should handle candles with negative body-to-range ratio gracefully", () => {
        expect(isExplosiveCandle(negativeCandle)).toBe(true);
    });
});
