/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import { identifyZones } from '../lib/identifyZones';
import { Candle, SupplyZone, DemandZone } from '../types';
import { buildNavSidebar } from './navSidebar';

const outputPath = process.argv[2] ?? path.resolve(__dirname, '../example/testCases.html');

// ─── Candle fixtures (mirrors test files) ────────────────────────────────────

// Drop patterns: pair of decisive drops, each opening near the previous close
const bearishDecisive1  = (ts: number): Candle => ({ open: 150, close: 132, high: 152, low: 126, timestamp: ts }); // body=18, range=26, ratio=0.692 → decisive bearish
const bearishDecisive2  = (ts: number): Candle => ({ open: 133, close: 118, high: 135, low: 112, timestamp: ts }); // body=15, range=23, ratio=0.652 → decisive bearish; opens near prior close
const indecisiveForDrop1 = (ts: number): Candle => ({ open: 119, close: 118, high: 121, low: 116, timestamp: ts }); // body=1, range=5, ratio=0.2 → indecisive (drop base)
const indecisiveForDrop2 = (ts: number): Candle => ({ open: 118, close: 119, high: 120, low: 117, timestamp: ts }); // body=1, range=3, ratio=0.333 → indecisive; opens near prior close
const bearishExplosive1 = (ts: number): Candle => ({ open: 117, close:  95, high: 118, low:  94, timestamp: ts }); // body=22, range=24, ratio=0.917 → explosive bearish; opens at base low
const bearishExplosive2 = (ts: number): Candle => ({ open:  96, close:  75, high:  97, low:  74, timestamp: ts }); // body=21, range=23, ratio=0.913 → explosive bearish; opens near prior close
const bullishExplosiveFromDrop1 = (ts: number): Candle => ({ open: 117, close: 138, high: 140, low: 116, timestamp: ts }); // body=21, range=24, ratio=0.875 → explosive bullish; opens at base low
const bullishExplosiveFromDrop2 = (ts: number): Candle => ({ open: 138, close: 158, high: 160, low: 137, timestamp: ts }); // body=20, range=23, ratio=0.870 → explosive bullish; opens near prior close
// Rally patterns: pair of decisive rallies, each opening near the previous close
const bullishDecisive1  = (ts: number): Candle => ({ open:  82, close:  98, high: 104, low:  78, timestamp: ts }); // body=16, range=26, ratio=0.615 → decisive bullish
const bullishDecisive2  = (ts: number): Candle => ({ open:  97, close: 114, high: 118, low:  93, timestamp: ts }); // body=17, range=25, ratio=0.68  → decisive bullish; opens near prior close
const indecisiveForRally1 = (ts: number): Candle => ({ open: 115, close: 114, high: 117, low: 112, timestamp: ts }); // body=1, range=5, ratio=0.2 → indecisive (rally base)
const indecisiveForRally2 = (ts: number): Candle => ({ open: 114, close: 115, high: 116, low: 113, timestamp: ts }); // body=1, range=3, ratio=0.333 → indecisive; opens near prior close
const bearishExplosiveFromRally1 = (ts: number): Candle => ({ open: 116, close:  91, high: 118, low:  90, timestamp: ts }); // body=25, range=28, ratio=0.893 → explosive bearish; opens at base high
const bearishExplosiveFromRally2 = (ts: number): Candle => ({ open:  92, close:  70, high:  93, low:  69, timestamp: ts }); // body=22, range=24, ratio=0.917 → explosive bearish; opens near prior close
const bullishExplosive1 = (ts: number): Candle => ({ open: 116, close: 141, high: 143, low: 115, timestamp: ts }); // body=25, range=28, ratio=0.893 → explosive bullish; opens at base high
const bullishExplosive2 = (ts: number): Candle => ({ open: 140, close: 163, high: 165, low: 139, timestamp: ts }); // body=23, range=26, ratio=0.885 → explosive bullish; opens near prior close
// Alias for identifyZones combined test cases
const indecisive = indecisiveForDrop1;

