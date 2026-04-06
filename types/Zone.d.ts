/**
 * Represents a Zone with specific boundaries and time range.
 *
 * @interface Zone
 * @property {number} proximalLine - The proximal boundary line of the zone (near current price).
 * @property {number} distalLine - The distal boundary line of the zone (far edge).
 * @property {number} confidence - Confidence score in [0, 1]. The average of seven equally-weighted
 *   factors: (1) proportion of strong departure candles, (2) departure range vs ATR,
 *   (3) departure vs base volume ratio, (4) price position — higher for supply zones at
 *   elevated prices and demand zones at depressed prices, (5) freshness — 1.0 if price has
 *   never entered the zone, 0.5 if price entered but was repelled before breaching the distal
 *   line, (6) timeframe — log-normalised candle interval from 1m (0.0) to 1w (1.0),
 *   (7) rrScore — departure-based risk/reward score normalised to [0, 1].
 * @property {number} rrScore - Standalone risk/reward score in [0, 1]. Computed from the
 *   zone's own departure leg: `Math.min(departureExtent / stopDistance / 5, 1)` where
 *   `stopDistance` is the zone width (|proximalLine − distalLine|) and `departureExtent` is
 *   the distance price actually travelled during the departure (min low for supply, max high
 *   for demand). A score of 1.0 represents a ≥ 5:1 R:R. Always computable — no opposing
 *   zone required. Access this directly to filter or grade setups before entry.
 *   Always set on any zone returned by `identifyZones`. Optional here only so pattern
 *   functions (rallyBaseDrop etc.) are not required to set it.
 * @property {number} entryPrice - Limit order entry price. Equal to `proximalLine`.
 * @property {number} stopPrice - Hard stop price. Equal to `distalLine`. A close beyond
 *   this level invalidates the zone thesis.
 * @property {number | null} targetPrice - Target exit price. The proximal line of the nearest
 *   opposing zone (supply proximalLine for demand zones; demand proximalLine for supply zones).
 *   `null` when no opposing zone exists in the dataset.
 * @property {number} startTimestamp - The starting timestamp of the zone (Unix ms).
 * @property {number} endTimestamp - The ending timestamp of the zone (Unix ms).
 */
export interface Zone {
    proximalLine: number;
    distalLine: number;
    startTimestamp: number;
    endTimestamp: number;
    confidence: number;
    /** Always set by identifyZones(); optional here only so pattern functions need not set it. */
    rrScore?: number;
    /**
     * Limit order entry price for this zone. Equal to `proximalLine`.
     * Always set by `identifyZones`.
     */
    entryPrice?: number;
    /**
     * Hard stop price — zone invalidation level. Equal to `distalLine`.
     * Always set by `identifyZones`.
     */
    stopPrice?: number;
    /**
     * Target price — proximalLine of the nearest opposing zone.
     * Demand zones: nearest supply proximalLine above `entryPrice`.
     * Supply zones: nearest demand proximalLine below `entryPrice`.
     * `null` when no opposing zone exists in the dataset.
     * Always set by `identifyZones`.
     */
    targetPrice?: number | null;
}
