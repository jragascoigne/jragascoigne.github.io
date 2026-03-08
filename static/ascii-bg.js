import { gh, li } from './ascii-logos.js';
const canvas = document.getElementById("ascii-bg");
const ctx = canvas.getContext("2d");

const chars = ".,-~=+o*%@#:l|";
const charIndex = {};
[...chars].forEach((c, i) => charIndex[c] = i);

const CELL_W = 6.6;
const CELL_H = 11;
const FADE_SPEED = 0.96;
let RADIUS = 110;
let RADIUS_TARGET = 110;
const GRID_WIDTH_RATIO = 0.4;

let rows, cols;
let heat = [];
let staticChars = [];
let renderChars = [];
let bgChars = [];
let rowWidths = [];

let mouseCol = -999;
let mouseRow = -999;
let targetCol = -999;
let targetRow = -999;

let mouseOverride = false;
let relX = 0;
let relY = 0;

let charSet = 0;
let charDesign = gh;

const charCredits = 'jra.onl|c|john|gascoigne|2026!'.split('').reverse().join('');

function resize() {
    const dpr = window.devicePixelRatio || 1;
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;

    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = `${CELL_H}px monospace`;
    ctx.textBaseline = "top";
    ctx.imageSmoothingEnabled = false;

    rows = Math.ceil(cssH / CELL_H) + 2;
    cols = Math.floor((cssW * GRID_WIDTH_RATIO) / CELL_W);

    heat = Array.from({ length: rows }, () => new Float32Array(cols));
    staticChars = [];
    renderChars = [];
    bgChars = [];
    rowWidths = [];

    for (let y = 0; y < rows; y++) {
        staticChars[y] = [];
        renderChars[y] = [];
        bgChars[y] = [];
        rowWidths[y] = Math.floor(Math.random() * 3);

        for (let x = 0; x < cols; x++) {
            staticChars[y][x] = chars[Math.floor(Math.random() * 8)];
            renderChars[y][x] = chars[0];
            bgChars[y][x] = (x ** y) % 3;
        }
    }
}

window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    if (!mouseOverride) {
        relX = e.clientX - rect.left;
        relY = e.clientY - rect.top;
    }
    targetCol = Math.floor(relX / CELL_W);
    targetRow = Math.floor(relY / CELL_H);
});

const COLOR_LEVELS = 24;

function quantiseIntensity(intensity) {
    return Math.round(intensity * (COLOR_LEVELS - 1)) / (COLOR_LEVELS - 1);
}

function intensityToColour(intensity) {
    const base = 60;
    const r = (base + (154 - base) * intensity) | 0;
    const g = (base + (151 - base) * intensity) | 0;
    const b = (base + (239 - base) * intensity) | 0;
    return `rgb(${r},${g},${b})`;
}

const colourPalette = [];
for (let i = 0; i < COLOR_LEVELS; i++) {
    colourPalette[i] = intensityToColour(i / (COLOR_LEVELS - 1));
}

function render() {
    RADIUS += (RADIUS_TARGET - RADIUS) * 0.1;
    mouseCol += (targetCol - mouseCol) * 0.2;
    mouseRow += (targetRow - mouseRow) * 0.2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const radiusSq = RADIUS * RADIUS;
    const mousePixelX = mouseCol * CELL_W;
    const mousePixelY = mouseRow * CELL_H;
    const canvasCssW = canvas.width / (window.devicePixelRatio || 1);

    const drawCalls = [];

    for (let y = 0; y < rows; y++) {
        const py = y * CELL_H;
        for (let x = 0; x < cols; x++) {
            if (x < rowWidths[y]) continue;

            const px = canvasCssW - (cols - x) * CELL_W;

            const dx = px - mousePixelX;
            const dy = py - mousePixelY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) heat[y][x] = 1;
            heat[y][x] *= FADE_SPEED;

            const intensity = heat[y][x];

            let baseIndex = charIndex[renderChars[y][x]] ?? 0;
            let targetIndex = 0;
            let inLogoBounds = false;

            if (charSet === 1) {
                const logoRows = charDesign.length;
                const logoCols = charDesign[0]?.length ?? 0;
                const anchorRow = Math.round(mouseRow) - Math.floor(logoRows / 2);
                const anchorCol = Math.round(mouseCol) - Math.floor(logoCols / 2);
                const ly = y - anchorRow;
                const lx = x - anchorCol;
                if (ly >= 0 && ly < logoRows && lx >= 0 && lx < logoCols) {
                    inLogoBounds = true;
                    const ch = charDesign[ly][lx];
                    if (ch && ch !== ' ') targetIndex = charIndex[ch] ?? 1;
                } else {
                    const t = bgChars?.[y]?.[x];
                    if (t !== undefined) targetIndex = t;
                }
            } else {
                const t = bgChars?.[y]?.[x];
                if (t !== undefined) targetIndex = t;
            }

            if (baseIndex < targetIndex) baseIndex++;
            else if (baseIndex > targetIndex) baseIndex--;

            renderChars[y][x] = chars[baseIndex];

            const isCreditsCell = y === 1 && x >= cols - charCredits.length;
            const isLogoCell = inLogoBounds && targetIndex > 0;
            if (intensity < 0.01 && baseIndex === 0 && !isCreditsCell && !isLogoCell) continue;

            const effectiveIntensity = isLogoCell ? Math.max(intensity, 0.4) : intensity;
            const densityShift = Math.floor(effectiveIntensity * (chars.length - 1));
            const finalIndex = Math.min(chars.length - 1, baseIndex + densityShift);
            let char = chars[finalIndex];

            if (isCreditsCell) {
                char = charCredits[cols - 1 - x];
            }

            const qi = Math.round(quantiseIntensity(effectiveIntensity) * (COLOR_LEVELS - 1));
            drawCalls.push({ qi, char, px, py });
        }
    }


    drawCalls.sort((a, b) => a.qi - b.qi);

    let lastQi = -1;
    for (const { qi, char, px, py } of drawCalls) {
        if (qi !== lastQi) {
            ctx.fillStyle = colourPalette[qi];
            lastQi = qi;
        }
        ctx.fillText(char, px, py);
    }

    requestAnimationFrame(render);
}

render();

document.addEventListener("DOMContentLoaded", () => {
    const githubLink = document.getElementById("github-link");
    const linkedinLink = document.getElementById("linkedin-link");

    function bind(link, design) {
        if (!link) return;
        link.addEventListener("mouseenter", () => {
            mouseOverride = true;
            const rect = link.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            relX = rect.left - canvasRect.left + rect.width / 2;
            relY = rect.top - canvasRect.top + rect.height / 2;
            RADIUS_TARGET = 80;
            charDesign = design;
            charSet = 1;
        });
        link.addEventListener("mouseleave", () => {
            RADIUS_TARGET = 110;
            mouseOverride = false;
            charSet = 0;
        });
    }
    bind(githubLink, gh);
    bind(linkedinLink, li);
});
