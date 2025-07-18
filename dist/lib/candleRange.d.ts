import { Candle } from "../types";
/**
 * Calculates the range of a candle by subtracting its low value from its high value.
 *
 * @param candle - An object representing a candle with `high` and `low` properties.
 * @returns The numerical range of the candle.
 */
export declare function candleRange(candle: Candle): number;
