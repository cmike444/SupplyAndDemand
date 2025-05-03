import { isDecisiveCandle } from "../lib";
import { explosiveCandle, bullishDecisiveCandle, bearishIndecisiveCandle, zeroRangeCandle, negativeCandle, equalOpenCloseCandle, bearishDecisiveCandle } from '../data';

describe("isDecisiveCandle", () => {

	it("should return true for a decisive bullish candle with significant difference", () => {
		expect(isDecisiveCandle(bullishDecisiveCandle)).toBe(true);
	});

	it("should return true for a decisive bearish candle with significant difference", () => {
		expect(isDecisiveCandle(bearishDecisiveCandle)).toBe(true);
	});

	it("should return true for an explosive bullish candle with significant difference", () => {
		expect(isDecisiveCandle(explosiveCandle)).toBe(true);
	});

	it("should return false for a candle with small difference between open and close", () => {
		expect(isDecisiveCandle(bearishIndecisiveCandle)).toBe(false);
	});

	it("should return false for a candle with equal open and close", () => {
		expect(isDecisiveCandle(equalOpenCloseCandle)).toBe(false);
	});

	it("should return false for a candle with zero range", () => {
		expect(isDecisiveCandle(zeroRangeCandle)).toBe(false);
	});

	it("should handle candles with negative body-to-range ratio gracefully", () => {
		expect(isDecisiveCandle(negativeCandle)).toBe(true);
	});

	it("should use the default threshold if none is provided", () => {
		expect(isDecisiveCandle(bullishDecisiveCandle)).toBe(true);
	});
});
