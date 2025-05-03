import { ZONE_DIRECTION, ZONE_TYPE } from '../enums';
import { Zone } from './Zone';

/**
 * Represents a demand zone, which is a specific type of trading zone
 * characterized by its direction and type.
 *
 * @extends Zone
 *
 * @property {ZONE_DIRECTION.DEMAND} direction - The direction of the zone, which is always set to `DEMAND`.
 * @property {ZONE_TYPE.DROP_BASE_RALLY | ZONE_TYPE.RALLY_BASE_RALLY} type - The type of the demand zone, which can either be
 * a `DROP_BASE_RALLY` or a `RALLY_BASE_RALLY`.
 * @property {number} [confidence] - An optional confidence level associated with the demand zone.
 */
export interface DemandZone extends Zone {
    direction: ZONE_DIRECTION.DEMAND;
    type: ZONE_TYPE.DROP_BASE_RALLY | ZONE_TYPE.RALLY_BASE_RALLY;
    confidence?: number;
}
