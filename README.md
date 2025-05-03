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

## Installation

Install the library via npm:

```sh
npm install supply-and-demand-zones
```

## Usage

### Importing the Library

You can import the library functions into your project:

```typescript
import { identifyZones, candleBody, isBullishCandle } from 'supply-and-demand-zones';
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

## API Reference

### `identifyZones(candles: Candle[]): { supplyZones: SupplyZone[], demandZones: DemandZone[] }`
Identifies supply and demand zones in an array of candlestick data.

- **Parameters**:
  - `candles`: An array of `Candle` objects.
- **Returns**:
  - An object containing `supplyZones` and `demandZones`.

---

### `candleBody(candle: Candle): number`
Calculates the body size of a candlestick.

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - The absolute difference between the `close` and `open` prices.

---

### `isBullishCandle(candle: Candle): boolean`
Determines if a candlestick is bullish.

- **Parameters**:
  - `candle`: A `Candle` object.
- **Returns**:
  - `true` if the `close` price is greater than the `open` price, otherwise `false`.

---

### `isDecisiveCandle(candle: Candle, threshold?: number): boolean`
Determines if a candlestick is decisive based on a threshold.

- **Parameters**:
  - `candle`: A `Candle` object.
  - `threshold`: A number representing the minimum body size as a percentage of the total range (default: `0.5`).
- **Returns**:
  - `true` if the body size exceeds the threshold, otherwise `false`.

---

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.