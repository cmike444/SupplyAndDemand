/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { identifyZones } from '../lib/identifyZones';
import { Candle, SupplyZone, DemandZone } from '../types';

const inputPath  = process.argv[2] ?? path.resolve(__dirname, '../data/SPX_Candles.json');
const outputPath = process.argv[3] ?? path.resolve(__dirname, '../example/zones.html');

let candles!: Candle[];

try {
    const raw = fs.readFileSync(path.resolve(inputPath), 'utf-8');
    candles = JSON.parse(raw);
} catch (error) {
    console.error('Error reading candle file:', error);
    process.exit(1);
}

const { supplyZones, demandZones } = identifyZones(candles);

console.log(`Supply zones identified: ${supplyZones.length}`);
console.log(`Demand zones identified: ${demandZones.length}`);

function buildAnnotations(supply: SupplyZone[], demand: DemandZone[]): object[] {
    const annotations: object[] = [];

    supply.forEach((z, i) => {
        annotations.push({
            type: 'box',
            xMin: z.startTimestamp,
            xMax: z.endTimestamp,
            yMin: z.proximalLine,
            yMax: z.distalLine,
            backgroundColor: 'rgba(255, 99, 132, 0.15)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            borderWidth: 1,
            label: {
                display: true,
                content: `S${i + 1}`,
                position: 'start',
                color: 'rgba(255, 99, 132, 1)',
                font: { size: 10 },
            },
        });
    });

    demand.forEach((z, i) => {
        annotations.push({
            type: 'box',
            xMin: z.startTimestamp,
            xMax: z.endTimestamp,
            yMin: z.proximalLine,
            yMax: z.distalLine,
            backgroundColor: 'rgba(75, 192, 75, 0.15)',
            borderColor: 'rgba(75, 192, 75, 0.8)',
            borderWidth: 1,
            label: {
                display: true,
                content: `D${i + 1}`,
                position: 'start',
                color: 'rgba(75, 192, 75, 1)',
                font: { size: 10 },
            },
        });
    });

    return annotations;
}

const annotations = buildAnnotations(supplyZones, demandZones);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supply &amp; Demand Zones</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
    <style>
        body { font-family: sans-serif; background: #1a1a2e; color: #eee; margin: 0; padding: 20px; }
        h1 { margin-bottom: 4px; }
        .subtitle { color: #aaa; margin-bottom: 20px; font-size: 0.9em; }
        .legend { display: flex; gap: 20px; margin-bottom: 16px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.85em; }
        .swatch { width: 14px; height: 14px; border-radius: 2px; }
        .supply-swatch { background: rgba(255,99,132,0.5); border: 1px solid rgba(255,99,132,0.9); }
        .demand-swatch { background: rgba(75,192,75,0.5); border: 1px solid rgba(75,192,75,0.9); }
        canvas { width: 100% !important; }
    </style>
</head>
<body>
    <h1>Supply &amp; Demand Zones</h1>
    <p class="subtitle">
        ${candles.length} candles &nbsp;|&nbsp;
        ${supplyZones.length} supply zone${supplyZones.length !== 1 ? 's' : ''} &nbsp;|&nbsp;
        ${demandZones.length} demand zone${demandZones.length !== 1 ? 's' : ''}
    </p>
    <div class="legend">
        <div class="legend-item"><div class="swatch supply-swatch"></div>Supply zone</div>
        <div class="legend-item"><div class="swatch demand-swatch"></div>Demand zone</div>
    </div>
    <canvas id="chart"></canvas>
    <script>
        const candles = ${JSON.stringify(candles)};
        const annotations = ${JSON.stringify(annotations)};

        const chartData = candles.map(c => ({
            x: c.timestamp,
            o: c.open,
            h: c.high,
            l: c.low,
            c: c.close,
        }));

        new Chart(document.getElementById('chart'), {
            type: 'candlestick',
            data: {
                datasets: [{
                    label: 'Price',
                    data: chartData,
                    color: {
                        up: 'rgba(75, 192, 75, 1)',
                        down: 'rgba(255, 99, 132, 1)',
                        unchanged: 'rgba(200, 200, 200, 1)',
                    },
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    annotation: { annotations },
                },
                scales: {
                    x: {
                        type: 'time',
                        time: { unit: 'day' },
                        ticks: { color: '#aaa' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                    y: {
                        ticks: { color: '#aaa' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                    },
                },
            },
        });
    </script>
</body>
</html>`;

try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`Visualization written to: ${outputPath}`);
} catch (error) {
    console.error('Error writing output file:', error);
    process.exit(1);
}
