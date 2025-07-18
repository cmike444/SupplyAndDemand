"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZONE_DIRECTION = void 0;
/**
 * Enum representing the direction of a zone in the supply and demand system.
 *
 * @enum {number}
 * @property {number} SUPPLY - Represents a supply zone.
 * @property {number} DEMAND - Represents a demand zone.
 */
var ZONE_DIRECTION;
(function (ZONE_DIRECTION) {
    ZONE_DIRECTION[ZONE_DIRECTION["SUPPLY"] = 0] = "SUPPLY";
    ZONE_DIRECTION[ZONE_DIRECTION["DEMAND"] = 1] = "DEMAND";
})(ZONE_DIRECTION || (exports.ZONE_DIRECTION = ZONE_DIRECTION = {}));
