/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { identifyZones } from '../lib/identifyZones';
import { filterFreshZones } from '../lib/filterFreshZones';
import { rvol } from '../lib';
import { Candle, SupplyZone, DemandZone } from '../types';
import { buildNavSidebar } from './navSidebar';

const inputPath  = process.argv[2] ?? path.resolve(__dirname, '../data/SPX_Candles.json');

const defaultOutputName = path.basename(inputPath, '.json') + '_zones.html';
const outputPath = process.argv[3] ?? path.resolve(__dirname, '../example', defaultOutputName);

let candles!: Candle[];

try {
    const raw = fs.readFileSync(path.resolve(inputPath), 'utf-8');
    candles = JSON.parse(raw);
} catch (error) {
    console.error('Error reading candle file:', error);
    process.exit(1);
}

const { supplyZones, demandZones } = identifyZones(candles);
const { supplyZones: freshSupply, demandZones: freshDemand } = filterFreshZones(supplyZones, demandZones);
const staleRemoved = (supplyZones.length - freshSupply.length) + (demandZones.length - freshDemand.length);

console.log(`Supply zones identified: ${supplyZones.length} (${freshSupply.length} fresh)`);
console.log(`Demand zones identified: ${demandZones.length} (${freshDemand.length} fresh)`);
if (staleRemoved > 0) console.log(`Stale zones removed by freshness filter: ${staleRemoved}`);

// Build timestamp → index map to eliminate overnight/weekend gaps
const timestampToIndex = new Map<number, number>(
    candles.map((c, i) => [c.timestamp, i])
);

const tickLabels = candles.map(c => {
    const d = new Date(c.timestamp);
    return d.toLocaleString('en-US', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
        hour12: false, timeZone: 'America/New_York',
    });
});

// ECharts candlestick data format: [open, close, low, high]
const candleData = candles.map(c => [c.open, c.close, c.low, c.high]);

// Volume data — only present if candles have a volume field
const hasVolume = candles.some(c => (c as any).volume != null);
const volumeData = hasVolume
    ? candles.map(c => ({
        value: (c as any).volume as number,
        itemStyle: { color: c.close >= c.open ? 'rgba(75,192,75,0.5)' : 'rgba(255,99,132,0.5)' },
    }))
    : [];

// RVOL data — computed from prior-N average
const rvolValues = hasVolume ? rvol(candles) : [];
const rvolData = rvolValues.map(v => parseFloat(v.toFixed(2)));

// Breach detection: a zone is no longer fresh once price's extreme wicks through its distal line.
const lastIdx = candles.length - 1;

function findBreachIndex(startIdx: number, distalLine: number, isBullishZone: boolean): number {
    for (let i = startIdx + 1; i <= lastIdx; i++) {
        if (isBullishZone ? candles[i].low < distalLine : candles[i].high > distalLine) return i;
    }
    return lastIdx;
}

const intactSupply = freshSupply.filter(z => {
    const endIdx = timestampToIndex.get(z.endTimestamp) ?? 0;
    return findBreachIndex(endIdx, z.distalLine, false) === lastIdx;
});
const intactDemand = freshDemand.filter(z => {
    const endIdx = timestampToIndex.get(z.endTimestamp) ?? 0;
    return findBreachIndex(endIdx, z.distalLine, true) === lastIdx;
});
const breachedRemoved = (freshSupply.length - intactSupply.length) + (freshDemand.length - intactDemand.length);

// ECharts markArea data: each zone is a pair of corner objects with x/y + itemStyle
// Zone fill opacity is scaled by confidence: low confidence (0) → faint, high (1) → solid
const supplyMarkData = intactSupply.map(z => {
    const alpha = (0.06 + z.confidence * 0.34).toFixed(2);
    return [
        {
            xAxis: timestampToIndex.get(z.startTimestamp) ?? 0,
            yAxis: z.proximalLine,
            itemStyle: { color: `rgba(255, 99, 132, ${alpha})`, borderColor: 'rgba(255, 99, 132, 0.7)', borderWidth: 1 },
        },
        {
            xAxis: timestampToIndex.get(z.endTimestamp) ?? 0,
            yAxis: z.distalLine,
        },
    ];
});

