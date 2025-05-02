import { candleBody } from "../lib";
import { decisiveCandle, negativeCandle, zeroRangeCandle } from "../data";

describe("candleBody", () => {
  it("should calculate the absolute difference between close and open prices", () => {
    expect(candleBody(decisiveCandle)).toBe(5.5);
  });

  it("should return a positive value even if close is less than open", () => {
    expect(candleBody(negativeCandle)).toBe(50);
  });

  it("should return 0 if open and close prices are the same", () => {
    expect(candleBody(zeroRangeCandle)).toBe(0);
  });
});
