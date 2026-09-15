import { mosaic } from "@/lib/mosaic-data";

export default function MosaicHero() {
  const pad = 60;
  const vb = `-${pad} -${pad} ${mosaic.size + pad * 2} ${
    mosaic.size + pad * 2
  }`;

  return (
    <svg
      viewBox={vb}
      className="w-full max-w-[420px] mx-auto"
      role="img"
      aria-label="A circular mosaic of small tiles, with four tiles pulled outward and labeled School, Location, Username, and Handle, showing how separate details connect into one identifiable picture."
    >
      {mosaic.tiles.map((t, i) => (
        <rect
          key={i}
          x={t.x}
          y={t.y}
          width={t.s}
          height={t.s}
          rx={2}
          fill={t.fill}
        />
      ))}

      {mosaic.connectors.map((c, i) => (
        <g key={i}>
          <line
            x1={c.fromX}
            y1={c.fromY}
            x2={c.toX}
            y2={c.toY}
            stroke={c.color}
            strokeWidth={1}
            strokeOpacity={0.55}
          />
          <circle cx={c.toX} cy={c.toY} r={4} fill={c.color} />
          <text
            x={c.toX}
            y={c.toY + (c.toY > mosaic.cy ? 18 : -12)}
            textAnchor="middle"
            fontSize="11"
            fontFamily="var(--font-body)"
            fill="#cfc9bc"
          >
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