// Custom base candles for proximalLine / distalLine tests
// Drop-pattern bases (~118–122 range, following bearishDecisive close=130)
const hiBaseForDrop = (ts: number): Candle => ({ open: 120, close: 121, high: 126, low: 119, timestamp: ts }); // body=1, range=7 → indecisive; high end of drop base
const loBaseForDrop = (ts: number): Candle => ({ open: 121, close: 120, high: 124, low: 116, timestamp: ts }); // body=1, range=8 → indecisive; low end of drop base
// Rally-pattern bases (~100–104 range, following bullishDecisive close=100)
const hiBaseForRally = (ts: number): Candle => ({ open: 101, close: 102, high: 108, low: 100, timestamp: ts }); // body=1, range=8 → indecisive; high end of rally base
const loBaseForRally = (ts: number): Candle => ({ open: 102, close: 103, high: 105, low:  96, timestamp: ts }); // body=1, range=9 → indecisive; low end of rally base

// ─── Test case definitions ────────────────────────────────────────────────────

type TestCase = {
    group: string;
    title: string;
    candles: Candle[];
};

const testCases: TestCase[] = [
    // ── dropBaseDrop (supply) ────────────────────────────────────────────────
    {
        group: 'dropBaseDrop',
        title: 'Too short (5 candles) → null',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bearishExplosive1(5)],
    },
    {
        group: 'dropBaseDrop',
        title: 'No bearish decisive start → null',
        candles: [indecisiveForDrop1(1), indecisiveForDrop2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bearishExplosive1(5), bearishExplosive2(6)],
    },
    {
        group: 'dropBaseDrop',
        title: 'Base too short (1 candle) → null',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), bearishExplosive1(4), bearishExplosive2(5), bearishExplosive2(6)],
    },
    {
        group: 'dropBaseDrop',
        title: 'No bearish explosive end → null',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), indecisiveForDrop1(5), indecisiveForDrop2(6)],
    },
    {
        group: 'dropBaseDrop',
        title: 'Valid drop-base-drop ✓',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bearishExplosive1(5), bearishExplosive2(6)],
    },
    {
        group: 'dropBaseDrop',
        title: 'Custom base: proximal=116, distal=126 ✓',
        candles: [bearishDecisive1(1), bearishDecisive2(2), hiBaseForDrop(3), loBaseForDrop(4), bearishExplosive1(5), bearishExplosive2(6)],
    },

    // ── dropBaseRally (demand) ───────────────────────────────────────────────
    {
        group: 'dropBaseRally',
        title: 'Too short (5 candles) → null',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bullishExplosiveFromDrop1(5)],
    },
    {
        group: 'dropBaseRally',
        title: 'No bearish decisive start → null',
        candles: [indecisiveForDrop1(1), indecisiveForDrop2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bullishExplosiveFromDrop1(5), bullishExplosiveFromDrop2(6)],
    },
    {
        group: 'dropBaseRally',
        title: 'Base too short (1 candle) → null',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), bullishExplosiveFromDrop1(4), bullishExplosiveFromDrop2(5), bullishExplosiveFromDrop2(6)],
    },
    {
        group: 'dropBaseRally',
        title: 'No bullish explosive end → null',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), indecisiveForDrop1(5), indecisiveForDrop2(6)],
    },
    {
        group: 'dropBaseRally',
        title: 'Valid drop-base-rally ✓',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bullishExplosiveFromDrop1(5), bullishExplosiveFromDrop2(6)],
    },
    {
        group: 'dropBaseRally',
        title: 'Custom base: proximal=126, distal=116 ✓',
        candles: [bearishDecisive1(1), bearishDecisive2(2), hiBaseForDrop(3), loBaseForDrop(4), bullishExplosiveFromDrop1(5), bullishExplosiveFromDrop2(6)],
    },

    // ── rallyBaseDrop (supply) ───────────────────────────────────────────────
    {
        group: 'rallyBaseDrop',
        title: 'Too short (5 candles) → null',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), bearishExplosiveFromRally1(5)],
    },
    {
        group: 'rallyBaseDrop',
        title: 'No bullish decisive start → null',
        candles: [indecisiveForRally1(1), indecisiveForRally2(2), indecisiveForRally1(3), indecisiveForRally2(4), bearishExplosiveFromRally1(5), bearishExplosiveFromRally2(6)],
    },
    {
        group: 'rallyBaseDrop',
        title: 'Base too short (1 candle) → null',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), bearishExplosiveFromRally1(4), bearishExplosiveFromRally2(5), bearishExplosiveFromRally2(6)],
    },
    {
        group: 'rallyBaseDrop',
        title: 'No bearish explosive end → null',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), indecisiveForRally1(5), indecisiveForRally2(6)],
    },
    {
        group: 'rallyBaseDrop',
        title: 'Valid rally-base-drop ✓',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), bearishExplosiveFromRally1(5), bearishExplosiveFromRally2(6)],
    },
    {
        group: 'rallyBaseDrop',
        title: 'Custom base: proximal=96, distal=108 ✓',
        candles: [bullishDecisive1(1), bullishDecisive2(2), hiBaseForRally(3), loBaseForRally(4), bearishExplosiveFromRally1(5), bearishExplosiveFromRally2(6)],
    },

    // ── rallyBaseRally (demand) ──────────────────────────────────────────────
    {
        group: 'rallyBaseRally',
        title: 'Too short (5 candles) → null',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), bullishExplosive1(5)],
    },
    {
        group: 'rallyBaseRally',
        title: 'No bullish decisive start → null',
        candles: [indecisiveForRally1(1), indecisiveForRally2(2), indecisiveForRally1(3), indecisiveForRally2(4), bullishExplosive1(5), bullishExplosive2(6)],
    },
    {
        group: 'rallyBaseRally',
        title: 'Base too short (1 candle) → null',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), bullishExplosive1(4), bullishExplosive2(5), bullishExplosive2(6)],
    },
    {
        group: 'rallyBaseRally',
        title: 'No bullish explosive end → null',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), indecisiveForRally1(5), indecisiveForRally2(6)],
    },
    {
        group: 'rallyBaseRally',
        title: 'Valid rally-base-rally ✓',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), bullishExplosive1(5), bullishExplosive2(6)],
    },
    {
        group: 'rallyBaseRally',
        title: 'Custom base: proximal=108, distal=96 ✓',
        candles: [bullishDecisive1(1), bullishDecisive2(2), hiBaseForRally(3), loBaseForRally(4), bullishExplosive1(5), bullishExplosive2(6)],
    },

    // ── identifyZones (multi-pattern) ────────────────────────────────────────
    {
        group: 'identifyZones',
        title: 'Empty candle list → no zones',
        candles: [],
    },
    {
        group: 'identifyZones',
        title: 'All indecisive → no zones',
        candles: Array.from({ length: 6 }, (_, i) => indecisive(i + 1)),
    },
    {
        group: 'identifyZones',
        title: 'drop-base-drop supply zone ✓',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bearishExplosive1(5), bearishExplosive2(6)],
    },
    {
        group: 'identifyZones',
        title: 'drop-base-rally demand zone ✓',
        candles: [bearishDecisive1(1), bearishDecisive2(2), indecisiveForDrop1(3), indecisiveForDrop2(4), bullishExplosiveFromDrop1(5), bullishExplosiveFromDrop2(6)],
    },
    {
        group: 'identifyZones',
        title: 'rally-base-drop supply zone ✓',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), bearishExplosiveFromRally1(5), bearishExplosiveFromRally2(6)],
    },
    {
        group: 'identifyZones',
        title: 'rally-base-rally demand zone ✓',
        candles: [bullishDecisive1(1), bullishDecisive2(2), indecisiveForRally1(3), indecisiveForRally2(4), bullishExplosive1(5), bullishExplosive2(6)],
    },
    {
        group: 'identifyZones',
        title: 'DBD supply + DBR demand in sequence ✓',
        candles: [
            bearishDecisive1(1),       bearishDecisive2(2),
            indecisiveForDrop1(3),     indecisiveForDrop2(4),
            bearishExplosive1(5),      bearishExplosive2(6),
            bearishDecisive1(7),       bearishDecisive2(8),
            indecisiveForDrop1(9),     indecisiveForDrop2(10),
            bullishExplosiveFromDrop1(11), bullishExplosiveFromDrop2(12),
        ],
    },
];

