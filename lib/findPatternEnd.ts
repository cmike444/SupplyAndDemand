import { Candle } from "../types";

/**
 * Finds the index of the first candle that does not satisfy the given condition,
 * starting from a specified index and optionally limiting the number of candles to check.
 *
 * @param candles - An array of `Candle` objects to search through.
 * @param startIndex - The index to start searching from.
 * @param condition - A callback function that takes a `Candle` and returns a boolean
 * indicating whether the candle satisfies the condition.
 * @param maxCount - (Optional) The maximum number of candles to check. If not provided,
 * the function will continue until the condition is not met or the end of the array is reached.
 * @returns The index of the first candle that does not satisfy the condition, or the end of the array
 * if all checked candles satisfy the condition.
 */
export const findPatternEnd = (
    candles: Candle[],
    startIndex: number,
    condition: (candle: Candle) => boolean,
    maxCount?: number
): number => {
    let count = 0;
    while (
        startIndex < candles.length &&
        condition(candles[startIndex]) &&
        (maxCount === undefined || count < maxCount)
    ) {
        startIndex++;
        count++;
    }
    return startIndex;
};
