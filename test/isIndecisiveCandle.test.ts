import { isIndecisiveCandle } from "../lib";
import { bearishIndecisiveCandle, explosiveCandle, zeroRangeCandle, negativeCandle } from '../data';

describe("isIndecisiveCandle", () => {

    it("should return true for a candle with body-to-range ratio below the threshold", () => {
        expect(isIndecisiveCandle(bearishIndecisiveCandle)).toBe(true);
    });

    it("should return false for a candle with body-to-range ratio exceeding the threshold", () => {
        expect(isIndecisiveCandle(explosiveCandle)).toBe(false);
    });

    it("should use the default threshold if none is provided", () => {
        expect(isIndecisiveCandle(bearishIndecisiveCandle)).toBe(true);
    });

    it("should return false for a candle with zero range", () => {
        expect(isIndecisiveCandle(zeroRangeCandle)).toBe(true);
    });

    it("should handle candles with negative body-to-range ratio gracefully", () => {
        expect(isIndecisiveCandle(negativeCandle)).toBe(false);
    });
});
