"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIN_ZONE_CANDLES = exports.MAX_BASE_CANDLES = exports.MIN_BASE_CANDLES = exports.MIN_DROP_CANDLES = exports.MIN_RALLY_CANDLES = exports.DEFAULT_DECISIVE_THRESHOLD = exports.DEFAULT_EXPLOSIVE_THRESHOLD = void 0;
/**
 * The default threshold used to determine if a candle is considered "explosive."
 * A candle is classified as explosive if its body constitutes at least 70% of its range.
 */
exports.DEFAULT_EXPLOSIVE_THRESHOLD = 0.7;
/**
 * The default threshold used to determine if a candle is considered "indecisive."
 * A candle is classified as indecisive if its body constitutes at most 50% of its range.
 */
exports.DEFAULT_DECISIVE_THRESHOLD = 0.5;
/**
 * The minimum number of consecutive bullish candles required to define a rally.
 * This constant is used to determine the threshold for identifying a rally pattern
 * in a series of candlestick data.
 */
exports.MIN_RALLY_CANDLES = 2;
/**
 * The minimum number of candles required to consider a drop in value.
 * This constant is used to define the threshold for identifying a drop
 * in a series of candlestick data.
 */
exports.MIN_DROP_CANDLES = 2;
/**
 * The minimum number of base candles required for a zone.
 * This constant ensures that at least one base candle is always present.
 */
exports.MIN_BASE_CANDLES = 2;
/**
 * The maximum number of base candles required for a zone.
 * This constant is used to limit the number of candles that can be
 * processed or displayed at a time.
 */
exports.MAX_BASE_CANDLES = 8;
/**
 * The minimum number of candles required to define a zone.
 * This constant is used to ensure that a zone is formed with sufficient data points.
 */
exports.MIN_ZONE_CANDLES = Math.max(exports.MIN_DROP_CANDLES, exports.MIN_RALLY_CANDLES) * 2 + exports.MIN_BASE_CANDLES;
