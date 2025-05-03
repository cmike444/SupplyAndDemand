import { bearishDecisiveCandle, bearishIndecisiveCandle } from "../data";
import { isBearishDecisiveCandle } from "../lib/isBearishDecisiveCandle";

describe("isBearishDecisiveCandle", () => {
  it("should return true for a bearish decisive candle", () => {
    expect(isBearishDecisiveCandle(bearishDecisiveCandle)).toBe(true);
  });

  it("should return false for a non-decisive bearish candle", () => {
    expect(isBearishDecisiveCandle(bearishIndecisiveCandle)).toBe(false);
  });
});