// ─── Build per-case chart data ────────────────────────────────────────────────

// Test candle timestamps are small integers (1–12). Multiply by one day (ms)
// so chartjs-adapter-date-fns renders them on a proper time scale.
const DAY_MS = 86_400_000;

type ChartCase = {
    group: string;
    title: string;
    chartData: { x: number; o: number; h: number; l: number; c: number }[];
    annotations: object[];
    supplyCount: number;
    demandCount: number;
};

function buildAnnotations(supply: SupplyZone[], demand: DemandZone[]): object[] {
    return [
        ...supply.map((z, i) => ({
            type: 'box',
            xMin: z.startTimestamp * DAY_MS,
            xMax: z.endTimestamp * DAY_MS,
            yMin: z.proximalLine,
            yMax: z.distalLine,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 0.9)',
            borderWidth: 1,
            label: {
                display: true,
                content: `S${i + 1}`,
                position: 'start',
                color: 'rgba(255, 99, 132, 1)',
                font: { size: 9 },
            },
        })),
        ...demand.map((z, i) => ({
            type: 'box',
            xMin: z.startTimestamp * DAY_MS,
            xMax: z.endTimestamp * DAY_MS,
            yMin: z.proximalLine,
            yMax: z.distalLine,
            backgroundColor: 'rgba(75, 192, 75, 0.2)',
            borderColor: 'rgba(75, 192, 75, 0.9)',
            borderWidth: 1,
            label: {
                display: true,
                content: `D${i + 1}`,
                position: 'start',
                color: 'rgba(75, 192, 75, 1)',
                font: { size: 9 },
            },
        })),
    ];
}

