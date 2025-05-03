import { candleRange } from "../lib/candleRange";
import { bullishDecisiveCandle, negativeCandle, zeroRangeCandle } from "../data";

describe("candleRange", () => {
  it("should calculate the difference between high and low prices", () => {
    expect(candleRange(bullishDecisiveCandle)).toBe(7);
  });

  it("should return 0 if high and low prices are the same", () => {
    expect(candleRange(negativeCandle)).toBe(70);
  });

  it("should handle negative values correctly", () => {
    expect(candleRange(zeroRangeCandle)).toBe(0);
  });
});
