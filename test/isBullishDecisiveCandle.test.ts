import { bullishDecisiveCandle, bullishIndecisiveCandle } from "../data";
import { isBullishDecisiveCandle } from "../lib";

describe("isBullishDecisiveCandle", () => {
  it("should return true for a bullish decisive candle", () => {
    expect(isBullishDecisiveCandle(bullishDecisiveCandle)).toBe(true);
  });

  it("should return false for a non-decisive bullish candle", () => {
    expect(isBullishDecisiveCandle(bullishIndecisiveCandle)).toBe(false);
  });
});