const chartCases: ChartCase[] = testCases.map(tc => {
    const { supplyZones, demandZones } = identifyZones(tc.candles);
    return {
        group: tc.group,
        title: tc.title,
        chartData: tc.candles.map(c => ({
            x: c.timestamp * DAY_MS,
            o: c.open,
            h: c.high,
            l: c.low,
            c: c.close,
        })),
        annotations: buildAnnotations(supplyZones, demandZones),
        supplyCount: supplyZones.length,
        demandCount: demandZones.length,
    };
});

// ─── Group by pattern ─────────────────────────────────────────────────────────

const groups = [...new Set(chartCases.map(c => c.group))];

const groupMeta: Record<string, { label: string; direction: string }> = {
    dropBaseDrop:  { label: 'Drop → Base → Drop',   direction: 'supply' },
    dropBaseRally: { label: 'Drop → Base → Rally',   direction: 'demand' },
    rallyBaseDrop: { label: 'Rally → Base → Drop',   direction: 'supply' },
    rallyBaseRally:{ label: 'Rally → Base → Rally',  direction: 'demand' },
    identifyZones: { label: 'identifyZones (combined)', direction: 'both' },
};

// ─── HTML template ────────────────────────────────────────────────────────────

const totalCases = chartCases.length;
const totalFound = chartCases.filter(c => c.supplyCount + c.demandCount > 0).length;

const groupSections = groups.map(group => {
    const cases = chartCases.filter(c => c.group === group);
    const meta  = groupMeta[group] ?? { label: group, direction: 'both' };

    const dirBadge = meta.direction === 'supply'
        ? `<span class="dir supply-dir">Supply</span>`
        : meta.direction === 'demand'
        ? `<span class="dir demand-dir">Demand</span>`
        : `<span class="dir both-dir">Supply + Demand</span>`;

    const cards = cases.map((c, idx) => {
        const caseIdx = chartCases.indexOf(c);
        const hasZone = c.supplyCount + c.demandCount > 0;
        const badge   = hasZone
            ? `<span class="badge zone-found">${c.supplyCount + c.demandCount} zone${c.supplyCount + c.demandCount !== 1 ? 's' : ''} found</span>`
            : `<span class="badge no-zone">no zone</span>`;
        const cardClass = hasZone ? 'card' : 'card muted';

        return `
        <div class="${cardClass}">
            <div class="card-header">
                <span class="case-title">${c.title}</span>
                ${badge}
            </div>
            ${c.chartData.length > 0
                ? `<canvas id="chart-${caseIdx}" height="160"></canvas>`
                : `<div class="empty-chart">Empty candle array</div>`
            }
        </div>`;
    }).join('');

    return `
    <section>
        <h2>${meta.label} ${dirBadge}</h2>
        <div class="card-grid">
            ${cards}
        </div>
    </section>`;
}).join('');

