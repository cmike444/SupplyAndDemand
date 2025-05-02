/**
 * The default threshold used to determine if a candle is considered "explosive."
 * A candle is classified as explosive if its body constitutes at least 70% of its range.
 */
export const DEFAULT_EXPLOSIVE_THRESHOLD = 0.7;

/**
 * The default threshold used to determine if a candle is considered "indecisive."
 * A candle is classified as indecisive if its body constitutes at most 50% of its range.
 */
export const DEFAULT_DECISIVE_THRESHOLD = 0.5;

/**
 * The minimum number of consecutive bullish candles required to define a rally.
 * This constant is used to determine the threshold for identifying a rally pattern
 * in a series of candlestick data.
 */
export const MIN_RALLY_CANDLES = 2;

/**
 * The minimum number of candles required to consider a drop in value.
 * This constant is used to define the threshold for identifying a drop
 * in a series of candlestick data.
 */
export const MIN_DROP_CANDLES = 2;

/**
 * The minimum number of base candles required for a zone.
 * This constant ensures that at least one base candle is always present.
 */
export const MIN_BASE_CANDLES = 2;

/**
 * The maximum number of base candles required for a zone.
 * This constant is used to limit the number of candles that can be
 * processed or displayed at a time.
 */
export const MAX_BASE_CANDLES = 8;

/**
 * The minimum number of candles required to define a zone.
 * This constant is used to ensure that a zone is formed with sufficient data points.
 */
export const MIN_ZONE_CANDLES = Math.max(MIN_DROP_CANDLES, MIN_RALLY_CANDLES)*2 + MIN_BASE_CANDLES;
