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
 * Per spec: a base can consist of as few as 1 narrow-range candle.
 */
export const MIN_BASE_CANDLES = 1;

/**
 * The maximum number of base candles allowed for a zone.
 * Per spec: more than 6 base candles indicates the imbalance is too
 * dispersed and the zone should be ignored.
 */
export const MAX_BASE_CANDLES = 6;

/**
 * The minimum number of candles required to define a zone.
 * This constant is used to ensure that a zone is formed with sufficient data points.
 */
export const MIN_ZONE_CANDLES = Math.max(MIN_DROP_CANDLES, MIN_RALLY_CANDLES)*2 + MIN_BASE_CANDLES;

/**
 * The default period used for ATR (Average True Range) calculation.
 * ATR(14) is Wilder's industry-standard, timeframe-agnostic volatility measure.
 */
export const DEFAULT_ATR_PERIOD = 14;

/**
 * The default lookback period for Relative Volume (RVOL) calculation.
 * RVOL = current bar's volume / mean volume of the prior N bars.
 */
export const DEFAULT_RVOL_PERIOD = 20;



/**
 * The maximum allowed base height expressed as a multiple of ATR.
 * A base whose high-to-low range exceeds this multiple is rejected as too wide.
 */
export const MAX_ZONE_ATR_MULTIPLIER = 1.5;

/**
 * The maximum allowed gap between consecutive candles *within* the base, expressed as
 * a multiple of ATR. A gap larger than this between base candles indicates a price
 * discontinuity that invalidates the base. The gap from the preceding explosive candle
 * into the first base candle is intentionally not checked here.
 */
export const MAX_BASE_GAP_ATR_MULTIPLIER = 0.5;

/**
 * The minimum range of the leg-out (ERC) candle expressed as a multiple of ATR.
 * Per spec §2.1: the leg-out range must be >= 1.5× ATR to confirm it is significantly
 * larger than surrounding price action, indicating institutional activity.
 */
export const MIN_EXPLOSIVE_ATR_MULTIPLIER = 1.5;
