import { ZONE_DIRECTION } from '../enums';

/**
 * Validates zone geometry before the zone enters the library pipeline.
 */
export function hasValidZoneBounds(
    proximalLine: number,
    distalLine: number,
    direction: ZONE_DIRECTION,
): boolean {
    if (!Number.isFinite(proximalLine) || !Number.isFinite(distalLine)) {
        return false;
    }

    if (proximalLine === distalLine) {
        return false;
    }

    return direction === ZONE_DIRECTION.SUPPLY
        ? proximalLine < distalLine
        : proximalLine > distalLine;
}