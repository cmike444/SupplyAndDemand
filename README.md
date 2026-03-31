# Supply and Demand Zones

A TypeScript library for identifying supply and demand zones in candlestick data. This library is designed for use in financial and trading applications, providing tools to analyze candlestick patterns and detect key market zones.

## Features

- Identify **supply zones** (e.g., Rally-Base-Drop, Drop-Base-Drop patterns).
- Identify **demand zones** (e.g., Drop-Base-Rally, Rally-Base-Rally patterns).
- **Confidence scoring** (0–1) on every zone, derived from the strength and volume of the departure leg.
- **Freshness filtering** via `filterFreshZones` — removes stale zones whose price levels conflict with newer zones (a demand zone can never be priced above a supply zone).
- Analyze candlestick data with utility functions for:
  - Calculating candle body size and range.
  - Determining bullish, bearish, decisive, and indecisive candles.
  - Detecting explosive candles.
- Fully written in TypeScript with type definitions for strong typing.
- Includes enums and constants for candlestick analysis.

## Installation

Install the library via npm:

```sh
npm install supply-and-demand-zones
```

## Usage

### Importing the Library

You can import the library functions, types, and constants into your project:

```typescript
import { identifyZones, filterFreshZones, candleBody, isBullishCandle, ZONE_TYPE, ZONE_DIRECTION, DEFAULT_DECISIVE_THRESHOLD } from 'supply-and-demand-zones';
```

### Example: Identifying Supply and Demand Zones

```typescript
import { identifyZones } from 'supply-and-demand-zones';

const candles = [
  { timestamp: 1, open: 100, high: 110, low: 95, close: 105 },
  { timestamp: 2, open: 105, high: 115, low: 100, close: 110 },
  { timestamp: 3, open: 110, high: 120, low: 105, close: 115 },
  // Add more candlestick data here...
];

const { supplyZones, demandZones } = identifyZones(candles);

console.log('Supply Zones:', supplyZones);
console.log('Demand Zones:', demandZones);
```

### Example: Filtering Fresh Zones

After identifying zones, remove stale zones whose price levels conflict with newer ones:

```typescript
import { identifyZones, filterFreshZones } from 'supply-and-demand-zones';

const { supplyZones, demandZones } = identifyZones(candles);
const fresh = filterFreshZones(supplyZones, demandZones);

console.log('Fresh Supply Zones:', fresh.supplyZones);
console.log('Fresh Demand Zones:', fresh.demandZones);
```

Every zone also carries a `confidence` score (0–1) indicating the strength of the zone:

```typescript
const strongZones = fresh.demandZones.filter(z => z.confidence >= 0.7);
```

### Example: Utility Functions

#### Calculate Candle Body Size
```typescript
import { candleBody } from 'supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 110, low: 95, close: 105 };
console.log('Candle Body Size:', candleBody(candle)); // Output: 5
```

#### Check if a Candle is Bullish
```typescript
import { isBullishCandle } from 'supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 110, low: 95, close: 105 };
console.log('Is Bullish:', isBullishCandle(candle)); // Output: true
```

#### Check if a Candle is Decisive
```typescript
import { isDecisiveCandle } from 'supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 110, low: 95, close: 105 };
console.log('Is Decisive:', isDecisiveCandle(candle)); // Output depends on the threshold
```

#### Detect Explosive Candles
```typescript
import { isExplosiveCandle } from '@cmike444/supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 150, low: 95, close: 145 };

// Basic check — body/range ratio >= 0.70
console.log('Is Explosive:', isExplosiveCandle(candle)); // true

// With ATR magnitude check — range must also be >= 1.5 × ATR (e.g. 20)
console.log('Is Explosive ERC:', isExplosiveCandle(candle, 0.70, 30)); // true if range >= 30
```

### Example: Using Enums and Constants

#### Zone Direction
```typescript
import { ZONE_DIRECTION } from 'supply-and-demand-zones';

console.log(ZONE_DIRECTION.SUPPLY); // Output: 0
console.log(ZONE_DIRECTION.DEMAND); // Output: 1
```

#### Default Decisive Threshold
```typescript
import { DEFAULT_DECISIVE_THRESHOLD } from 'supply-and-demand-zones';

console.log('Default Decisive Threshold:', DEFAULT_DECISIVE_THRESHOLD); // Output: 0.5
```

## API Reference

