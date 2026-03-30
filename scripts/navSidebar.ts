/// <reference types="node" />
import * as fs from 'fs';

function formatDate(yyyymmdd: string): string {
    const year  = parseInt(yyyymmdd.slice(0, 4), 10);
    const month = parseInt(yyyymmdd.slice(4, 6), 10) - 1;
    const day   = parseInt(yyyymmdd.slice(6, 8), 10);
    return new Date(year, month, day).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

function formatFileName(name: string): string {
    // TICKER_TIMEFRAME_YYYYMMDD_YYYYMMDD_zones.html
    const zonesMatch = name.match(/^([A-Za-z]+)_(\w+?)_(\d{8})_(\d{8})_zones\.html$/i);
    if (zonesMatch) {
        const [, ticker, timeframe, from, to] = zonesMatch;
        return `${ticker.toUpperCase()} · ${timeframe} · ${formatDate(from)} – ${formatDate(to)}`;
    }
    if (name === 'testCases.html') return 'Test Cases';
    // fallback: strip .html, split on _ or camelCase boundaries, title-case
    return name
        .replace(/\.html$/, '')
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export function buildNavSidebar(
    exampleDir: string,
    currentFileName: string,
): { css: string; html: string; js: string } {
    let files: string[] = [];
    try {
        files = fs.readdirSync(exampleDir)
            .filter(f => f.endsWith('.html'))
            .sort();
    } catch {
        // exampleDir may not exist yet — return an empty list
    }
    // Ensure the current file is included even if it hasn't been written yet
    if (currentFileName && !files.includes(currentFileName)) {
        files = [...files, currentFileName].sort();
    }

    const items = files.map(f => {
        const label  = formatFileName(f);
        const active = f === currentFileName;
        const cls    = active ? ' class="nav-item--active"' : '';
        return `        <li${cls}><a class="nav-link" href="./${f}">${label}</a></li>`;
    }).join('\n');

    const css = `
        /* ── sidebar navigation ─────────────────────────────────────────── */
        body > h1 { margin-left: 44px; }
        #nav-toggle {
            position: fixed; top: 14px; left: 14px; z-index: 1001;
            background: none; border: none; color: #888;
            width: 36px; height: 36px; font-size: 20px;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            line-height: 1; padding: 0;
            transition: color 0.15s;
        }
        #nav-toggle:hover { color: #fff; }
        #nav-backdrop {
            display: none; position: fixed; inset: 0; z-index: 1002;
            background: rgba(0,0,0,0.45);
        }
        #nav-backdrop.open { display: block; }
        #nav-sidebar {
            position: fixed; left: 0; top: 0; height: 100%; width: 260px;
            z-index: 1003; background: #0f0f1f; border-right: 1px solid #2a2a3e;
            box-shadow: 2px 0 16px rgba(0,0,0,0.6);
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            display: flex; flex-direction: column; overflow: hidden;
        }
        #nav-sidebar.open { transform: translateX(0); }
        #nav-header {
            padding: 16px 16px 12px; font-size: 0.75em; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase; color: #666;
            border-bottom: 1px solid #1e1e30; flex-shrink: 0;
        }
        #nav-list {
            list-style: none; margin: 0; padding: 8px 0;
            overflow-y: auto; flex: 1;
        }
        #nav-list::-webkit-scrollbar { width: 4px; }
        #nav-list::-webkit-scrollbar-track { background: transparent; }
        #nav-list::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        .nav-link {
            display: block; padding: 8px 16px; font-size: 0.82em; color: #999;
            text-decoration: none; line-height: 1.4;
            transition: background 0.12s, color 0.12s;
        }
        .nav-link:hover { background: rgba(255,255,255,0.05); color: #ddd; }
        .nav-item--active .nav-link {
            background: rgba(100,100,200,0.22); color: #c8c8ff; font-weight: 600;
            border-left: 3px solid rgba(120,120,220,0.8); padding-left: 13px;
        }`;

    const html = `
    <button id="nav-toggle" title="Browse example files">&#9776;</button>
    <div id="nav-backdrop"></div>
    <nav id="nav-sidebar" role="navigation" aria-label="Example files">
        <div id="nav-header">Example Files</div>
        <ul id="nav-list">
${items}
        </ul>
    </nav>`;

    const js = `
    (function () {
        var toggle   = document.getElementById('nav-toggle');
        var sidebar  = document.getElementById('nav-sidebar');
        var backdrop = document.getElementById('nav-backdrop');
        function openNav()  { sidebar.classList.add('open'); backdrop.classList.add('open'); }
        function closeNav() { sidebar.classList.remove('open'); backdrop.classList.remove('open'); }
        toggle.addEventListener('click', function () {
            sidebar.classList.contains('open') ? closeNav() : openNav();
        });
        backdrop.addEventListener('click', closeNav);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeNav();
        });
    })();`;

    return { css, html, js };
}
