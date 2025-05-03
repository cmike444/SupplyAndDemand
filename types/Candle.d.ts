/**
 * Represents a single candlestick in financial data, typically used in trading charts.
 * Each candlestick contains information about the price movement and volume
 * within a specific time period.
 */
export interface Candle {
    open: number;
    close: number;
    high: number;
    low: number;
    timestamp: string;
    volume?: number;
}
