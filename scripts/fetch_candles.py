"""
fetch_candles.py — Download OHLCV candlestick data via yfinance and save to JSON.

Usage:
  python3 scripts/fetch_candles.py <SYMBOL> [INTERVAL] [PERIOD]

Arguments:
  SYMBOL    Ticker symbol (e.g. SPY, AAPL, IBIT)       [required]
  INTERVAL  Bar size: 1m, 2m, 5m, 15m, 30m, 60m, 1d   [default: 1m]
  PERIOD    Lookback: 1d, 5d, 7d, 1mo, 3mo, 6mo, 1y   [default: 7d]

Note:
  yfinance limits intraday history — 1m data is capped at ~7 days,
  5m/15m/30m at 60 days, 60m at 730 days.

Examples:
  python3 scripts/fetch_candles.py SPY
  python3 scripts/fetch_candles.py AAPL 5m 60d
  python3 scripts/fetch_candles.py IBIT 1d 1y
"""

import sys
import yfinance as yf
import json
import os

symbol   = sys.argv[1].upper() if len(sys.argv) > 1 else None
interval = sys.argv[2] if len(sys.argv) > 2 else "1m"
period   = sys.argv[3] if len(sys.argv) > 3 else "7d"

if not symbol:
    print("Error: SYMBOL is required.\n")
    print(__doc__)
    sys.exit(1)

print(f"Fetching {symbol} @ {interval} for {period}...")

ticker = yf.Ticker(symbol)
df = ticker.history(period=period, interval=interval)

if df.empty:
    print(f"No data returned for {symbol}. Check the symbol or interval/period limits.")
    sys.exit(1)

df.index = df.index.tz_convert("UTC")
start_str = df.index[0].strftime("%Y%m%d")
end_str   = df.index[-1].strftime("%Y%m%d")

candles = []
for ts, row in df.iterrows():
    candles.append({
        "timestamp": int(ts.timestamp() * 1000),
        "open":   round(float(row["Open"]),   2),
        "high":   round(float(row["High"]),   2),
        "low":    round(float(row["Low"]),    2),
        "close":  round(float(row["Close"]),  2),
        "volume": int(row["Volume"])
    })

out_dir = os.path.join(os.path.dirname(__file__), "..", "data")
filename = os.path.join(out_dir, f"{symbol}_{interval}_{start_str}_{end_str}.json")

with open(filename, "w") as f:
    json.dump(candles, f, indent=2)

print(f"Saved {len(candles)} candles -> {filename}")
