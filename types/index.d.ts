export interface Candle {
    open: number;
    close: number;
    high: number;
    low: number;
    timestamp: string;
    volume?: number;
}

export interface Zone {
    proximalLine: number;
    distalLine: number;
    startTimestamp: Candle['timestamp'];
    endTimestamp: Candle['timestamp'];
}

export enum ZONE_DIRECTION {
    SUPPLY = 0,
    DEMAND = 1,
}

export enum ZONE_TYPE {
    DROP_BASE_DROP = 0,
    RALLY_BASE_RALLY = 1,
    DROP_BASE_RALLY = 2,
    RALLY_BASE_DROP = 3,
};

export interface SupplyZone extends Zone {
    direction: ZONE_DIRECTION.SUPPLY;
    type: ZONE_TYPE.RALLY_BASE_DROP | ZONE_TYPE.DROP_BASE_DROP;
    confidence?: number;
}

export interface DemandZone extends Zone {
    direction: ZONE_DIRECTION.DEMAND;
    type: ZONE_TYPE.DROP_BASE_RALLY | ZONE_TYPE.RALLY_BASE_RALLY;
    confidence?: number;
}
