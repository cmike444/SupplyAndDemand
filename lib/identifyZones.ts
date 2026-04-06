import { Candle, SupplyZone, DemandZone } from '../types';
import { DEFAULT_ATR_PERIOD } from '../constants';
import { atr } from './atr';
import { rallyBaseDrop } from './rallyBaseDrop';
import { dropBaseDrop } from './dropBaseDrop';
import { dropBaseRally } from './dropBaseRally';
import { rallyBaseRally } from './rallyBaseRally';

/**
 * Identifies all supply and demand zones in a given array of candles.
 *
 * Each zone receives a `confidence` score (0–1) built from seven equally-weighted factors:
 *
 * **Departure leg (×3 weight, computed per zone):**
 * - **countFactor**: proportion of departure candles that are decisive or explosive.
 * - **rangeFactor**: average departure candle range normalised by local ATR.
 * - **volumeFactor**: departure volume relative to base volume (ratio / (ratio + 1)).
 *
 * **Structural context (×1 weight each, blended in `identifyZones`):**
 * - **positionFactor**: higher for supply zones at elevated prices and demand zones at
 *   depressed prices — harder for the opposing side to push through.
 * - **freshnessFactor**: 1.0 if price has never entered the zone since formation; 0.5 if
 *   price touched the proximalLine line but was repelled before the distal line.
 * - **timeframeFactor**: log-normalised candle interval — 1m → 0.0, 1w → 1.0. Higher
 *   timeframe zones carry more institutional significance.
 * - **rrScore**: departure-based risk/reward score. Measures how far price actually
 *   travelled during the departure leg relative to the zone width (stop distance).
 *   `min(departureExtent / stopDistance / 5, 1)` — a 5:1 R:R maps to 1.0. Also stored
 *   as a standalone `zone.rrScore` property for direct access when grading setups.
 *
 * Blend formula: `(departureScore × 3 + positionFactor + freshnessFactor + timeframeFactor) / 6`
 * for the first six factors, then `(sixFactorScore × 6 + rrScore) / 7` to include the seventh,
 * giving each of the seven factors equal weight (~14.3%).
 *
 * @param candles - An array of Candle objects to scan.
 * @returns An object containing arrays of identified supply and demand zones.
 */
