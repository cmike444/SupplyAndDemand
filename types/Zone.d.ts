/**
 * Represents a Zone with specific boundaries and time range.
 *
 * @interface Zone
 * @property {number} proximalLine - The proximal boundary line of the zone.
 * @property {number} distalLine - The distal boundary line of the zone.
 * @property {Candle['timestamp']} startTimestamp - The starting timestamp of the zone, derived from a Candle's timestamp.
 * @property {Candle['timestamp']} endTimestamp - The ending timestamp of the zone, derived from a Candle's timestamp.
 */
export interface Zone {
    proximalLine: number;
    distalLine: number;
    startTimestamp: Candle['timestamp'];
    endTimestamp: Candle['timestamp'];
}
