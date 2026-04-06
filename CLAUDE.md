# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Supply and Demand Zones** — A TypeScript library for identifying supply and demand zones in candlestick data using pattern recognition and a 7-factor confidence scoring model. Designed for financial and trading applications. Published to npm as @cmike444/supply-and-demand-zones.

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Compile TypeScript to dist/ directory |
| `npm run test` | Run Jest test suite from test/ directory |
| `npm run fetch-candles <SYMBOL> [INTERVAL] [PERIOD]` | Download OHLCV data via yahoo-finance2, save to data/ |
| `npm run visualize-zones <data.json> [output.html]` | Render interactive ECharts candlestick chart with detected zones |
| `npm run visualize-tests` | Generate chart of test cases with detected zones |
| `npm run identify-zones` | ts-node utility to identify zones from a file |
| `npm run version` | Release new version (creates tag, GitHub release) |

## Architecture

### Entry Point
- **index.ts** — Exports all public functions, types, enums, constants from lib/, types/, enums/

### Main Algorithm
- **lib/identifyZones.ts** — Scans candlestick array, detects all supply/demand zones with full 7-factor confidence scoring
- **lib/filterFreshZones.ts** — Removes stale zones with price-level conflicts; keeps only non-overlapping zones

### Pattern Detection (4 patterns)
- **lib/rallyBaseDrop.ts** — Supply zone (RBD, 3-leg pattern)
- **lib/dropBaseDrop.ts** — Supply zone (DBD, 3-leg pattern)
- **lib/dropBaseRally.ts** — Demand zone (DBR, 3-leg pattern)
- **lib/rallyBaseRally.ts** — Demand zone (RBR, 3-leg pattern)

