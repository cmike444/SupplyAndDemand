# Supply and Demand Zones

A TypeScript library for identifying supply and demand zones in candlestick data, designed for financial and trading applications.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Confidence Model](#confidence-model)
- [API Reference](#api-reference)
  - [Zone Detection](#zone-detection)
  - [Candle Utilities](#candle-utilities)
  - [Advanced / Internal](#advanced--internal)
- [Types](#types)
- [Enums](#enums)
- [Constants](#constants)
- [Developer Tools](#developer-tools)
  - [Gathering Datasets](#gathering-datasets)
  - [Visualizing Zones](#visualizing-zones)
- [Contributing](#contributing)
- [License](#license)

## Features

- Detect **supply zones** (Rally-Base-Drop, Drop-Base-Drop patterns)
- Detect **demand zones** (Drop-Base-Rally, Rally-Base-Rally patterns)
- **Confidence scoring** (0–1) on every zone, derived from departure strength, volume, position, freshness, and timeframe
- **Freshness filtering** via `filterFreshZones` — removes stale zones whose price levels conflict with newer zones
- Candle utility functions for body size, range, bullish/bearish, decisive, indecisive, and explosive detection
- Full TypeScript types, enums, and constants

## Installation

```sh
npm install supply-and-demand-zones
```

## Quick Start

### Importing

```typescript
import {
  identifyZones,
  filterFreshZones,
  candleBody,
  isBullishCandle,
  ZONE_TYPE,
  ZONE_DIRECTION,
  DEFAULT_DECISIVE_THRESHOLD,
} from 'supply-and-demand-zones';
```

### Identify Supply and Demand Zones

```typescript
import { identifyZones } from 'supply-and-demand-zones';

const candles = [
  { timestamp: 1, open: 100, high: 110, low: 95, close: 105 },
  { timestamp: 2, open: 105, high: 115, low: 100, close: 110 },
  { timestamp: 3, open: 110, high: 120, low: 105, close: 115 },
];

const { supplyZones, demandZones } = identifyZones(candles);

console.log('Supply Zones:', supplyZones);
console.log('Demand Zones:', demandZones);
```

### Filter Fresh Zones

Remove stale zones whose price levels conflict with newer ones:

```typescript
import { identifyZones, filterFreshZones } from 'supply-and-demand-zones';

const { supplyZones, demandZones } = identifyZones(candles);
const fresh = filterFreshZones(supplyZones, demandZones);

console.log('Fresh Supply Zones:', fresh.supplyZones);
console.log('Fresh Demand Zones:', fresh.demandZones);
```

Filter by confidence score:

```typescript
const strongZones = fresh.demandZones.filter(z => z.confidence >= 0.7);
```

### Utility Functions

**Candle body size:**

```typescript
import { candleBody } from 'supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 110, low: 95, close: 105 };
console.log(candleBody(candle)); // 5
```

**Bullish / bearish check:**

```typescript
import { isBullishCandle } from 'supply-and-demand-zones';

console.log(isBullishCandle(candle)); // true
```

**Decisive check:**

```typescript
import { isDecisiveCandle } from 'supply-and-demand-zones';

console.log(isDecisiveCandle(candle)); // true if body/range >= 0.5
```

**Explosive (Extended Range Candle) check:**

```typescript
import { isExplosiveCandle } from 'supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 150, low: 95, close: 145 };

// Basic — body/range ratio >= 0.70
console.log(isExplosiveCandle(candle)); // true

// With ATR magnitude check — range must also be >= 1.5 × ATR (e.g. 30)
console.log(isExplosiveCandle(candle, 0.70, 30)); // true if range >= 30
```

**Enums:**

```typescript
import { ZONE_DIRECTION, DEFAULT_DECISIVE_THRESHOLD } from 'supply-and-demand-zones';

console.log(ZONE_DIRECTION.SUPPLY);       // 0
console.log(ZONE_DIRECTION.DEMAND);       // 1
console.log(DEFAULT_DECISIVE_THRESHOLD);  // 0.5
```

## Confidence Model

Every zone returned by `identifyZones` carries a `confidence` score in [0, 1].

### Departure Sub-score (factors 1–4)

Evaluates the strength of the leg that left the zone:

| Factor | Description |
|---|---|
| **countFactor** | Proportion of departure candles that are decisive or explosive in the departure direction. |
| **rangeFactor** | Average departure candle range normalised by local ATR, clamped to [0, 1]. Falls back to `0.5` when ATR is zero. |
| **volumeFactor** | Departure vs. base volume ratio mapped through `ratio / (ratio + 1)`. Falls back to `0.5` when volume is absent. |
| **timeFactor** | "Time at Level": 1–3 base candles → `1.0` (tight imbalance); 4–6 candles → `0.5`; more → `0`. |

```
departureScore = (countFactor + rangeFactor + volumeFactor + timeFactor) / 4
```

### Full Zone Score (factors 5–7)

Three additional context factors are blended in when scoring through `identifyZones`:

| Factor | Description |
|---|---|
| **positionFactor** | Price position within the chart's full range; higher for supply zones at elevated prices and demand zones at depressed prices. |
| **freshnessFactor** | `1.0` if price never re-entered the zone; `0.5` if price touched the proximal line but was repelled before breaching the distal line. |
| **timeframeFactor** | Log-normalised median candle interval from 1 minute (`0.0`) to 1 week (`1.0`); higher timeframe zones carry more institutional weight. |

```
confidence = (departureScore × 4 + positionFactor + freshnessFactor + timeframeFactor) / 7
```

## API Reference

### Zone Detection

---

#### `identifyZones(candles: Candle[]): { supplyZones: SupplyZone[], demandZones: DemandZone[] }`

Scans an array of candlestick data and returns all detected supply and demand zones, each with a `confidence` score computed using the full 7-factor model. See [Confidence Model](#confidence-model) for details.

| Parameter | Type | Description |
|---|---|---|
| `candles` | `Candle[]` | Array of candlestick data to scan. |

**Returns:** `{ supplyZones: SupplyZone[], demandZones: DemandZone[] }`

---

#### `filterFreshZones(supplyZones: SupplyZone[], demandZones: DemandZone[]): { supplyZones: SupplyZone[], demandZones: DemandZone[] }`

Filters out stale zones whose price levels conflict with newer zones. A demand zone's proximal line (upper edge) must never be above a supply zone's proximal line (lower edge). When a conflict is found, the zone with the older `endTimestamp` is removed. On a tie, the demand zone is removed.

| Parameter | Type | Description |
|---|---|---|
| `supplyZones` | `SupplyZone[]` | Supply zones to filter. |
| `demandZones` | `DemandZone[]` | Demand zones to filter. |

**Returns:** `{ supplyZones: SupplyZone[], demandZones: DemandZone[] }` — only non-conflicting zones.

---

#### `rallyBaseDrop(candles: Candle[], localATR?: number): SupplyZone | null`

Detects a Rally-Base-Drop supply zone pattern.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candles` | `Candle[]` | — | Array starting at the first candle of the potential pattern. |
| `localATR` | `number` | `0` | ATR for base validation. |

**Returns:** A `SupplyZone` if the pattern is detected, `null` otherwise.

---

#### `dropBaseDrop(candles: Candle[], localATR?: number): SupplyZone | null`

Detects a Drop-Base-Drop supply zone pattern.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candles` | `Candle[]` | — | Array starting at the first candle of the potential pattern. |
| `localATR` | `number` | `0` | ATR for base validation. |

**Returns:** A `SupplyZone` if the pattern is detected, `null` otherwise.

---

#### `dropBaseRally(candles: Candle[], localATR?: number): DemandZone | null`

Detects a Drop-Base-Rally demand zone pattern.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candles` | `Candle[]` | — | Array starting at the first candle of the potential pattern. |
| `localATR` | `number` | `0` | ATR for base validation. |

**Returns:** A `DemandZone` if the pattern is detected, `null` otherwise.

---

#### `rallyBaseRally(candles: Candle[], localATR?: number): DemandZone | null`

Detects a Rally-Base-Rally demand zone pattern.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candles` | `Candle[]` | — | Array starting at the first candle of the potential pattern. |
| `localATR` | `number` | `0` | ATR for base validation. |

**Returns:** A `DemandZone` if the pattern is detected, `null` otherwise.

---

### Candle Utilities

---

#### `candleBody(candle: Candle): number`

| Parameter | Type | Description |
|---|---|---|
| `candle` | `Candle` | The candlestick to measure. |

**Returns:** `|close - open|`

---

#### `candleRange(candle: Candle): number`

| Parameter | Type | Description |
|---|---|---|
| `candle` | `Candle` | The candlestick to measure. |

**Returns:** `high - low`

---

#### `isBullishCandle(candle: Candle): boolean`

**Returns:** `true` if `close > open`.

---

#### `isBearishCandle(candle: Candle): boolean`

**Returns:** `true` if `close < open`.

---

#### `isDecisiveCandle(candle: Candle, threshold?: number): boolean`

Determines if a candle has a large body relative to its range.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candle` | `Candle` | — | The candlestick to evaluate. |
| `threshold` | `number` | `0.5` | Minimum body-to-range ratio. |

**Returns:** `true` if body-to-range ratio ≥ `threshold`.

---

#### `isIndecisiveCandle(candle: Candle, threshold?: number): boolean`

Determines if a candle has a small body relative to its range.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candle` | `Candle` | — | The candlestick to evaluate. |
| `threshold` | `number` | `0.5` | Maximum body-to-range ratio. |

**Returns:** `true` if body-to-range ratio is strictly below `threshold`.

---

#### `isExplosiveCandle(candle: Candle, threshold?: number, minATR?: number): boolean`

Determines if a candle is an Extended Range Candle (ERC) — the "leg-out" that signals an institutional imbalance.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candle` | `Candle` | — | The candlestick to evaluate. |
| `threshold` | `number` | `0.70` | Minimum body-to-range ratio. |
| `minATR` | `number` | `0` | Minimum required total range. When > 0, candles whose `high − low` falls below this value are rejected even if their body ratio qualifies. Typically passed as `MIN_EXPLOSIVE_ATR_MULTIPLIER × localATR` (1.5× ATR). |

**Returns:** `true` if body-to-range ratio ≥ `threshold` **and** `high − low` ≥ `minATR`.

---

#### `isBullishDecisiveCandle(candle: Candle, threshold?: number): boolean`

**Returns:** `true` if the candle is bullish and body-to-range ratio ≥ `threshold` (default `0.5`).

---

#### `isBearishDecisiveCandle(candle: Candle, threshold?: number): boolean`

**Returns:** `true` if the candle is bearish and body-to-range ratio ≥ `threshold` (default `0.5`).

---

#### `isBullishExplosiveCandle(candle: Candle, threshold?: number): boolean`

**Returns:** `true` if the candle is bullish and body-to-range ratio ≥ `threshold` (default `0.70`).

---

#### `isBearishExplosiveCandle(candle: Candle, threshold?: number): boolean`

**Returns:** `true` if the candle is bearish and body-to-range ratio ≥ `threshold` (default `0.70`).

---

#### `atr(candles: Candle[], period?: number): number`

Computes the Average True Range using a simple mean over the last `period` true-range values. True Range is `max(high − low, |high − prevClose|, |low − prevClose|)`. For the first candle (no previous close), TR = `high − low`. Returns `0` for an empty array.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candles` | `Candle[]` | — | Array of candles representing the context window. |
| `period` | `number` | `14` | Look-back period. |

**Returns:** Mean TR over the last `period` values, or `0` if the array is empty.

---

### Advanced / Internal

These functions are exported for advanced use cases. They are called internally by the pattern detectors.

---

#### `calculateConfidence(departureCandles: Candle[], baseCandles: Candle[], localATR: number, isUpwardDeparture: boolean): number`

Calculates the **departure sub-score** (factors 1–4 of the full confidence model). When called through `identifyZones`, three additional context factors are blended in automatically. See [Confidence Model](#confidence-model).

| Parameter | Type | Description |
|---|---|---|
| `departureCandles` | `Candle[]` | Candles forming the explosive leg away from the zone. |
| `baseCandles` | `Candle[]` | Candles forming the indecisive base of the zone. |
| `localATR` | `number` | ATR for the context window around the zone. |
| `isUpwardDeparture` | `boolean` | `true` for a bullish departure (demand zone), `false` for bearish (supply zone). |

**Returns:** Departure sub-score in [0, 1].

---

#### `isValidBase(baseCandles: Candle[], precedingCandle: Candle, localATR: number): boolean`

Validates that a base sequence is well-formed relative to local volatility. Applies two checks:

1. **Gap check** — rejects if any consecutive open-to-prior-close gap within `[precedingCandle, ...baseCandles]` exceeds `MAX_BASE_GAP_ATR_MULTIPLIER × localATR`.
2. **Height check** — rejects if the base's full high-to-low range exceeds `MAX_ZONE_ATR_MULTIPLIER × localATR`.

Returns `true` unconditionally when `localATR ≤ 0`.

| Parameter | Type | Description |
|---|---|---|
| `baseCandles` | `Candle[]` | The indecisive candles forming the base. |
| `precedingCandle` | `Candle` | The candle immediately before the base. |
| `localATR` | `number` | ATR for the context window around the base. |

**Returns:** `true` if the base passes both checks, `false` otherwise.

---

#### `findPatternEnd(candles: Candle[], startIndex: number, condition: (candle: Candle) => boolean, maxCount?: number): number`

Advances through `candles` from `startIndex` while `condition` holds, returning the index of the first candle that does not satisfy the condition (or the end of the array).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `candles` | `Candle[]` | — | Array of candles. |
| `startIndex` | `number` | — | Index to start scanning from. |
| `condition` | `(c: Candle) => boolean` | — | Predicate applied to each candle. |
| `maxCount` | `number` | — | Maximum number of candles to advance. |

**Returns:** Index of the first non-matching candle, or `candles.length` if all checked candles match.

---

## Types

### `Candle`

Represents a single candlestick.

| Property | Type | Required | Description |
|---|---|---|---|
| `timestamp` | `number` | Yes | Time of the candlestick. |
| `open` | `number` | Yes | Opening price. |
| `high` | `number` | Yes | Highest price. |
| `low` | `number` | Yes | Lowest price. |
| `close` | `number` | Yes | Closing price. |
| `volume` | `number` | No | Trading volume. Used in confidence scoring when present. |

### `Zone`

Base interface for all zones.

| Property | Type | Description |
|---|---|---|
| `proximalLine` | `number` | Near edge of the zone (closest to current price). Derived from candle **bodies** only — for supply zones: the lowest body (open/close) across the base; for demand zones: the highest body (open/close) across the base. |
| `distalLine` | `number` | Far edge of the zone. Spans the **entire formation** (leg-in + base + leg-out) using full wicks — for supply zones: the highest `high`; for demand zones: the lowest `low`. |
| `startTimestamp` | `number` | Timestamp of the first candle in the pattern. |
| `endTimestamp` | `number` | Timestamp of the last candle in the pattern. |
| `confidence` | `number` | Score in [0, 1] indicating zone strength. |

### `SupplyZone`

Extends `Zone`. Represents a supply zone.

| Property | Type | Description |
|---|---|---|
| `direction` | `ZONE_DIRECTION` | Always `ZONE_DIRECTION.SUPPLY`. |
| `type` | `ZONE_TYPE` | `ZONE_TYPE.RALLY_BASE_DROP` or `ZONE_TYPE.DROP_BASE_DROP`. |

### `DemandZone`

Extends `Zone`. Represents a demand zone.

| Property | Type | Description |
|---|---|---|
| `direction` | `ZONE_DIRECTION` | Always `ZONE_DIRECTION.DEMAND`. |
| `type` | `ZONE_TYPE` | `ZONE_TYPE.DROP_BASE_RALLY` or `ZONE_TYPE.RALLY_BASE_RALLY`. |

## Enums

### `ZONE_DIRECTION`

| Value | Name | Description |
|---|---|---|
| `0` | `SUPPLY` | A supply zone — price is expected to fall from here. |
| `1` | `DEMAND` | A demand zone — price is expected to rise from here. |

### `ZONE_TYPE`

| Value | Name |
|---|---|
| `0` | `DROP_BASE_DROP` |
| `1` | `RALLY_BASE_RALLY` |
| `2` | `DROP_BASE_RALLY` |
| `3` | `RALLY_BASE_DROP` |

## Constants

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

## Developer Tools

### Gathering Datasets

The `scripts/fetch_candles.ts` script downloads OHLCV candlestick data for any ticker via [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2) and saves it as a JSON file in the `data/` folder. The filename is automatically generated from the symbol, interval, and actual date range of the data.

#### Prerequisites

```sh
npm install
```

#### Usage

```sh
npm run fetch-candles <SYMBOL> [INTERVAL] [PERIOD]
```

| Argument | Required | Default | Description |
|---|---|---|---|
| `SYMBOL` | Yes | — | Ticker symbol (e.g. `SPY`, `AAPL`, `IBIT`) |
| `INTERVAL` | No | `1m` | Bar size: `1m`, `2m`, `5m`, `15m`, `30m`, `60m`, `1d` |
| `PERIOD` | No | `7d` | Lookback window: `1d`, `5d`, `7d`, `1mo`, `3mo`, `6mo`, `1y` |

#### Examples

```sh
# 1-minute SPY data for the last 7 days (default)
npm run fetch-candles SPY

# 5-minute AAPL data for the last 60 days
npm run fetch-candles AAPL 5m 3mo

# Daily IBIT data for the last year
npm run fetch-candles IBIT 1d 1y
```

#### Output

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

#### Interval Limits

| Interval | Max Lookback |
|---|---|
| `1m` | 7 days |
| `2m`, `5m`, `15m`, `30m` | 60 days |
| `60m` | 730 days |
| `1d` and above | Unlimited |

### Visualizing Zones

Two scripts generate self-contained HTML files that can be opened in any browser.

#### `npm run visualize-zones`

Renders identified zones on an interactive candlestick chart powered by [Apache ECharts 5](https://echarts.apache.org/).

```sh
npm run visualize-zones -- <path/to/data.json> [output.html]
```

If no output path is given, the file is auto-named `<input-basename>_zones.html` and written to the `example/` directory (gitignored).

**Chart features:**
- Dark-theme ECharts 5 candlestick chart
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

#### `npm run visualize-tests`

Generates `example/testCases.html` — an interactive chart that plots the candle fixtures used in the test suite alongside their detected zones. Useful for visually verifying pattern detection logic.

```sh
npm run visualize-tests
```

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.