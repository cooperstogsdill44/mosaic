"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { T } from "../../lib/theme";

type Field =
  | "school"
  | "city"
  | "username"
  | "instagram"
  | "emailPrefix"
  | "gradYear"
  | "bio";

const FIELD_LABELS: Record<Field, string> = {
  school: "School",
  city: "City",
  username: "Username",
  instagram: "Instagram handle",
  emailPrefix: "Email (before the @)",
  gradYear: "Graduation year",
  bio: "Bio / interests",
};

const FIELD_COLORS: Record<Field, string> = {
  school: "#C97B4A",
  city: "#4F9C93",
  username: "#D6B25E",
  instagram: "#B86B7A",
  emailPrefix: "#8C9EB8",
  gradYear: "#8C6FB0",
  bio: "#5B8FB0",
};

const PLACEHOLDERS: Record<Field, string> = {
  school: "Lincoln High School",
  city: "Springfield",
  username: "starlight_j22",
  instagram: "starlight_j22_official",
  emailPrefix: "starlight_j22",
  gradYear: "2027",
  bio: "photography, robotics club",
};

type ConnectionType = "exact" | "partial" | "implied";

type Connection = {
  a: Field;
  b: Field;
  type: ConnectionType;
  reason: string;
  points: number;
};

const TYPE_COLOR: Record<ConnectionType, string> = {
  exact: "#D6B25E",
  partial: "#4F9C93",
  implied: "#B86B7A",
};

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

function normalize(v: string) {
  return v.trim().toLowerCase();
}

function getBand(score: number): { label: string; text: string } {
  if (score <= 30) return { label: "Low exposure", text: T.lowText };
  if (score <= 60) return { label: "Moderate exposure", text: T.mediumText };
  return { label: "High exposure", text: T.highText };
}

// specific field pairs that are risky together even with completely
// different text values - this is what makes the algorithm more than
// a text-matching trick.
const IMPLIED_RULES: { pair: [Field, Field]; reason: string; points: number }[] = [
  {
    pair: ["school", "city"],
    reason: "A school name combined with a city narrows your location down significantly.",
    points: 12,
  },
  {
    pair: ["school", "gradYear"],
    reason: "Your school and graduation year together make it easy to identify your exact grade and approximate age.",
    points: 14,
  },
  {
    pair: ["bio", "city"],
    reason: "Interests combined with a city can narrow you down to a specific local community or club.",
    points: 8,
  },
];

function detectConnections(profile: Partial<Record<Field, string>>): Connection[] {
  const filled = Object.entries(profile).filter(([, v]) => v && v.trim()) as [Field, string][];
  const found: Connection[] = [];

  for (let i = 0; i < filled.length; i++) {
    for (let j = i + 1; j < filled.length; j++) {
      const [fieldA, valueA] = filled[i];
      const [fieldB, valueB] = filled[j];
      const normA = normalize(valueA);
      const normB = normalize(valueB);

      if (normA === normB) {
        found.push({
          a: fieldA,
          b: fieldB,
          type: "exact",
          reason: `${FIELD_LABELS[fieldA]} and ${FIELD_LABELS[fieldB]} use the exact same value.`,
          points: 15,
        });
      } else if (normA.length > 2 && normB.length > 2 && (normA.includes(normB) || normB.includes(normA))) {
        found.push({
          a: fieldA,
          b: fieldB,
          type: "partial",
          reason: `${FIELD_LABELS[fieldA]} appears to be reused inside ${FIELD_LABELS[fieldB]}.`,
          points: 10,
        });
      }
    }
  }

  const filledSet = new Set(filled.map(([f]) => f));
  for (const rule of IMPLIED_RULES) {
    const [a, b] = rule.pair;
    if (filledSet.has(a) && filledSet.has(b)) {
      // don't double-count if already linked by text matching
      const already = found.some(
        (c) => (c.a === a && c.b === b) || (c.a === b && c.b === a)
      );
      if (!already) {
        found.push({ a, b, type: "implied", reason: rule.reason, points: rule.points });
      }
    }
  }

  return found;
}

