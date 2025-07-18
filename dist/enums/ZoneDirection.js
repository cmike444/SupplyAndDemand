"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZONE_TYPE = void 0;
/**
 * Enum representing different types of zone directions in the system.
 * Each value corresponds to a specific combination of drop and rally points.
 *
 * @enum {number}
 * @property {number} DROP_BASE_DROP - Represents a zone where both the start and end points are drop points.
 * @property {number} RALLY_BASE_RALLY - Represents a zone where both the start and end points are rally points.
 * @property {number} DROP_BASE_RALLY - Represents a zone where the start point is a drop point and the end point is a rally point.
 * @property {number} RALLY_BASE_DROP - Represents a zone where the start point is a rally point and the end point is a drop point.
 */
var ZONE_TYPE;
(function (ZONE_TYPE) {
    ZONE_TYPE[ZONE_TYPE["DROP_BASE_DROP"] = 0] = "DROP_BASE_DROP";
    ZONE_TYPE[ZONE_TYPE["RALLY_BASE_RALLY"] = 1] = "RALLY_BASE_RALLY";
    ZONE_TYPE[ZONE_TYPE["DROP_BASE_RALLY"] = 2] = "DROP_BASE_RALLY";
    ZONE_TYPE[ZONE_TYPE["RALLY_BASE_DROP"] = 3] = "RALLY_BASE_DROP";
})(ZONE_TYPE || (exports.ZONE_TYPE = ZONE_TYPE = {}));
;
