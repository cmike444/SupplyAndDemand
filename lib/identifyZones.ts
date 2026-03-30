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
 * After the departure-based confidence score (count, range, volume) is computed
 * per zone, three further equally-weighted factors are blended in:
 *
 * - **Price position**: higher for supply zones at elevated prices and demand zones
 *   at depressed prices (harder for the opposing side to push through).
 *
 * - **Freshness**: 1.0 if price has never entered the zone since it formed; 0.5 if
 *   price entered (touched the proximal line) but was repelled before breaching the
 *   distal line. Zones where price fully wicked through are considered consumed.
 *
 * - **Timeframe**: derived from the median candle interval, normalised on a log scale
 *   from 1 minute (0.0) to 1 week (1.0). Higher timeframe zones carry more institutional
 *   significance and should outweigh lower timeframe zones.
 *
 * The final confidence is: (departureScore × 3 + positionFactor + freshnessFactor + timeframeFactor) / 6,
 * giving each of the six factors equal weight (~16.7%).
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
     * 1.0 = never entered; 0.5 = entered (proximal touched) but not breached.
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

    /** Blend all six factors equally. */
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

    return { supplyZones, demandZones };
}
