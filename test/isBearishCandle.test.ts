import { isBearishCandle } from "../lib/isBearishCandle";
import { Candle } from "../types";

describe("isBearishCandle", () => {
  it("should return true for a bearish candle", () => {
    const candle: Candle = { open: 110, close: 100, high: 115, low: 95, timestamp: 1 };
    expect(isBearishCandle(candle)).toBe(true);
  });

  it("should return false for a bullish candle", () => {
    const candle: Candle = { open: 100, close: 110, high: 115, low: 95, timestamp: 1 };
    expect(isBearishCandle(candle)).toBe(false);
  });
});