### Functions

#### `identifyZones(candles: Candle[]): { supplyZones: SupplyZone[], demandZones: DemandZone[] }`
Identifies supply and demand zones in an array of candlestick data.

Every returned zone carries a `confidence` score in [0, 1] computed as the equal-weighted average of seven factors:

1. **countFactor** — proportion of departure candles that are decisive or explosive in the departure direction.
2. **rangeFactor** — average departure candle range normalised by local ATR, clamped to [0, 1].
3. **volumeFactor** — departure vs base volume ratio through `ratio / (ratio + 1)`. Falls back to 0.5 when volume is absent.
4. **timeFactor** — encodes "Time at Level": 1–3 base candles → 1.0 (tight, sharply-formed imbalance); 4–6 base candles → 0.5.
5. **positionFactor** — price position within the chart's full range; higher for supply zones at elevated prices and demand zones at depressed prices.
6. **freshnessFactor** — 1.0 if price never re-entered the zone; 0.5 if price touched the proximal line but was repelled before breaching the distal line.
7. **timeframeFactor** — log-normalised median candle interval from 1 minute (0.0) to 1 week (1.0); higher timeframe zones carry more institutional weight.

Departure sub-score: `(countFactor + rangeFactor + volumeFactor + timeFactor) / 4`

Final formula: `(departureScore × 4 + positionFactor + freshnessFactor + timeframeFactor) / 7`

- **Parameters**:
  - `candles`: An array of `Candle` objects.
- **Returns**:
  - An object containing `supplyZones` and `demandZones`, each zone with a `confidence` score.

#### `filterFreshZones(supplyZones: SupplyZone[], demandZones: DemandZone[]): { supplyZones: SupplyZone[], demandZones: DemandZone[] }`
Filters out stale zones whose price levels conflict with newer zones.

A demand zone's proximal line (upper edge) must never be above a supply zone's proximal line (lower edge). When a conflict is found, the zone with the older `endTimestamp` is removed. On a tie, the demand zone is removed.

- **Parameters**:
  - `supplyZones`: An array of `SupplyZone` objects.
  - `demandZones`: An array of `DemandZone` objects.
- **Returns**:
  - A new object containing only the fresh, non-conflicting zones.

#### `calculateConfidence(departureCandles: Candle[], baseCandles: Candle[], localATR: number, isUpwardDeparture: boolean): number`
Calculates the **departure-leg sub-score** (0–1) for a zone. This is factors 1–4 of the full confidence model — when called through `identifyZones`, three additional context factors (position, freshness, timeframe) are blended in automatically.

The sub-score is the average of four equally-weighted factors:
- **countFactor** — proportion of departure candles that are decisive or explosive in the departure direction.
- **rangeFactor** — average departure candle range normalised by `localATR`, clamped to [0, 1]. Falls back to 0.5 when `localATR` is zero.
- **volumeFactor** — departure vs base volume ratio mapped through `ratio / (ratio + 1)`. Falls back to 0.5 when volume data is absent.
- **timeFactor** — encodes "Time at Level": 1–3 base candles → 1.0; 4–6 base candles → 0.5. Fewer candles in the base signal a sharper, less-disputed imbalance.

- **Parameters**:
  - `departureCandles`: Candles forming the explosive leg away from the zone.
  - `baseCandles`: Candles forming the indecisive base of the zone.
  - `localATR`: ATR for the context window around the zone.
  - `isUpwardDeparture`: `true` for a bullish departure (demand zone), `false` for bearish (supply zone).
- **Returns**:
  - A confidence score in [0, 1].

#### `candleBody(candle: Candle): number`
Calculates the body size of a candlestick.

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - The absolute difference between the `close` and `open` prices.

#### `isBullishCandle(candle: Candle): boolean`
Determines if a candlestick is bullish.

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - `true` if the `close` price is greater than the `open` price, otherwise `false`.

#### `isDecisiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is decisive based on a threshold.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold`: A number representing the minimum body size as a percentage of the total range (default: `0.5`).
- **Returns**:
  - `true` if the body size exceeds the threshold, otherwise `false`.