function scoreProfile(profile: Partial<Record<Field, string>>, connections: Connection[]) {
  const filledCount = Object.values(profile).filter((v) => v && v.trim()).length;
  const items: { reason: string; points: number }[] = connections.map((c) => ({
    reason: c.reason,
    points: c.points,
  }));

  if (filledCount >= 5) {
    items.push({
      reason: "Five or more separate details are visible at once, compounding how identifiable you are.",
      points: 20,
    });
  }
  const exactCount = connections.filter((c) => c.type === "exact").length;
  if (exactCount >= 2) {
    items.push({
      reason: "The same value is reused across several accounts, not just two - the strongest kind of link.",
      points: 10,
    });
  }

  // keep the score on the same 0-100 scale the dashboard uses
  const score = Math.min(100, items.reduce((sum, r) => sum + r.points, 0));
  return { score, items };
}

function recommendationsFor(connections: Connection[]) {
  const ranked = [...connections].sort((a, b) => b.points - a.points);
  const seen = new Set<string>();
  const recs: { reason: string; action: string }[] = [];

  for (const c of ranked) {
    const key = `${c.a}-${c.b}`;
    if (seen.has(key)) continue;
    seen.add(key);

    let action = "";
    if (c.type === "exact" || c.type === "partial") {
      action = `Use a different value for ${FIELD_LABELS[c.a]} or ${FIELD_LABELS[c.b]} so they can't be linked at a glance.`;
    } else {
      action = `Consider hiding either ${FIELD_LABELS[c.a]} or ${FIELD_LABELS[c.b]} from public profiles - together they narrow you down.`;
    }
    recs.push({ reason: c.reason, action });
  }
  return recs;
}

const EMPTY_PROFILE: Record<Field, string> = {
  school: "",
  city: "",
  username: "",
  instagram: "",
  emailPrefix: "",
  gradYear: "",
  bio: "",
};

