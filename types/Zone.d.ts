import { Candle } from './Candle';

/**
 * Represents a Zone with specific boundaries and time range.
 *
 * @interface Zone
 * @property {number} proximalLine - The proximal boundary line of the zone.
 * @property {number} distalLine - The distal boundary line of the zone.
 * @property {number} confidence - Confidence score in [0, 1]. The average of six equally-weighted
 *   factors: (1) proportion of strong departure candles, (2) departure range vs ATR,
 *   (3) departure vs base volume ratio, (4) price position — higher for supply zones at
 *   elevated prices and demand zones at depressed prices, (5) freshness — 1.0 if price has
 *   never entered the zone, 0.5 if price entered but was repelled before breaching the distal
 *   line, (6) timeframe — log-normalised candle interval from 1m (0.0) to 1w (1.0).
 * @property {Candle['timestamp']} startTimestamp - The starting timestamp of the zone, derived from a Candle's timestamp.
 * @property {Candle['timestamp']} endTimestamp - The ending timestamp of the zone, derived from a Candle's timestamp.
 */
export interface Zone {
    proximalLine: number;
    distalLine: number;
    startTimestamp: Candle['timestamp'];
    endTimestamp: Candle['timestamp'];
    confidence: number;
}