#### `isExplosiveCandle(candle: Candle, threshold?: number, minATR?: number): boolean`
Determines if a candlestick is an Extended Range Candle (ERC) — the "leg-out" that signals an institutional imbalance.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold` *(optional)*: Minimum body-to-range ratio (default: `DEFAULT_EXPLOSIVE_THRESHOLD = 0.70`). The body must represent at least this proportion of the total range.
  - `minATR` *(optional)*: Minimum required total range (default: `0`). When > 0, candles whose `high − low` falls below this value are rejected even if their body ratio qualifies. Typically passed as `MIN_EXPLOSIVE_ATR_MULTIPLIER × localATR` (1.5× ATR) to confirm the leg-out is significantly larger than surrounding price action.
- **Returns**:
  - `true` if the body-to-range ratio meets the threshold **and** the total range is ≥ `minATR`.

#### `candleRange(candle: Candle): number`
Calculates the full range of a candlestick (`high - low`).

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - `candle.high - candle.low`.

#### `isBearishCandle(candle: Candle): boolean`
Determines if a candlestick is bearish.

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - `true` if `close < open`, otherwise `false`.

#### `isBullishDecisiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is both bullish and decisive.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold` *(optional)*: Minimum body-to-range ratio (default: `DEFAULT_DECISIVE_THRESHOLD = 0.5`).
- **Returns**:
  - `true` if the candle is bullish and body-to-range ratio ≥ threshold.

#### `isBearishDecisiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is both bearish and decisive.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold` *(optional)*: Minimum body-to-range ratio (default: `DEFAULT_DECISIVE_THRESHOLD = 0.5`).
- **Returns**:
  - `true` if the candle is bearish and body-to-range ratio ≥ threshold.

#### `isBullishExplosiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is both bullish and explosive.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold` *(optional)*: Minimum body-to-range ratio (default: `DEFAULT_EXPLOSIVE_THRESHOLD = 0.7`).
- **Returns**:
  - `true` if the candle is bullish and body-to-range ratio ≥ threshold.

#### `isBearishExplosiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is both bearish and explosive.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold` *(optional)*: Minimum body-to-range ratio (default: `DEFAULT_EXPLOSIVE_THRESHOLD = 0.7`).
- **Returns**:
  - `true` if the candle is bearish and body-to-range ratio ≥ threshold.

#### `isIndecisiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is indecisive (small body relative to range).

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold` *(optional)*: Maximum body-to-range ratio (default: `DEFAULT_DECISIVE_THRESHOLD = 0.5`).
- **Returns**:
  - `true` if the body-to-range ratio is strictly below the threshold.

#### `atr(candles: Candle[], period?: number): number`
Computes the Average True Range using a simple mean over the last `period` true-range values.

True Range is `max(high − low, |high − prevClose|, |low − prevClose|)`. For the first candle (no previous close), TR = `high − low`. Returns `0` for an empty array.

- **Parameters**:
  - `candles`: Array of `Candle` objects representing the context window.
  - `period` *(optional)*: Look-back period (default: `DEFAULT_ATR_PERIOD = 14`).
- **Returns**:
  - Mean TR over the last `period` values, or `0` if the array is empty.

#### `isValidBase(baseCandles: Candle[], precedingCandle: Candle, localATR: number): boolean`
Validates that a base sequence is well-formed relative to local volatility. Applies two checks:

1. **Gap check** — rejects if any consecutive open-to-prior-close gap within `[precedingCandle, ...baseCandles]` exceeds `MAX_BASE_GAP_ATR_MULTIPLIER × localATR`.
2. **Height check** — rejects if the base's full high-to-low range exceeds `MAX_ZONE_ATR_MULTIPLIER × localATR`.

Returns `true` unconditionally when `localATR ≤ 0`.

- **Parameters**:
  - `baseCandles`: The indecisive candles forming the base.
  - `precedingCandle`: The candle immediately before the base.
  - `localATR`: ATR for the context window around the base.
- **Returns**:
  - `true` if the base passes both checks, `false` otherwise.

#### `dropBaseDrop(candles: Candle[], localATR?: number): SupplyZone | null`
Detects a Drop-Base-Drop supply zone pattern.

- **Parameters**:
  - `candles`: Array starting at the first candle of the potential pattern.
  - `localATR` *(optional)*: ATR for base validation (default: `0`).
- **Returns**:
  - A `SupplyZone` if the pattern is detected, `null` otherwise.

#### `dropBaseRally(candles: Candle[], localATR?: number): DemandZone | null`
Detects a Drop-Base-Rally demand zone pattern.

- **Parameters**:
  - `candles`: Array starting at the first candle of the potential pattern.
  - `localATR` *(optional)*: ATR for base validation (default: `0`).
- **Returns**:
  - A `DemandZone` if the pattern is detected, `null` otherwise.

#### `rallyBaseDrop(candles: Candle[], localATR?: number): SupplyZone | null`
Detects a Rally-Base-Drop supply zone pattern.

- **Parameters**:
  - `candles`: Array starting at the first candle of the potential pattern.
  - `localATR` *(optional)*: ATR for base validation (default: `0`).
- **Returns**:
  - A `SupplyZone` if the pattern is detected, `null` otherwise.

#### `rallyBaseRally(candles: Candle[], localATR?: number): DemandZone | null`
Detects a Rally-Base-Rally demand zone pattern.

- **Parameters**:
  - `candles`: Array starting at the first candle of the potential pattern.
  - `localATR` *(optional)*: ATR for base validation (default: `0`).
- **Returns**:
  - A `DemandZone` if the pattern is detected, `null` otherwise.

#### `findPatternEnd(candles: Candle[], startIndex: number, condition: (candle: Candle) => boolean, maxCount?: number): number`
Advances through `candles` from `startIndex` while `condition` holds, returning the index of the first candle that does not satisfy the condition (or the end of the array).

- **Parameters**:
  - `candles`: Array of `Candle` objects.
  - `startIndex`: Index to start scanning from.
  - `condition`: Predicate applied to each candle.
  - `maxCount` *(optional)*: Maximum number of candles to advance.
- **Returns**:
  - Index of the first non-matching candle, or `candles.length` if all checked candles match.

### Types

#### `Candle`
Represents a single candlestick.

- **Properties**:
  - `timestamp`: The time of the candlestick.
  - `open`: The opening price.
  - `high`: The highest price.
  - `low`: The lowest price.
  - `close`: The closing price.
  - `volume` *(optional)*: The trading volume. Used in confidence scoring when present.

#### `Zone`
Base interface for all zones.

- **Properties**:
  - `proximalLine`: The near edge of the zone (closest to current price). Derived from candle **bodies** only — for supply zones: the lowest body (open/close) across the base; for demand zones: the highest body (open/close) across the base.
  - `distalLine`: The far edge of the zone. Spans the **entire formation** (leg-in + base + leg-out) using full wicks — for supply zones: the highest `high`; for demand zones: the lowest `low`.
  - `startTimestamp`: The timestamp of the first candle in the pattern.
  - `endTimestamp`: The timestamp of the last candle in the pattern.
  - `confidence`: A score in [0, 1] indicating zone strength.

#### `SupplyZone`
Extends `Zone`. Represents a supply zone.

- **Additional properties**:
  - `direction`: Always `ZONE_DIRECTION.SUPPLY`.
  - `type`: `ZONE_TYPE.RALLY_BASE_DROP` or `ZONE_TYPE.DROP_BASE_DROP`.

#### `DemandZone`
Extends `Zone`. Represents a demand zone.

- **Additional properties**:
  - `direction`: Always `ZONE_DIRECTION.DEMAND`.
  - `type`: `ZONE_TYPE.DROP_BASE_RALLY` or `ZONE_TYPE.RALLY_BASE_RALLY`.

### Enums

#### `ZONE_DIRECTION`
Direction of a zone.

- **Values**:
  - `SUPPLY = 0`: A supply zone (price expected to fall from here).
  - `DEMAND = 1`: A demand zone (price expected to rise from here).

#### `ZONE_TYPE`
Pattern type that formed the zone.

- **Values**:
  - `DROP_BASE_DROP = 0`
  - `RALLY_BASE_RALLY = 1`
  - `DROP_BASE_RALLY = 2`
  - `RALLY_BASE_DROP = 3`

### Constants

| Constant | Value | Description |
|---|---|---|
| `DEFAULT_DECISIVE_THRESHOLD` | `0.5` | Minimum body-to-range ratio for a decisive candle. |
| `DEFAULT_EXPLOSIVE_THRESHOLD` | `0.7` | Minimum body-to-range ratio for an explosive candle (ERC). |
| `DEFAULT_ATR_PERIOD` | `14` | Look-back period for ATR calculation (Wilder's standard). |
| `MIN_RALLY_CANDLES` | `2` | Minimum consecutive bullish candles required to define a rally leg. |
| `MIN_DROP_CANDLES` | `2` | Minimum consecutive bearish candles required to define a drop leg. |
| `MIN_BASE_CANDLES` | `1` | Minimum indecisive candles required for a valid base. |
| `MAX_BASE_CANDLES` | `6` | Maximum indecisive candles allowed in a base. More than 6 indicates the imbalance is too dispersed. |
| `MIN_EXPLOSIVE_ATR_MULTIPLIER` | `1.5` | Minimum ERC total range as a multiple of ATR. The leg-out must be significantly larger than surrounding price action. |
| `MAX_ZONE_ATR_MULTIPLIER` | `1.5` | Maximum base high-to-low range as a multiple of ATR. |
| `MAX_BASE_GAP_ATR_MULTIPLIER` | `0.5` | Maximum open-to-prior-close gap within a base as a multiple of ATR. |

## Gathering Datasets

The `scripts/fetch_candles.ts` script downloads OHLCV candlestick data for any ticker via [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2) and saves it as a JSON file in the `data/` folder. The filename is automatically generated from the symbol, interval, and actual date range of the data.

### Prerequisites

```sh
npm install
```

### Usage

```sh
npm run fetch-candles <SYMBOL> [INTERVAL] [PERIOD]
```

| Argument | Required | Default | Description |
|---|---|---|---|
| `SYMBOL` | Yes | — | Ticker symbol (e.g. `SPY`, `AAPL`, `IBIT`) |
| `INTERVAL` | No | `1m` | Bar size: `1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `1d` |
| `PERIOD` | No | `7d` | Lookback window: `1d`, `5d`, `7d`, `1mo`, `3mo`, `6mo`, `1y` |