export function identifyZones(candles: Candle[]): { supplyZones: SupplyZone[]; demandZones: DemandZone[] } {
    const supplyZones: SupplyZone[] = [];
    const demandZones: DemandZone[] = [];

    const globalMin = Math.min(...candles.map(c => c.low));
    const globalMax = Math.max(...candles.map(c => c.high));
    const priceRange = globalMax - globalMin;

    /** Normalise a price level to [0, 1] across the chart's full price range. */
    const normalise = (price: number): number =>
        priceRange > 0 ? (price - globalMin) / priceRange : 0.5;

    /**
     * 1.0 = never entered; 0.5 = entered (proximalLine touched) but not breached.
     * Supply: price enters when a candle's high >= proximalLine.
     * Demand: price enters when a candle's low  <= proximalLine.
     */
    const freshnessFactor = (postZoneCandles: Candle[], proximalLine: number, isSupply: boolean): number => {
        const entered = isSupply
            ? postZoneCandles.some(c => c.high >= proximalLine)
            : postZoneCandles.some(c => c.low  <= proximalLine);
        return entered ? 0.5 : 1.0;
    };

    /**
     * Infer timeframe factor from the median interval between consecutive candle timestamps.
     * Log-normalised: 1m → ~0.0, 5m → ~0.17, 1h → ~0.48, 1d → ~0.72, 1w → 1.0.
     */
    const LOG_1M = Math.log(60_000);
    const LOG_1W = Math.log(604_800_000);
    let timeframeFactor = 0.5; // fallback for < 2 candles
    if (candles.length >= 2) {
        const intervals = candles.slice(1).map((c, i) => c.timestamp - candles[i].timestamp).filter(d => d > 0);
        intervals.sort((a, b) => a - b);
        const medianInterval = intervals[Math.floor(intervals.length / 2)] ?? 60_000;
        timeframeFactor = Math.min(1, Math.max(0, (Math.log(medianInterval) - LOG_1M) / (LOG_1W - LOG_1M)));
    }

    /** Blend the first six factors equally (departure×3, position, freshness, timeframe). */
    const blendFactors = (departureConfidence: number, positionFactor: number, freshnessScore: number): number =>
        (departureConfidence * 3 + positionFactor + freshnessScore + timeframeFactor) / 6;

    for (let i = 0; i < candles.length; i++) {
        const remainingCandles = candles.slice(i);
        const localATR = atr(candles.slice(Math.max(0, i - DEFAULT_ATR_PERIOD), i));

        const rallyBaseDropZone = rallyBaseDrop(remainingCandles, localATR);
        if (rallyBaseDropZone) {
            const endIdx = remainingCandles.findIndex(c => c.timestamp === rallyBaseDropZone.endTimestamp);
            const postZone = candles.slice(i + (endIdx !== -1 ? endIdx : 0) + 1);
            rallyBaseDropZone.confidence = blendFactors(
                rallyBaseDropZone.confidence,
                normalise(rallyBaseDropZone.proximalLine),
                freshnessFactor(postZone, rallyBaseDropZone.proximalLine, true),
            );
            supplyZones.push(rallyBaseDropZone);
            if (endIdx !== -1) i += endIdx;
            continue;
        }

        const dropBaseDropZone = dropBaseDrop(remainingCandles, localATR);
        if (dropBaseDropZone) {
            const endIdx = remainingCandles.findIndex(c => c.timestamp === dropBaseDropZone.endTimestamp);
            const postZone = candles.slice(i + (endIdx !== -1 ? endIdx : 0) + 1);
            dropBaseDropZone.confidence = blendFactors(
                dropBaseDropZone.confidence,
                normalise(dropBaseDropZone.proximalLine),
                freshnessFactor(postZone, dropBaseDropZone.proximalLine, true),
            );
            supplyZones.push(dropBaseDropZone);
            if (endIdx !== -1) i += endIdx;
            continue;
        }

        const dropBaseRallyZone = dropBaseRally(remainingCandles, localATR);
        if (dropBaseRallyZone) {
            const endIdx = remainingCandles.findIndex(c => c.timestamp === dropBaseRallyZone.endTimestamp);
            const postZone = candles.slice(i + (endIdx !== -1 ? endIdx : 0) + 1);
            dropBaseRallyZone.confidence = blendFactors(
                dropBaseRallyZone.confidence,
                1 - normalise(dropBaseRallyZone.proximalLine),
                freshnessFactor(postZone, dropBaseRallyZone.proximalLine, false),
            );
            demandZones.push(dropBaseRallyZone);
            if (endIdx !== -1) i += endIdx;
            continue;
        }

        const rallyBaseRallyZone = rallyBaseRally(remainingCandles, localATR);
        if (rallyBaseRallyZone) {
            const endIdx = remainingCandles.findIndex(c => c.timestamp === rallyBaseRallyZone.endTimestamp);
            const postZone = candles.slice(i + (endIdx !== -1 ? endIdx : 0) + 1);
            rallyBaseRallyZone.confidence = blendFactors(
                rallyBaseRallyZone.confidence,
                1 - normalise(rallyBaseRallyZone.proximalLine),
                freshnessFactor(postZone, rallyBaseRallyZone.proximalLine, false),
            );
            demandZones.push(rallyBaseRallyZone);
            if (endIdx !== -1) i += endIdx;
            continue;
        }
    }

    // --- Post-processing: rrScore ---
    // Departure-based: uses the measured distance price actually travelled away from the zone
    // during the departure leg as the proxy for target distance.
    //
    // stopDistance     = zone width (|proximalLine − distal|).
    // departureExtent  = for supply zones: min low of departure candles (price went down);
    //                    for demand zones: max high of departure candles (price went up).
    // targetDistance   = |departureExtent − proximalLine|.
    // rrScore          = Math.min(targetDistance / stopDistance / 5, 1)  — 5:1 R:R maps to 1.0.
    //
    // This is always computable from the zone's own candles — no opposing zone required.
    // Re-blends confidence as a 7th equal slot: (existingConfidence × 6 + rrScore) / 7.
    const computeRRScore = (
        proximalLine: number,
        distal: number,
        endTimestamp: number,
        isSupply: boolean,
    ): number => {
        const stopDistance = Math.abs(proximalLine - distal);
        if (stopDistance === 0) return 0;

        // Departure candles run from proximalLine formation up to (and including) endTimestamp.
        // We use all candles from the zone's start up to endTimestamp to find the extreme.
        const zoneCandles = candles.filter(c => c.timestamp <= endTimestamp);
        if (zoneCandles.length === 0) return 0;

        const departureExtent = isSupply
            ? Math.min(...zoneCandles.map(c => c.low))
            : Math.max(...zoneCandles.map(c => c.high));

        const targetDistance = Math.abs(departureExtent - proximalLine);
        return Math.min((targetDistance / stopDistance) / 5, 1);
    };

    for (const zone of supplyZones) {
        zone.rrScore = computeRRScore(zone.proximalLine, zone.distalLine, zone.endTimestamp, true);
        zone.confidence = (zone.confidence * 6 + zone.rrScore) / 7;
    }
    for (const zone of demandZones) {
        zone.rrScore = computeRRScore(zone.proximalLine, zone.distalLine, zone.endTimestamp, false);
        zone.confidence = (zone.confidence * 6 + zone.rrScore) / 7;
    }

    for (const zone of supplyZones) {
        zone.entryPrice = zone.proximalLine;
        zone.stopPrice = zone.distalLine;
        const nearest = demandZones
            .filter(d => d.proximalLine < zone.proximalLine)
            .sort((a, b) => b.proximalLine - a.proximalLine)[0];
        zone.targetPrice = nearest ? nearest.proximalLine : null;
    }
    for (const zone of demandZones) {
        zone.entryPrice = zone.proximalLine;
        zone.stopPrice = zone.distalLine;
        const nearest = supplyZones
            .filter(s => s.proximalLine > zone.proximalLine)
            .sort((a, b) => a.proximalLine - b.proximalLine)[0];
        zone.targetPrice = nearest ? nearest.proximalLine : null;
    }

    return { supplyZones, demandZones };
}