const demandMarkData = intactDemand.map(z => {
    const alpha = (0.06 + z.confidence * 0.34).toFixed(2);
    return [
        {
            xAxis: timestampToIndex.get(z.startTimestamp) ?? 0,
            yAxis: z.proximalLine,
            itemStyle: { color: `rgba(75, 192, 75, ${alpha})`, borderColor: 'rgba(75, 192, 75, 0.7)', borderWidth: 1 },
        },
        {
            xAxis: timestampToIndex.get(z.endTimestamp) ?? 0,
            yAxis: z.distalLine,
        },
    ];
});

// Rays rendered as individual line series so they stay visible during dataZoom.
// Only intact zones are shown — breached zones are removed entirely.
function letterGrade(c: number): string {
    if (c >= 0.97) return 'A+';
    if (c >= 0.93) return 'A';
    if (c >= 0.90) return 'A-';
    if (c >= 0.87) return 'B+';
    if (c >= 0.83) return 'B';
    if (c >= 0.80) return 'B-';
    if (c >= 0.77) return 'C+';
    if (c >= 0.73) return 'C';
    if (c >= 0.70) return 'C-';
    if (c >= 0.67) return 'D+';
    if (c >= 0.63) return 'D';
    if (c >= 0.60) return 'D-';
    return 'F';
}

const raySeries = [
    ...intactSupply.map(z => {
        const endIdx = timestampToIndex.get(z.endTimestamp) ?? 0;
        const lineAlpha = (0.35 + z.confidence * 0.55).toFixed(2);
        const color = `rgba(255, 99, 132, ${lineAlpha})`;
        return [
            {
                name: `${z.proximalLine.toFixed(2)}  ${letterGrade(z.confidence)} (${z.confidence.toFixed(2)})`,
                type: 'line', xAxisIndex: 0, yAxisIndex: 0,
                silent: true, animation: false, symbol: 'none', legendHoverLink: false,
                tooltip: { show: false },
                lineStyle: { color, type: 'solid', width: 1 },
                endLabel: { show: true, formatter: '{a}', color, fontSize: 10 },
                data: [[endIdx, z.proximalLine], [lastIdx, z.proximalLine]],
            },
            {
                name: '',
                type: 'line', xAxisIndex: 0, yAxisIndex: 0,
                silent: true, animation: false, symbol: 'none', legendHoverLink: false,
                tooltip: { show: false },
                lineStyle: { color, type: 'dashed', width: 1 },
                data: [[endIdx, z.distalLine], [lastIdx, z.distalLine]],
            },
        ];
    }).flat(),
    ...intactDemand.map(z => {
        const endIdx = timestampToIndex.get(z.endTimestamp) ?? 0;
        const lineAlpha = (0.35 + z.confidence * 0.55).toFixed(2);
        const color = `rgba(75, 192, 75, ${lineAlpha})`;
        return [
            {
                name: `${z.proximalLine.toFixed(2)}  ${letterGrade(z.confidence)} (${z.confidence.toFixed(2)})`,
                type: 'line', xAxisIndex: 0, yAxisIndex: 0,
                silent: true, animation: false, symbol: 'none', legendHoverLink: false,
                tooltip: { show: false },
                lineStyle: { color, type: 'solid', width: 1 },
                endLabel: { show: true, formatter: '{a}', color, fontSize: 10 },
                data: [[endIdx, z.proximalLine], [lastIdx, z.proximalLine]],
            },
            {
                name: '',
                type: 'line', xAxisIndex: 0, yAxisIndex: 0,
                silent: true, animation: false, symbol: 'none', legendHoverLink: false,
                tooltip: { show: false },
                lineStyle: { color, type: 'dashed', width: 1 },
                data: [[endIdx, z.distalLine], [lastIdx, z.distalLine]],
            },
        ];
    }).flat(),
];

// Default zoom: show last ~500 candles so detail is visible on large datasets
const showLast = Math.min(500, candles.length);
const zoomStart = Math.max(0, Math.round((1 - showLast / candles.length) * 100));

