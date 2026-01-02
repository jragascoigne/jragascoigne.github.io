const bg = document.getElementById("ascii-bg");
const chars = ",.-~:;=!*#$@engiocsagnhojGJ|";
let RADIUS = 110;
let RADIUS_TARGET = 110;
const FADE_SPEED = 0.96;
const GRID_WIDTH_RATIO = 0.4;

let cols, rows;
let heat = [];
let mouseCol = -999;
let mouseRow = -999;
let targetCol = -999;
let targetRow = -999;

let mouseOverride = false;
let relX = 0;
let relY = 0;

let charSet = 0;

const CELL_W = 6.6;
const CELL_H = 11;

let charDesign = [
"           .:+%@@@@@%+:.           ",
"        -@@@@@@@@@@@@@@@@@-        ",
"     .%@@@@@@@@@@@@@@@@@@@@@%.     ",
"   .#@@@@@@@@@@@@@@@@@@@@@@@@@%.   ",
"  :@@@@@. :%@@@@@@@@@@@%: .@@@@@:  ",
" .@@@@@%                   #@@@@@. ",
".@@@@@@@.                 .@@@@@@@:",
"+@@@@@@:                   :@@@@@@+",
"%@@@@@+                     +@@@@@%",
"@@@@@@=                     -@@@@@@",
"@@@@@@*                     *@@@@@@",
"*@@@@@@:                   :@@@@@@#",
"-@@@@@@@-                 -@@@@@@@-",
" *@@%-%@@@%.           .%@@@@@@@@* ",
"  *@@@-.#@@@@*       +@@@@@@@@@@#  ",
"   -@@@- .:-.        :@@@@@@@@@=   ",
"    .#@@@*-.-.       :@@@@@@@#.    ",
"      .*@@@@@-       :@@@@@*.      ",
"          -%@.       .@@-          ",
];



let staticChars = [];
let renderChars = [];

let rowWidths = [];

function resize() {
    rows = Math.ceil(window.innerHeight / CELL_H) + 2;

    cols = Math.floor((window.innerWidth * GRID_WIDTH_RATIO) / CELL_W);

    heat = Array.from({ length: rows }, () => new Float32Array(cols));
    
    staticChars = [];
    renderChars = [];

    for (let y = 0; y < rows; y++) {

        staticChars[y] = [];
        renderChars[y] = [];
        rowWidths[y] = Math.floor(Math.random() * 3);

        for (let x = 0; x < cols; x++) {
            staticChars[y][x] = chars[Math.floor(Math.random() * 12)];
            renderChars[y][x] = chars[0];

        }
    }
}

function render() {

    RADIUS += (RADIUS_TARGET - RADIUS) * 0.1;

    mouseCol += (targetCol - mouseCol) * 0.2;
    mouseRow += (targetRow - mouseRow) * 0.2;

    let output = "";
    const radiusSq = RADIUS * RADIUS;
    const mousePixelX = mouseCol * CELL_W;
    const mousePixelY = mouseRow * CELL_H;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const pixelX = x * CELL_W;
            const pixelY = y * CELL_H;
            
            const dx = pixelX - mousePixelX;
            const dy = pixelY - mousePixelY;
            const distSq = dx * dx + dy * dy;

            if (distSq < radiusSq) {
                heat[y][x] = 1;
            }

            heat[y][x] *= FADE_SPEED;

            const intensity = heat[y][x];

            let baseCharIndex = 0;
            let charTarget = staticChars;
            
            if (charSet === 1) {
                charTarget = charDesign;
            }

            let flipX = x

            if (y < renderChars.length && flipX < renderChars[0].length) {
                renderChars[y][x] 
                baseCharIndex = chars.indexOf(renderChars[y][flipX]);
                if (baseCharIndex === -1) baseCharIndex = 0;
                
                let targetCharIndex = 0;

                if (y < charTarget.length && flipX < charTarget[0].length) {
                    targetCharIndex = chars.indexOf(charTarget[y][flipX]);
                    if (targetCharIndex === -1) targetCharIndex = 0;
                }
                
                if (baseCharIndex < targetCharIndex) {
                    renderChars[y][flipX] = chars[baseCharIndex + 1];
                } else if (baseCharIndex > targetCharIndex) {
                    renderChars[y][flipX] = chars[baseCharIndex - 1];
                }
            }
            
            const densityShift = Math.floor(intensity * (chars.length - 1));
            const charIndex = Math.min(chars.length - 1, baseCharIndex + densityShift);
            let char = chars[charIndex];
            
            let charCredits = 'c.john.gascoigne.2026.';
            charCredits = charCredits.split('').reverse().join('');

            if (y === 1 && x >= cols - 1 - (charCredits.length - 1)) {
                char = charCredits[cols - 1 - x];
            }

            if (x < rowWidths[y]) {
                char = " ";
            }

            const base = 60;
            const r = Math.floor(base + (154 - base) * intensity);
            const g = Math.floor(base + (151 - base) * intensity);
            const b = Math.floor(base + (239 - base) * intensity);

            output += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
        }
        output += "\n";
    }

    bg.innerHTML = output;
    requestAnimationFrame(render);
}



window.addEventListener("mousemove", e => {
    const rect = bg.getBoundingClientRect();

    if (mouseOverride == false) {
        relX = e.clientX - rect.left;
        relY = e.clientY - rect.top;
    }

    const gridLeft = rect.width - (cols * CELL_W);

        targetCol = Math.floor((relX - gridLeft) / CELL_W);
        targetRow = Math.floor(relY / CELL_H);
});

document.addEventListener("DOMContentLoaded", e => {
    const allLinks = document.querySelectorAll(".social-link");
    resize();
    allLinks.forEach(link => {
        link.addEventListener("mouseenter", e => {
            mouseOverride = true;
            const rect = link.getBoundingClientRect();
            const bgRect = bg.getBoundingClientRect();
            relX = rect.left - bgRect.left + rect.width / 2;
            relY = rect.top - bgRect.top + rect.height / 2;
            RADIUS_TARGET = 70;
            charSet = 1;
        });

        link.addEventListener("mouseleave", e => {
            RADIUS_TARGET = 110;
            mouseOverride = false;
            charSet = 0;
        });
    });
});

window.addEventListener("resize", resize);


render();