export default function LiveDemoPage() {
  const [profile, setProfile] = useState<Record<Field, string>>(EMPTY_PROFILE);
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hovered, setHovered] = useState<Field | null>(null);
  const rafRef = useRef<number | null>(null);

  const connections = submitted ? detectConnections(profile) : [];
  const { score, items } = submitted ? scoreProfile(profile, connections) : { score: 0, items: [] };
  const recommendations = submitted ? recommendationsFor(connections) : [];
  const band = getBand(score);

  const filledFields = (Object.keys(profile) as Field[]).filter((f) => profile[f].trim());

  const radius = 140;
  const center = 170;
  const positions: Partial<Record<Field, { x: number; y: number }>> = {};
  filledFields.forEach((field, i) => {
    const angle = (i / Math.max(filledFields.length, 1)) * 2 * Math.PI - Math.PI / 2;
    positions[field] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setRevealed(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    // double rAF so the browser paints the "hidden" state first,
    // then transitions to "revealed" - this is what makes the
    // lines and nodes actually animate in instead of popping in.
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setRevealed(true));
    });
  }

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const connectionCountByField: Partial<Record<Field, number>> = {};
  connections.forEach((c) => {
    connectionCountByField[c.a] = (connectionCountByField[c.a] ?? 0) + 1;
    connectionCountByField[c.b] = (connectionCountByField[c.b] ?? 0) + 1;
  });

  return (
    <div className="flex-1 bg-ink text-parchment px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-display text-3xl sm:text-4xl mb-3">Try it live</h1>
        <p className="text-parchment-dim mb-10 max-w-xl leading-relaxed">
          Fill in a few things about a fictional profile below - nothing here
          is sent anywhere, it all runs in your browser. Submit to watch how
          separate fields connect, then hover a dot for detail.
        </p>

        <div className="grid gap-12 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(Object.keys(FIELD_LABELS) as Field[]).map((field) => (
              <div key={field}>
                <label htmlFor={`field-${field}`} className="block text-sm text-parchment-dim mb-1">
                  {FIELD_LABELS[field]}
                </label>
                <input
                  id={`field-${field}`}
                  type="text"
                  value={profile[field]}
                  onChange={(e) => {
                    setSubmitted(false);
                    setRevealed(false);
                    setProfile((p) => ({ ...p, [field]: e.target.value }));
                  }}
                  className="w-full rounded-md bg-[#1B2733] border border-white/10 px-3 py-2 text-sm outline-none focus:border-gold/70 focus:ring-1 focus:ring-gold/40 transition-colors"
                  placeholder={`e.g. ${PLACEHOLDERS[field]}`}
                />
              </div>
            ))}
            <button
              type="submit"
              className={`mt-4 rounded-md bg-parchment px-5 py-3 text-sm font-medium text-ink-deep hover:bg-parchment-dim transition-colors ${FOCUS}`}
            >
              Map my connections
            </button>
          </form>

          <div>
            <svg
              viewBox="0 0 340 340"
              className="w-full max-w-[360px] mx-auto"
              role="img"
              aria-label="Map of how the details you entered connect to each other"
            >
              {submitted &&
                connections.map((c, i) => {
                  const p1 = positions[c.a];
                  const p2 = positions[c.b];
                  if (!p1 || !p2) return null;
                  const length = Math.hypot(p2.x - p1.x, p2.y - p1.y);
                  return (
                    <g key={i}>
                      <line
                        x1={p1.x}
                        y1={p1.y}
                        x2={p2.x}
                        y2={p2.y}
                        stroke={TYPE_COLOR[c.type]}
                        strokeWidth={c.type === "exact" ? 2.5 : 1.5}
                        strokeDasharray={length}
                        strokeDashoffset={revealed ? 0 : length}
                        style={{
                          transition: "stroke-dashoffset 0.7s ease",
                          transitionDelay: `${i * 180}ms`,
                        }}
                        strokeOpacity={0.75}
                      />
                    </g>
                  );
                })}

              {filledFields.map((field, i) => {
                const pos = positions[field];
                if (!pos) return null;
                const count = connectionCountByField[field] ?? 0;
                const isHovered = hovered === field;
                return (
                  <g
                    key={field}
                    style={{
                      opacity: submitted ? (revealed ? 1 : 0) : 1,
                      transform: submitted && !revealed ? "scale(0.6)" : "scale(1)",
                      transformOrigin: `${pos.x}px ${pos.y}px`,
                      transition: "opacity 0.5s ease, transform 0.5s ease",
                      transitionDelay: `${i * 100}ms`,
                    }}
                    onMouseEnter={() => setHovered(field)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isHovered ? 13 : 10}
                      fill={FIELD_COLORS[field]}
                      style={{ transition: "r 0.15s ease", cursor: "pointer" }}
                    />
                    {count > 1 && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={16}
                        fill="none"
                        stroke={FIELD_COLORS[field]}
                        strokeOpacity={0.4}
                        strokeWidth={1}
                      />
                    )}
                    <text
                      x={pos.x}
                      y={pos.y + 26}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill={isHovered ? "#f4efe4" : "#cfc9bc"}
                    >
                      {FIELD_LABELS[field]}
                    </text>
                    {isHovered && (
                      <text
                        x={pos.x}
                        y={pos.y - 18}
                        textAnchor="middle"
                        fontSize="10"
                        fill="#f4efe4"
                      >
                        {profile[field]} ({count} link{count === 1 ? "" : "s"})
                      </text>
                    )}
                  </g>
                );
              })}

              {!submitted && filledFields.length === 0 && (
                <text x="170" y="170" textAnchor="middle" fontSize="12" fill="#98A3AD">
                  Fill in the form to see the map
                </text>
              )}
            </svg>

            {submitted && (
              <div className="mt-6 space-y-5">
                <div className="rounded-xl border border-white/10 bg-[#16222E] p-5">
                  <p className="text-sm text-parchment-dim">Exposure score</p>
                  <p className="mt-1 flex items-baseline gap-3">
                    <span className="font-display text-5xl">{score}</span>
                    <span className="text-sm text-parchment-dim">out of 100</span>
                  </p>
                  <p className="mt-1 text-sm font-medium" style={{ color: band.text }}>
                    {band.label}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-parchment-dim">
                    {items.map((r, i) => (
                      <li key={i}>+ {r.points}: {r.reason}</li>
                    ))}
                    {items.length === 0 && <li>No risky connections detected in what you entered.</li>}
                  </ul>
                </div>

                {recommendations.length > 0 && (
                  <div className="rounded-xl border border-white/10 bg-[#16222E] p-5">
                    <p className="font-display text-lg mb-2">Recommendations</p>
                    <ol className="space-y-2 text-sm text-parchment-dim list-decimal list-inside">
                      {recommendations.map((r, i) => (
                        <li key={i}>{r.action}</li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 p-5">
                  <p className="font-display text-lg">Keep track of your progress</p>
                  <p className="mt-1 text-sm text-parchment-dim leading-relaxed">
                    The dashboard shows a sample profile, so you can see what tracking your score over time looks
                    like.
                  </p>
                  <Link
                    href="/dashboard"
                    className={`mt-4 inline-flex items-center rounded-md bg-parchment px-5 py-3 text-sm font-medium text-ink-deep hover:bg-parchment-dim transition-colors ${FOCUS}`}
                  >
                    Open the dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
