import { bearishDecisiveCandle, bullishDecisiveCandle } from "../data";
import { isBullishCandle } from "../lib";

describe("isBullishCandle", () => {
  it("should return true for a bullish candle", () => {
    expect(isBullishCandle(bullishDecisiveCandle)).toBe(true);
  });

  it("should return false for a bearish candle", () => {
    expect(isBullishCandle(bearishDecisiveCandle)).toBe(false);
  });
});