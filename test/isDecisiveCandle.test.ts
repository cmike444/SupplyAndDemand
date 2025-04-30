import { DEFAULT_DECISIVE_THRESHOLD } from "../constants";
import { isDecisiveCandle } from "../lib";
import { explosiveCandle, decisiveCandle, indecisiveCandle, zeroRangeCandle, negativeCandle, equalOpenCloseCandle } from '../data';

describe("isDecisiveCandle", () => {

	it("should return true for a decisive bullish candle with significant difference", () => {
		expect(isDecisiveCandle(decisiveCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(true);
	});

	it("should return true for a decisive bearish candle with significant difference", () => {
		expect(isDecisiveCandle(decisiveCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(true);
	});

	it("should return true for an explosive bullish candle with significant difference", () => {
		expect(isDecisiveCandle(explosiveCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(true);
	});

	it("should return false for a candle with small difference between open and close", () => {
		expect(isDecisiveCandle(indecisiveCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(false);
	});

	it("should return false for a candle with equal open and close", () => {
		expect(isDecisiveCandle(equalOpenCloseCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(false);
	});

	it("should return false for a candle with zero range", () => {
		expect(isDecisiveCandle(zeroRangeCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(false);
	});

	it("should handle candles with negative body-to-range ratio gracefully", () => {
		expect(isDecisiveCandle(negativeCandle, DEFAULT_DECISIVE_THRESHOLD)).toBe(true);
	});

	it("should use the default threshold if none is provided", () => {
		expect(isDecisiveCandle(decisiveCandle)).toBe(true);
	});
});