Each pattern function:
- Takes `candles: Candle[]` (starting at pattern's first candle)
- Returns `Zone | null` with confidence score
- Calls internal helpers: `isValidBase()`, `findPatternEnd()`, `calculateConfidence()`

### Confidence Scoring (7-factor model)
**Departure score** (factors 1–4, averaged by `calculateConfidence()`):
1. **countFactor** — Ratio of decisive/explosive candles in departure leg
2. **rangeFactor** — Avg departure candle range normalized by local ATR (clamped [0,1])
3. **volumeFactor** — Departure vs base volume ratio mapped: `ratio / (ratio + 1)`
4. **timeFactor** — Time at level: 1–3 candles = 1.0; 4–6 = 0.5; 7+ = 0.0

**Context factors** (added in identifyZones):
5. **positionFactor** — Higher for supply zones at elevated prices, demand zones at low prices
6. **freshnessFactor** — 1.0 if price never re-entered; 0.5 if touched proximal but repelled before distal
7. **rrScore** — Departure-based risk/reward: `min(departureExtent / stopDistance / 5, 1)`; 5:1 R:R = 1.0

**timeframeFactor** — Log-normalized candle interval (1m = 0.0, 1 week = 1.0); blended as a context factor alongside positionFactor and freshnessFactor.

**Formula** (two-step blend, each of the 7 factors gets equal ~14.3% weight):
```
departureScore   = (countFactor + rangeFactor + volumeFactor + timeFactor) / 4
sixFactorScore   = (departureScore × 3 + positionFactor + freshnessFactor + timeframeFactor) / 6
confidence       = (sixFactorScore × 6 + rrScore) / 7
```

### Candle Utilities
- **lib/candleBody.ts**, **lib/candleRange.ts** — Basic measurements
- **lib/isBullishCandle.ts**, **lib/isBearishCandle.ts** — Direction checks
- **lib/isDecisiveCandle.ts**, **lib/isIndecisiveCandle.ts** — Body/range ratio checks (threshold = 0.5 default)
- **lib/isExplosiveCandle.ts** — Extended Range Candle (ERC) detection; body/range ≥ 0.70 + range ≥ 1.5×ATR
- **lib/isBullishDecisiveCandle.ts**, **lib/isBearishDecisiveCandle.ts** — Combined direction + decisive checks
- **lib/isBullishExplosiveCandle.ts**, **lib/isBearishExplosiveCandle.ts** — Directional ERC checks; used by `calculateConfidence`
- **lib/atr.ts** — Average True Range (14-period default, simple mean)
- **lib/rvol.ts** — Relative Volume: `current.volume / mean(prior N volumes)`

### Types & Constants
- **types/Candle.d.ts** — `{ timestamp, open, high, low, close, volume? }`
- **types/Zone.d.ts** — Base zone interface: `proximalLine, distalLine, startTimestamp, endTimestamp, confidence, rrScore?, entryPrice?, stopPrice?, targetPrice?`
  - `rrScore` — Standalone R:R score [0,1]; always set by `identifyZones`
  - `entryPrice` — Limit entry; equals `proximalLine`
  - `stopPrice` — Stop/invalidation level; equals `distalLine`
  - `targetPrice` — Proximal line of nearest opposing zone; `null` if none exists
- **types/SupplyZone.d.ts**, **types/DemandZone.d.ts** — Extend Zone with `direction` and `type`
- **enums/ZONE_DIRECTION.ts** — SUPPLY (0), DEMAND (1)
- **enums/ZONE_TYPE.ts** — DROP_BASE_DROP (0), RALLY_BASE_RALLY (1), DROP_BASE_RALLY (2), RALLY_BASE_DROP (3)
- **constants/index.ts** — Key thresholds (MAX_BASE_CANDLES=6, MIN_EXPLOSIVE_ATR_MULTIPLIER=1.5, etc.)

### Testing
- **test/** — Jest test suite with fixtures for each pattern type
- **jest.config.js** — Uses ts-jest; transforms .ts files; collects coverage
- Run with `npm run test`

### Developer Tools
- **scripts/fetch_candles.ts** — Downloads OHLCV via yahoo-finance2 (1m: 7d max, 5m: 60d, hourly: 2y, daily: unlimited)
- **scripts/visualizeZones.ts** — ECharts 5 candlestick chart; plots zones with confidence opacity; interactive (zoom, pan, scroll)
- **scripts/visualizeTestCases.ts** — Auto-generates chart from test suite fixtures
- **scripts/identifyZonesFromFile.ts** — Utility to run identifyZones on a JSON data file
- **scripts/convertToCandle.ts** — Helper to convert candle formats

## Key Patterns & Decisions

**Zone Proximal/Distal Definition**:
- **Proximal** (near current price) — Derived from candle *bodies* only (open/close); this is the "level" traders watch
- **Distal** (far edge) — Spans entire formation using full *wicks* (high/low); the outer boundary

**Base Validation** — Two checks via `isValidBase()`:
1. No gap within base exceeds MAX_BASE_GAP_ATR_MULTIPLIER (0.5×) relative to local ATR
2. Base height does not exceed MAX_ZONE_ATR_MULTIPLIER (1.5×) relative to local ATR
- Helps reject overly dispersed or gappy formations

**Freshness Filtering** — `filterFreshZones()` enforces: demand proximal ≤ supply proximal (price levels must not violate market logic)

## Build & Distribution

- **Output directory** — dist/
- **Main entry** — dist/index.js
- **Types** — dist/index.d.ts
- **Files published** — dist/, README.md (configured in package.json "files")
- **Version** — 1.2.3 current; npm release script uses git tag + GitHub releases

## TypeScript Config

- **Target** — es2016
- **Module** — commonjs
- **Declaration maps** — Enabled for debugging
- **Test config** — tsconfig.test.json (separate jest configuration)

## Additional Notes

- Volume is optional on Candle; confidence scoring falls back to 0.5 if absent
- ATR defaults to 14-period; all internal calculations normalize to local ATR context
- Enums are 0-indexed numbers (not strings) for efficiency
- Pattern detection is non-overlapping: each candle appears in at most one zone
- The confidence model balances institutional strength (departure) with market context (position, freshness, timeframe, rrScore)
