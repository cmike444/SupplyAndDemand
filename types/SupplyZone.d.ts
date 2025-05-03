import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';
import { Zone } from './Zone';

/**
 * Represents a supply zone, which extends the base `Zone` interface.
 * 
 * @extends Zone
 * 
 * @property {ZONE_DIRECTION.SUPPLY} direction - The direction of the zone, which is always `SUPPLY`.
 * @property {ZONE_TYPE.RALLY_BASE_DROP | ZONE_TYPE.DROP_BASE_DROP} type - The type of the supply zone, 
 * either `RALLY_BASE_DROP` or `DROP_BASE_DROP`.
 * @property {number} [confidence] - An optional confidence level associated with the supply zone.
 */
export interface SupplyZone extends Zone {
    direction: ZONE_DIRECTION.SUPPLY;
    type: ZONE_TYPE.RALLY_BASE_DROP | ZONE_TYPE.DROP_BASE_DROP;
    confidence?: number;
}
