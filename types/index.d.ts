export interface Candle {
    open: number;
    close: number;
    high: number;
    low: number;
    timestamp: string;
    volume?: number;
}