const { css: navCss, html: navHtml, js: navJs } = buildNavSidebar(
    path.dirname(outputPath),
    path.basename(outputPath),
);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supply &amp; Demand Zones</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; background: #1a1a2e; color: #eee; padding: 20px; }
        h1 { margin-bottom: 4px; font-size: 1.2em; }
        .subtitle { color: #aaa; margin-bottom: 8px; font-size: 0.85em; }
        .legend { display: flex; gap: 20px; margin-bottom: 12px; }
        .legend-item { display: flex; align-items: center; gap: 6px; font-size: 0.8em; }
        .swatch { width: 14px; height: 14px; border-radius: 2px; }
        .supply-swatch { background: rgba(255,99,132,0.4); border: 1px solid rgba(255,99,132,0.9); }
        .demand-swatch { background: rgba(75,192,75,0.4); border: 1px solid rgba(75,192,75,0.9); }
        .hint { color: #666; font-size: 0.75em; margin-bottom: 12px; }
        #chart { width: 100%; height: calc(100vh - 120px); min-height: 500px; }
        ${navCss}
    </style>
</head>
<body>
    ${navHtml}
    <h1>Supply &amp; Demand Zones</h1>
    <p class="subtitle">
        ${candles.length} candles &nbsp;|&nbsp;
        ${intactSupply.length} supply zone${intactSupply.length !== 1 ? 's' : ''} &nbsp;|&nbsp;
        ${intactDemand.length} demand zone${intactDemand.length !== 1 ? 's' : ''}
        ${staleRemoved > 0 ? `&nbsp;|&nbsp; <span style="color:#888">${staleRemoved} stale removed</span>` : ''}
        ${breachedRemoved > 0 ? `&nbsp;|&nbsp; <span style="color:#888">${breachedRemoved} breached removed</span>` : ''}
    </p>
    <div class="legend">
        <div class="legend-item"><div class="swatch supply-swatch"></div>Supply zone</div>
        <div class="legend-item"><div class="swatch demand-swatch"></div>Demand zone</div>
        <div class="legend-item" style="color:#888">Opacity reflects confidence (0–1)</div>
    </div>
    <p class="hint">Scroll to zoom &nbsp;·&nbsp; Drag to pan &nbsp;·&nbsp; Use slider below chart to navigate</p>
    <div id="chart"></div>
    <script>
        const tickLabels = ${JSON.stringify(tickLabels)};
        const candleData = ${JSON.stringify(candleData)};
        const volumeData = ${JSON.stringify(volumeData)};
        const rvolData = ${JSON.stringify(rvolData)};
        const hasVolume = ${hasVolume};
        const supplyMarkData = ${JSON.stringify(supplyMarkData)};
        const demandMarkData = ${JSON.stringify(demandMarkData)};
        const raySeries = ${JSON.stringify(raySeries)};

        const chart = echarts.init(document.getElementById('chart'), null, { renderer: 'canvas' });

        // When volume is present, split into three grids: price (top ~60%), volume (middle ~14%), RVOL (bottom ~14%)
        const priceGrid   = hasVolume
            ? { left: 12, right: 70, top: 16, bottom: 210 }
            : { left: 12, right: 70, top: 16, bottom: 70 };
        const volumeGrid  = { left: 12, right: 70, top: '64%', bottom: 145 };
        const rvolGrid    = { left: 12, right: 70, top: '80%', bottom: 70 };

        const xAxes = hasVolume
            ? [
                { type: 'category', data: tickLabels, gridIndex: 0, axisLabel: { show: false }, axisLine: { lineStyle: { color: '#333' } }, splitLine: { show: false } },
                { type: 'category', data: tickLabels, gridIndex: 1, axisLabel: { show: false }, axisLine: { lineStyle: { color: '#333' } }, splitLine: { show: false } },
                { type: 'category', data: tickLabels, gridIndex: 2, axisLabel: { color: '#888', fontSize: 10, rotate: 30, interval: 'auto' }, axisLine: { lineStyle: { color: '#333' } }, splitLine: { show: false } },
            ]
            : [{ type: 'category', data: tickLabels, axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#888', fontSize: 10, rotate: 30, interval: 'auto' }, splitLine: { show: false } }];

        const yAxes = hasVolume
            ? [
                { scale: true, gridIndex: 0, position: 'right', axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#888', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } },
                { scale: false, gridIndex: 1, position: 'right', axisLabel: { show: false }, axisLine: { show: false }, splitLine: { show: false } },
                { min: 0, gridIndex: 2, position: 'right', axisLine: { show: false }, axisLabel: { color: '#888', fontSize: 9 }, splitLine: { show: false } },
            ]
            : [{ scale: true, position: 'right', axisLine: { lineStyle: { color: '#333' } }, axisLabel: { color: '#888', fontSize: 11 }, splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } } }];

        const dataZoomTargets = hasVolume ? [0, 1, 2] : [0];

        const series = [
            {
                name: 'Price',
                type: 'candlestick',
                xAxisIndex: 0,
                yAxisIndex: 0,
                data: candleData,
                itemStyle: {
                    color: '#4bc04b',
                    color0: '#ff6384',
                    borderColor: '#4bc04b',
                    borderColor0: '#ff6384',
                },
                markArea: {
                    silent: true,
                    data: [...supplyMarkData, ...demandMarkData],
                },
            },
            ...(hasVolume ? [{
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                data: volumeData,
                barMaxWidth: 6,
            }, {
                name: 'RVOL',
                type: 'line',
                xAxisIndex: 2,
                yAxisIndex: 2,
                data: rvolData,
                symbol: 'none',
                lineStyle: { color: 'rgba(100,160,255,0.85)', width: 1.5 },
                areaStyle: { color: 'rgba(100,160,255,0.08)' },
                markLine: {
                    silent: true,
                    symbol: 'none',
                    lineStyle: { color: 'rgba(255,255,255,0.35)', type: 'dashed', width: 1 },
                    label: { show: true, position: 'end', color: '#888', fontSize: 9, formatter: '1.0×' },
                    data: [{ yAxis: 1 }],
                },
            }] : []),
            ...raySeries,
        ];

        chart.setOption({
            backgroundColor: '#1a1a2e',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross' },
                backgroundColor: 'rgba(20,20,40,0.95)',
                borderColor: '#444',
                textStyle: { color: '#eee', fontSize: 12 },
                formatter: (params) => {
                    const price = params.find(p => p.seriesName === 'Price');
                    const vol   = params.find(p => p.seriesName === 'Volume');
                    const rvolP = params.find(p => p.seriesName === 'RVOL');
                    if (!price) return '';
                    const [o, c, h, l] = price.data; // ECharts returns [open, close, highest, lowest] in params.data
                    const label = tickLabels[price.dataIndex] ?? '';
                    const color = c >= o ? '#4bc04b' : '#ff6384';
                    const volLine  = vol   ? \`<br/>Vol: <span style="color:#aaa">\${Number(vol.data.value).toLocaleString()}</span>\` : '';
                    const rvolLine = rvolP ? \`<br/>RVOL: <span style="color:#aaa">\${Number(rvolP.data).toFixed(2)}×</span>\` : '';
                    return \`<b>\${label}</b><br/>
                        O: <span style="color:\${color}">\${o}</span>&nbsp;
                        H: <span style="color:\${color}">\${h}</span>&nbsp;
                        L: <span style="color:\${color}">\${l}</span>&nbsp;
                        C: <span style="color:\${color}">\${c}</span>\${volLine}\${rvolLine}\`;
                },
            },
            dataZoom: [
                { type: 'inside', xAxisIndex: dataZoomTargets, start: ${zoomStart}, end: 100, minSpan: 1 },
                {
                    type: 'slider', xAxisIndex: dataZoomTargets, start: ${zoomStart}, end: 100,
                    bottom: 8, height: 24,
                    borderColor: '#333', fillerColor: 'rgba(100,100,180,0.15)',
                    textStyle: { color: '#666', fontSize: 10 },
                    handleStyle: { color: '#555' },
                    moveHandleStyle: { color: '#555' },
                    selectedDataBackground: {
                        lineStyle: { color: '#555' },
                        areaStyle: { color: '#333' },
                    },
                },
            ],
            grid: hasVolume ? [priceGrid, volumeGrid, rvolGrid] : priceGrid,
            xAxis: xAxes,
            yAxis: yAxes,
            series,
        });

        window.addEventListener('resize', () => chart.resize());
    </script>
    <script>${navJs}
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
