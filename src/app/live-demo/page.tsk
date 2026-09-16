"use client";

import { useState } from "react";

type Field = "school" | "city" | "username" | "instagram" | "emailPrefix";

const FIELD_LABELS: Record<Field, string> = {
  school: "School",
  city: "City",
  username: "Username",
  instagram: "Instagram handle",
  emailPrefix: "Email (before the @)",
};

const FIELD_COLORS: Record<Field, string> = {
  school: "#C97B4A",
  city: "#4F9C93",
  username: "#D6B25E",
  instagram: "#B86B7A",
  emailPrefix: "#8C9EB8",
};

type Connection = {
  a: Field;
  b: Field;
  type: "exact" | "partial";
  reason: string;
};

function normalize(v: string) {
  return v.trim().toLowerCase();
}

function detectConnections(profile: Partial<Record<Field, string>>): Connection[] {
  const fields = Object.entries(profile).filter(([, v]) => v && v.trim()) as [Field, string][];
  const found: Connection[] = [];

  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const [fieldA, valueA] = fields[i];
      const [fieldB, valueB] = fields[j];
      const normA = normalize(valueA);
      const normB = normalize(valueB);

      if (normA === normB) {
        found.push({
          a: fieldA,
          b: fieldB,
          type: "exact",
          reason: `${FIELD_LABELS[fieldA]} and ${FIELD_LABELS[fieldB]} use the exact same value.`,
        });
      } else if (normA.includes(normB) || normB.includes(normA)) {
        found.push({
          a: fieldA,
          b: fieldB,
          type: "partial",
          reason: `${FIELD_LABELS[fieldA]} appears to be reused inside ${FIELD_LABELS[fieldB]}.`,
        });
      }
    }
  }
  return found;
}

function scoreProfile(profile: Partial<Record<Field, string>>, connections: Connection[]) {
  const filledCount = Object.values(profile).filter((v) => v && v.trim()).length;
  const rules: { reason: string; points: number }[] = [];

  if (connections.length >= 1) {
    rules.push({
      reason: "Reused information links two or more of your accounts together.",
      points: 15 * connections.length,
    });
  }
  if (filledCount >= 4) {
    rules.push({
      reason: "Several separate pieces of information are visible at once, making you easier to identify.",
      points: 20,
    });
  }
  if (connections.some((c) => c.type === "exact")) {
    rules.push({
      reason: "An identical value is reused word-for-word across two fields - the strongest kind of link.",
      points: 10,
    });
  }

  const score = rules.reduce((sum, r) => sum + r.points, 0);
  return { score, rules };
}

const EMPTY_PROFILE: Record<Field, string> = {
  school: "",
  city: "",
  username: "",
  instagram: "",
  emailPrefix: "",
};

export default function LiveDemoPage() {
  const [profile, setProfile] = useState<Record<Field, string>>(EMPTY_PROFILE);
  const [submitted, setSubmitted] = useState(false);

  const connections = submitted ? detectConnections(profile) : [];
  const { score, rules } = submitted ? scoreProfile(profile, connections) : { score: 0, rules: [] };

  const filledFields = (Object.keys(profile) as Field[]).filter((f) => profile[f].trim());

  const radius = 130;
  const center = 160;
  const positions: Record<Field, { x: number; y: number }> = {} as Record<Field, { x: number; y: number }>;
  filledFields.forEach((field, i) => {
    const angle = (i / Math.max(filledFields.length, 1)) * 2 * Math.PI - Math.PI / 2;
    positions[field] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  return (
    <div className="min-h-screen bg-ink text-parchment px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl mb-2">Try it live</h1>
        <p className="text-parchment-dim mb-10 max-w-xl">
          Fill in a few things about a fictional profile below - nothing here is
          sent anywhere, it all runs right in your browser. Watch how separate
          fields connect once you submit.
        </p>

        <div className="grid gap-10 md:grid-cols-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="space-y-4"
          >
            {(Object.keys(FIELD_LABELS) as Field[]).map((field) => (
              <div key={field}>
                <label className="block text-sm text-parchment-dim mb-1">
                  {FIELD_LABELS[field]}
                </label>
                <input
                  type="text"
                  value={profile[field]}
                  onChange={(e) => {
                    setSubmitted(false);
                    setProfile((p) => ({ ...p, [field]: e.target.value }));
                  }}
                  className="w-full rounded-md bg-[#1B2733] border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
                  placeholder={`e.g. ${
                    field === "school"
                      ? "Lincoln High School"
                      : field === "city"
                      ? "Springfield"
                      : field === "username"
                      ? "starlight_j22"
                      : field === "instagram"
                      ? "starlight_j22_official"
                      : "starlight_j22"
                  }`}
                />
              </div>
            ))}
            <button
              type="submit"
              className="mt-4 rounded-md bg-parchment px-5 py-3 text-sm font-medium text-ink-deep hover:bg-parchment-dim transition-colors"
            >
              Map my connections
            </button>
          </form>

          <div>
            <svg viewBox="0 0 320 320" className="w-full max-w-[320px] mx-auto">
              {submitted &&
                connections.map((c, i) => (
                  <line
                    key={i}
                    x1={positions[c.a]?.x}
                    y1={positions[c.a]?.y}
                    x2={positions[c.b]?.x}
                    y2={positions[c.b]?.y}
                    stroke={c.type === "exact" ? "#D6B25E" : "#4F9C93"}
                    strokeWidth={c.type === "exact" ? 2 : 1}
                    strokeOpacity={0.7}
                  />
                ))}
              {filledFields.map((field) => (
                <g key={field}>
                  <circle
                    cx={positions[field]?.x}
                    cy={positions[field]?.y}
                    r={10}
                    fill={FIELD_COLORS[field]}
                  />
                  <text
                    x={positions[field]?.x}
                    y={(positions[field]?.y ?? 0) + 24}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#cfc9bc"
                  >
                    {FIELD_LABELS[field]}
                  </text>
                </g>
              ))}
              {!submitted && filledFields.length === 0 && (
                <text x="160" y="160" textAnchor="middle" fontSize="12" fill="#6b7580">
                  Fill in the form to see the map
                </text>
              )}
            </svg>

            {submitted && (
              <div className="mt-6">
                <p className="font-display text-xl">Exposure score: {score}</p>
                <ul className="mt-3 space-y-2 text-sm text-parchment-dim">
                  {rules.map((r, i) => (
                    <li key={i}>+ {r.points}: {r.reason}</li>
                  ))}
                  {rules.length === 0 && <li>No risky connections detected in what you entered.</li>}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}