### Examples

```sh
# 1-minute SPY data for the last 7 days (default)
npm run fetch-candles SPY

# 5-minute AAPL data for the last 60 days
npm run fetch-candles AAPL 5m 3mo

# Daily IBIT data for the last year
npm run fetch-candles IBIT 1d 1y
```

### Output

Files are saved to `data/` with the naming convention `<SYMBOL>_<INTERVAL>_<STARTDATE>_<ENDDATE>.json`:

```
data/SPY_1m_20260319_20260327.json
data/AAPL_5m_20251231_20260327.json
data/IBIT_1d_20250329_20260327.json
```

Each candle object contains:

```json
{
  "timestamp": 1773927000000,
  "open": 656.97,
  "high": 657.00,
  "low": 655.17,
  "close": 655.85,
  "volume": 5070007
}
```

### Interval Limits

| Interval | Max lookback |
|---|---|
| `1m` | 7 days |
| `2m`, `5m`, `15m`, `30m` | 60 days |
| `60m` | 730 days |
| `1d` and above | Unlimited |

## Visualizing Zones

Two scripts generate self-contained HTML files that can be opened in any browser.

### `npm run visualize-zones`

Renders identified zones on an interactive candlestick chart powered by [Apache ECharts 5](https://echarts.apache.org/).

```sh
npm run visualize-zones -- <path/to/data.json> [output.html]
```

If no output path is given, the file is auto-named `<input-basename>_zones.html` and written to the `example/` directory (gitignored).

**Chart features:**
- Dark-theme ECharts 5 candlestick chart (replaced Chart.js in a previous version)
- Gap-free x-axis — timestamps are mapped to sequential indices, eliminating overnight and weekend gaps
- Optional volume panel rendered below the price chart when candle data contains a `volume` field
- Scroll, pan, and zoom via mouse wheel or the slider below the chart; defaults to the last ~500 candles
- Only **intact** zones are displayed:
  - Stale zones (price-level conflicts between supply and demand) are removed via `filterFreshZones`
  - Breached zones (price fully wicked through the distal line after the zone formed) are additionally removed
- **Zone fill opacity** scales with `confidence` — faint at 0, solid at 1
- **Proximal and distal rays** extend from the zone's end timestamp to the right edge of the chart
- Each proximal ray is labeled with the price level, a **letter grade** (A+ through F), and the numeric score
- The subtitle bar shows total zones identified, the fresh count, and how many stale/breached zones were removed

### `npm run visualize-tests`

Generates `example/testCases.html` — an interactive chart that plots the candle fixtures used in the test suite alongside their detected zones. Useful for visually verifying pattern detection logic.

```sh
npm run visualize-tests
```

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.