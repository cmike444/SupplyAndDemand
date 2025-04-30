import { DEFAULT_DECISIVE_THRESHOLD } from "../constants";
import { isIndecisiveCandle } from "../lib";
import { indecisiveCandle, explosiveCandle, zeroRangeCandle, negativeCandle } from '../data';

describe("isIndecisiveCandle", () => {

    it("should return true for a candle with body-to-range ratio below the threshold", () => {
        expect(isIndecisiveCandle(indecisiveCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(true);
    });

    it("should return false for a candle with body-to-range ratio exceeding the threshold", () => {
        expect(isIndecisiveCandle(explosiveCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(false);
    });

    it("should use the default threshold if none is provided", () => {
        expect(isIndecisiveCandle(indecisiveCandle)).toBe(true);
    });

    it("should return false for a candle with zero range", () => {
        expect(isIndecisiveCandle(zeroRangeCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(false);
    });

    it("should handle candles with negative body-to-range ratio gracefully", () => {
        expect(isIndecisiveCandle(negativeCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(false);
    });
});
