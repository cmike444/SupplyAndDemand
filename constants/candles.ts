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