const { css: navCss, html: navHtml, js: navJs } = buildNavSidebar(
    path.dirname(outputPath),
    path.basename(outputPath),
);

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Case Visualizations</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-chart-financial"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body { font-family: sans-serif; background: #0f0f1a; color: #ddd; margin: 0; padding: 24px; }
        h1 { margin: 0 0 4px; font-size: 1.4em; }
        .meta { color: #888; font-size: 0.85em; margin-bottom: 28px; }
        section { margin-bottom: 36px; }
        h2 { font-size: 1em; font-weight: 600; margin: 0 0 12px; display: flex; align-items: center; gap: 8px; }
        .dir { font-size: 0.75em; padding: 2px 8px; border-radius: 10px; font-weight: 500; }
        .supply-dir { background: rgba(255,99,132,0.2); color: rgba(255,99,132,1); border: 1px solid rgba(255,99,132,0.4); }
        .demand-dir { background: rgba(75,192,75,0.2); color: rgba(100,220,100,1); border: 1px solid rgba(75,192,75,0.4); }
        .both-dir   { background: rgba(150,150,255,0.2); color: rgba(180,180,255,1); border: 1px solid rgba(150,150,255,0.4); }
        .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }
        .card { background: #1a1a2e; border: 1px solid #2a2a45; border-radius: 8px; padding: 12px; }
        .card.muted { opacity: 0.6; }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
        .case-title { font-size: 0.8em; color: #ccc; line-height: 1.3; }
        .badge { font-size: 0.7em; white-space: nowrap; padding: 2px 7px; border-radius: 10px; font-weight: 600; margin-top: 1px; }
        .badge.zone-found { background: rgba(75,192,75,0.2); color: rgba(100,220,100,1); border: 1px solid rgba(75,192,75,0.4); }
        .badge.no-zone { background: rgba(150,150,150,0.15); color: #888; border: 1px solid rgba(150,150,150,0.3); }
        .empty-chart { height: 80px; display: flex; align-items: center; justify-content: center; color: #555; font-size: 0.8em; font-style: italic; }
        ${navCss}
    </style>
</head>
<body>
    ${navHtml}
    <h1>Test Case Visualizations</h1>
    <p class="meta">${totalCases} test cases &nbsp;|&nbsp; ${totalFound} with zones found &nbsp;|&nbsp; ${totalCases - totalFound} expected null</p>

    ${groupSections}

    <script>
        const cases = ${JSON.stringify(chartCases)};

        cases.forEach((c, i) => {
            if (c.chartData.length === 0) return;
            const canvas = document.getElementById('chart-' + i);
            if (!canvas) return;

            new Chart(canvas, {
                type: 'candlestick',
                data: {
                    datasets: [{
                        label: 'Price',
                        data: c.chartData,
                        color: {
                            up:        'rgba(75,  192,  75, 1)',
                            down:      'rgba(255,  99, 132, 1)',
                            unchanged: 'rgba(200, 200, 200, 1)',
                        },
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        annotation: { annotations: c.annotations },
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: { unit: 'day', displayFormats: { day: 'd' } },
                            ticks: { color: '#666', maxRotation: 0 },
                            grid: { color: 'rgba(255,255,255,0.04)' },
                        },
                        y: {
                            ticks: { color: '#666', font: { size: 10 } },
                            grid: { color: 'rgba(255,255,255,0.04)' },
                        },
                    },
                },
            });
        });
    </script>
    <script>${navJs}
    </script>
</body>
</html>`;

// ─── Write output ─────────────────────────────────────────────────────────────

try {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, html, 'utf-8');
    console.log(`Test case visualizations written to: ${outputPath}`);
    console.log(`  ${totalCases} cases | ${totalFound} with zones | ${totalCases - totalFound} expected null`);
} catch (error) {
    console.error('Error writing output file:', error);
    process.exit(1);
}
