// Generates deterministic tile + connector data for the hero mosaic circle.
// Run once; output is pasted into a static TS data file (no client-side randomness).

const COLORS = ["#C97B4A", "#4F9C93", "#D6B25E", "#B86B7A"];
const NEUTRALS = ["#1B2733", "#22303D", "#2A3A47"];

const SIZE = 300;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 118;
const TILE = 13;
const GAP = 2;
const COLS = Math.floor(SIZE / TILE);

// simple deterministic pseudo-random
function seeded(i) {
  const x = Math.sin(i * 999.7) * 43758.5453;
  return x - Math.floor(x);
}

const tiles = [];
let idx = 0;
for (let row = 0; row < COLS; row++) {
  for (let col = 0; col < COLS; col++) {
    const x = col * TILE;
    const y = row * TILE;
    const cx = x + TILE / 2;
    const cy = y + TILE / 2;
    const dist = Math.hypot(cx - CX, cy - CY);
    if (dist > R) continue;
    idx++;
    const r = seeded(idx);
    let fill;
    if (r < 0.14) fill = COLORS[Math.floor(seeded(idx * 3) * COLORS.length)];
    else fill = NEUTRALS[Math.floor(seeded(idx * 7) * NEUTRALS.length)];
    tiles.push({
      x: Math.round(x),
      y: Math.round(y),
      s: TILE - GAP,
      fill,
      cx,
      cy,
      dist,
    });
  }
}

// pick 4 extraction tiles near the rim, roughly at NW, NE, SE, SW, colored distinctly
const targets = [
  { angle: -135, label: "School", color: "#C97B4A" },
  { angle: -45, label: "Location", color: "#4F9C93" },
  { angle: 45, label: "Username", color: "#D6B25E" },
  { angle: 135, label: "Handle", color: "#B86B7A" },
];

const connectors = targets.map((t, i) => {
  const rad = (t.angle * Math.PI) / 180;
  // find nearest existing tile to the rim in that direction
  const targetX = CX + Math.cos(rad) * (R - 8);
  const targetY = CY + Math.sin(rad) * (R - 8);
  let best = null;
  let bestD = Infinity;
  for (const tile of tiles) {
    const d = Math.hypot(tile.cx - targetX, tile.cy - targetY);
    if (d < bestD) {
      bestD = d;
      best = tile;
    }
  }
  best.fill = t.color;
  best.pulled = true;
  const outX = CX + Math.cos(rad) * (R + 46);
  const outY = CY + Math.sin(rad) * (R + 46);
  return {
    fromX: best.cx,
    fromY: best.cy,
    toX: outX,
    toY: outY,
    label: t.label,
    color: t.color,
  };
});

const output = {
  size: SIZE,
  cx: CX,
  cy: CY,
  r: R,
  tiles: tiles.map(({ x, y, s, fill }) => ({ x, y, s, fill })),
  connectors,
};

console.log(JSON.stringify(output));
