import { DEFAULT_EXPLOSIVE_THRESHOLD } from "../constants";
import { isExplosiveCandle } from "../lib";
import { explosiveCandle, zeroRangeCandle, indecisiveCandle } from '../data';
import { Candle } from "../types";

describe("isExplosiveCandle", () => {

    it("should return true for a candle with body-to-range ratio exceeding the threshold", () => {
        expect(isExplosiveCandle(explosiveCandle, DEFAULT_EXPLOSIVE_THRESHOLD)).toBe(true);
    });

    it("should return false for a candle with body-to-range ratio below the threshold", () => {
        expect(isExplosiveCandle(indecisiveCandle, DEFAULT_EXPLOSIVE_THRESHOLD)).toBe(false);
    });

    it("should use the default threshold if none is provided", () => {
        expect(isExplosiveCandle(explosiveCandle)).toBe(true);
    });

    it("should return false for a candle with zero range", () => {
        expect(isExplosiveCandle(zeroRangeCandle, DEFAULT_EXPLOSIVE_THRESHOLD)).toBe(false);
    });

    it("should handle candles with negative body-to-range ratio gracefully", () => {
        const candle: Candle = {
            open: 150,
            close: 100,
            high: 160,
            low: 90,
            timestamp: ""
        };
        expect(isExplosiveCandle(candle, DEFAULT_EXPLOSIVE_THRESHOLD)).toBe(true);
    });
});
