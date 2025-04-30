import { isDecisiveCandle } from '../lib';
import { explosiveCandle, decisiveCandle, indecisiveCandle } from '../data';


test('returns true for a decisive bullish candle with significant difference', () => {
	expect(isDecisiveCandle(decisiveCandle)).toBe(true);
});

test('returns true for a decisive bearish candle with significant difference', () => {
	expect(isDecisiveCandle(decisiveCandle)).toBe(true);
});

test('returns true for a explosive bullish candle with significant difference', () => {
	expect(isDecisiveCandle(explosiveCandle)).toBe(true);
});

test('returns false for a candle with small difference between open and close', () => {
	expect(isDecisiveCandle(indecisiveCandle)).toBe(false);
});

test('returns false for a candle with equal open and close', () => {
	expect(isDecisiveCandle(indecisiveCandle)).toBe(false);
});
