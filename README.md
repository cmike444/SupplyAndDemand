# Supply and Demand Zones

A TypeScript library for identifying supply and demand zones in candlestick data. This library is designed for use in financial and trading applications, providing tools to analyze candlestick patterns and detect key market zones.

## Features

- Identify **supply zones** (e.g., Rally-Base-Drop, Drop-Base-Drop patterns).
- Identify **demand zones** (e.g., Drop-Base-Rally, Rally-Base-Rally patterns).
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
import { identifyZones, candleBody, isBullishCandle, CandleType, DEFAULT_THRESHOLD } from 'supply-and-demand-zones';
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
import { isExplosiveCandle } from 'supply-and-demand-zones';

const candle = { timestamp: 1, open: 100, high: 150, low: 95, close: 145 };
console.log('Is Explosive:', isExplosiveCandle(candle)); // Output: true
```

### Example: Using Enums and Constants

#### Candle Types
```typescript
import { CandleType } from 'supply-and-demand-zones';

console.log(CandleType.Bullish); // Output: 'Bullish'
console.log(CandleType.Bearish); // Output: 'Bearish'
```

#### Default Threshold
```typescript
import { DEFAULT_THRESHOLD } from 'supply-and-demand-zones';

console.log('Default Threshold:', DEFAULT_THRESHOLD); // Output: 0.5
```

## API Reference

### Functions

#### `identifyZones(candles: Candle[]): { supplyZones: SupplyZone[], demandZones: DemandZone[] }`
Identifies supply and demand zones in an array of candlestick data.

- **Parameters**:
  - `candles`: An array of `Candle` objects.
- **Returns**:
  - An object containing `supplyZones` and `demandZones`.

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

#### `isExplosiveCandle(candle: Candle): boolean`
Determines if a candlestick is explosive based on its range.

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - `true` if the range exceeds a predefined threshold, otherwise `false`.

### Types

#### `Candle`
Represents a single candlestick.

- **Properties**:
  - `timestamp`: The time of the candlestick.
  - `open`: The opening price.
  - `high`: The highest price.
  - `low`: The lowest price.
  - `close`: The closing price.

#### `SupplyZone`
Represents a supply zone.

- **Properties**:
  - `start`: The starting timestamp of the zone.
  - `end`: The ending timestamp of the zone.
  - `priceRange`: The price range of the zone.

#### `DemandZone`
Represents a demand zone.

- **Properties**:
  - `start`: The starting timestamp of the zone.
  - `end`: The ending timestamp of the zone.
  - `priceRange`: The price range of the zone.

### Enums

#### `CandleType`
Defines the type of a candlestick.

- **Values**:
  - `Bullish`: Represents a bullish candlestick.
  - `Bearish`: Represents a bearish candlestick.

### Constants

#### `DEFAULT_THRESHOLD`
The default threshold for determining decisive candles.

- **Value**: `0.5`

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.