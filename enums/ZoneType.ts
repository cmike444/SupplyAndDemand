/**
 * Enum representing the type of zone pattern in the supply and demand system.
 *
 * @enum {number}
 * @property {number} DROP_BASE_DROP - Represents a zone where the pattern is a drop, base, then drop.
 * @property {number} RALLY_BASE_RALLY - Represents a zone where the pattern is a rally, base, then rally.
 * @property {number} DROP_BASE_RALLY - Represents a zone where the pattern is a drop, base, then rally.
 * @property {number} RALLY_BASE_DROP - Represents a zone where the pattern is a rally, base, then drop.
 */
export enum ZONE_TYPE {
    DROP_BASE_DROP = 0,
    RALLY_BASE_RALLY = 1,
    DROP_BASE_RALLY = 2,
    RALLY_BASE_DROP = 3,
}
