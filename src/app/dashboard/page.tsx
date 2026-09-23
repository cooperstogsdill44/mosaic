"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { T, FOCUS } from "../../lib/theme";

/* ---------- Types ---------- */

type Risk = "high" | "medium" | "low";
type Kind = "exact" | "partial" | "implied";
type CatId = "personal" | "social" | "accounts" | "location" | "school";
type Item = { label: string; risk: Risk };
type Category = { id: CatId; label: string; color: string; side: "left" | "right"; y: number; items: Item[] };
type Connection = { id: string; title: string; cats: [CatId, CatId]; kind: Kind; weight: number; why: string };
type Recommendation = { id: string; title: string; why: string; impact: number; effort: string };
type Snapshot = { date: string; score: number };
type Settings = { name: string; reduceMotion: boolean };
type PageId = "dashboard" | "connections" | "recommendations" | "progress" | "settings";

/* ---------- Demo data (replace with the real API later) ---------- */

const CATEGORIES: Category[] = [
  {
    id: "personal",
    label: "Personal info",
    color: T.violet,
    side: "left",
    y: 140,
    items: [
      { label: "Full name", risk: "medium" },
      { label: "Birth date", risk: "high" },
      { label: "Phone number", risk: "high" },
      { label: "Email address", risk: "medium" },
      { label: "Home address", risk: "high" },
    ],
  },
  {
    id: "accounts",
    label: "Online accounts",
    color: T.gold,
    side: "left",
    y: 400,
    items: [
      { label: "Google account", risk: "medium" },
      { label: "Spotify", risk: "low" },
      { label: "Discord kaylee#4471", risk: "medium" },
      { label: "Steam kaylee_r08", risk: "high" },
    ],
  },
  {
    id: "school",
    label: "School",
    color: T.clay,
    side: "right",
    y: 100,
    items: [
      { label: "Lakeview High School", risk: "medium" },
      { label: "Class of 2027", risk: "medium" },
      { label: "Student ID (partial)", risk: "low" },
    ],
  },
  {
    id: "social",
    label: "Social media",
    color: T.rose,
    side: "right",
    y: 270,
    items: [
      { label: "Instagram @kaylee_r08", risk: "high" },
      { label: "TikTok @kaylee.r", risk: "medium" },
      { label: "Twitch kaylee_r08", risk: "high" },
      { label: "YouTube KayleeR", risk: "low" },
    ],
  },
  {
    id: "location",
    label: "Location",
    color: T.teal,
    side: "right",
    y: 440,
    items: [
      { label: "Springfield", risk: "medium" },
      { label: "Skate park regular", risk: "medium" },
      { label: "Tagged photos", risk: "low" },
      { label: "Home street in photo", risk: "high" },
    ],
  },
];

const CONNECTIONS: Connection[] = [
  {
    id: "c1",
    title: "Username + social + gaming",
    cats: ["social", "accounts"],
    kind: "exact",
    weight: 9,
    why: "The username kaylee_r08 appears on Instagram, Twitch and Steam, so anyone can treat them as one person.",
  },
  {
    id: "c2",
    title: "School + city",
    cats: ["school", "location"],
    kind: "implied",
    weight: 8,
    why: "Neither one gives your location alone, but together they narrow it to one small area.",
  },
  {
    id: "c3",
    title: "Name + school + class year",
    cats: ["personal", "school"],
    kind: "partial",
    weight: 7,
    why: "These can be matched to sports rosters and local news articles.",
  },
  {
    id: "c4",
    title: "Email + other accounts",
    cats: ["personal", "accounts"],
    kind: "exact",
    weight: 7,
    why: "The same email on several accounts makes them easy to link together.",
  },
  {
    id: "c5",
    title: "Photos + location",
    cats: ["social", "location"],
    kind: "partial",
    weight: 6,
    why: "Tagged photos show where you spend time and when.",
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "r1",
    title: "Use a different username for gaming and social media",
    why: "Breaks the strongest link between your accounts.",
    impact: 9,
    effort: "20 min",
  },
  {
    id: "r2",
    title: "Take your school name out of public bios",
    why: "Removes half of the school plus city combination.",
    impact: 8,
    effort: "5 min",
  },
  {
    id: "r3",
    title: "Change reused passwords and turn on 2-step verification",
    why: "Stops a past breach from opening your other accounts.",
    impact: 7,
    effort: "1 hour",
  },
  {
    id: "r4",
    title: "Set your Instagram to private and review followers",
    why: "Limits who can see photos and captions.",
    impact: 6,
    effort: "20 min",
  },
  {
    id: "r5",
    title: "Delete old accounts you no longer use",
    why: "Fewer places for your details to leak from.",
    impact: 6,
    effort: "1 hour",
  },
  {
    id: "r6",
    title: "Remove location tags from past posts",
    why: "Stops photos from showing where you hang out.",
    impact: 4,
    effort: "20 min",
  },
];

const HISTORY: Snapshot[] = [
  { date: "Aug 12", score: 82 },
  { date: "Aug 26", score: 76 },
  { date: "Sep 9", score: 70 },
  { date: "Sep 21", score: 64 },
];

const RISKS: { id: string; title: string; risk: Risk }[] = [
  { id: "k1", title: "Home street visible in tagged photos", risk: "high" },
  { id: "k2", title: "Birth date public on Instagram", risk: "high" },
  { id: "k3", title: "Same username on three platforms", risk: "high" },
  { id: "k4", title: "Phone number on a people search site", risk: "medium" },
];

const SOURCES = [
  {
    id: "manual",
    name: "Manual audit",
    status: "Available",
    ok: true,
    text: "Answer questions about your accounts and get a score with the connections explained.",
    href: "/live-demo",
    cta: "Open the live demo",
  },
  {
    id: "breach",
    name: "Breach check",
    status: "Not connected",
    ok: false,
    text: "Checks whether your email appeared in known data breaches using Have I Been Pwned.",
    href: "",
    cta: "",
  },
  {
    id: "footprint",
    name: "Public footprint search",
    status: "Not connected",
    ok: false,
    text: "Estimates how much of your information can be found through a public web search.",
    href: "",
    cta: "",
  },
];

const STREAK = { days: 14, week: [true, true, true, true, true, true, false], letters: ["M", "T", "W", "T", "F", "S", "S"] };

const RISK: Record<Risk, { label: string; color: string; bg: string; text: string }> = {
  high: { label: "High", color: T.high, bg: "rgba(229,87,79,0.16)", text: T.highText },
  medium: { label: "Medium", color: T.medium, bg: "rgba(240,162,59,0.16)", text: T.mediumText },
  low: { label: "Low", color: T.low, bg: "rgba(93,187,122,0.16)", text: T.lowText },
};

const KIND: Record<Kind, { label: string; color: string; hint: string }> = {
  exact: { label: "Exact match", color: T.gold, hint: "The same detail appears in more than one place." },
  partial: { label: "Partial match", color: T.teal, hint: "Similar details that probably belong to the same person." },
  implied: {
    label: "Implied link",
    color: T.rose,
    hint: "No text matches, but together the details narrow down who you are.",
  },
};

const PAGES: { id: PageId; label: string; title: string; subtitle: string }[] = [
  { id: "dashboard", label: "Dashboard", title: "Welcome back", subtitle: "Here is your digital footprint overview" },
  {
    id: "connections",
    label: "Connections",
    title: "Connections",
    subtitle: "The combinations that make you easier to identify, strongest first",
  },
  {
    id: "recommendations",
    label: "Recommendations",
    title: "Recommendations",
    subtitle: "Check an action off and your score updates",
  },
  { id: "progress", label: "Progress", title: "Progress", subtitle: "How your score has changed over time" },
  { id: "settings", label: "Settings", title: "Settings", subtitle: "Your preferences and data sources" },
];

/* ---------- Helpers ---------- */

function getBand(score: number): { label: string; color: string; text: string } {
  if (score <= 30) return { label: "Low exposure", color: T.low, text: T.lowText };
  if (score <= 60) return { label: "Moderate exposure", color: T.medium, text: T.mediumText };
  return { label: "High exposure", color: T.high, text: T.highText };
}

function catLabel(id: CatId): string {
  return CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

/* ---------- Small building blocks ---------- */

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl border p-5 ${className ?? ""}`}
      style={{ background: T.card, borderColor: T.border }}
    >
      {children}
    </section>
  );
}

function Chip({ risk, children }: { risk: Risk; children: ReactNode }) {
  return (
    <span
      className="whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium"
      style={{ background: RISK[risk].bg, color: RISK[risk].text }}
    >
      {children}
    </span>
  );
}

function Stat({ label, value, note, valueColor }: { label: string; value: string | number; note: string; valueColor?: string }) {
  return (
    <Card>
      <p className="text-sm font-medium" style={{ color: T.muted }}>
        {label}
      </p>
      <p className="font-display mt-3 text-4xl font-medium" style={{ color: valueColor ?? T.text }}>
        {value}
      </p>
      <p className="mt-1 text-sm" style={{ color: T.muted }}>
        {note}
      </p>
    </Card>
  );
}

function Gauge({ score, color }: { score: number; color: string }) {
  const arc = "M20 100 A80 80 0 0 1 180 100";
  const len = Math.PI * 80;
  return (
    <svg viewBox="0 0 200 118" className="mx-auto mt-2 w-full max-w-[190px]" role="img" aria-label={`Footprint score ${score} out of 100`}>
      <path d={arc} fill="none" stroke={T.border} strokeWidth={14} strokeLinecap="round" />
      <path
        d={arc}
        fill="none"
        stroke={color}
        strokeWidth={14}
        strokeLinecap="round"
        strokeDasharray={`${(len * score) / 100} ${len}`}
      />
      <text x={100} y={92} textAnchor="middle" fontSize={38} fontWeight={600} fill={T.text} style={{ fontFamily: "var(--font-display), serif" }}>
        {score}
      </text>
      <text x={100} y={113} textAnchor="middle" fontSize={12} fill={T.muted}>
        out of 100
      </text>
    </svg>
  );
}

function TrendChart({
  points,
  color,
  width = 600,
  height = 230,
}: {
  points: { label: string; value: number }[];
  color: string;
  width?: number;
  height?: number;
}) {
  const L = 38;
  const R = 16;
  const Tp = 26;
  const B = 30;
  const px = (i: number) => L + (points.length === 1 ? 0 : (i * (width - L - R)) / (points.length - 1));
  const py = (v: number) => Tp + (1 - v / 100) * (height - Tp - B);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)} ${py(p.value).toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Exposure score over time, from ${points[0].value} to ${last.value}`}
    >
      {[0, 30, 60, 100].map((v) => (
        <g key={v}>
          <line
            x1={L}
            x2={width - R}
            y1={py(v)}
            y2={py(v)}
            stroke={T.border}
            strokeDasharray={v === 30 || v === 60 ? "4 4" : undefined}
          />
          <text x={L - 8} y={py(v) + 4} textAnchor="end" fontSize={12} fill={T.muted}>
            {v}
          </text>
        </g>
      ))}
      <path d={path} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <g key={`${p.label}-${i}`}>
          <circle cx={px(i)} cy={py(p.value)} r={4.5} fill={T.card} stroke={color} strokeWidth={2.5} />
          <text x={px(i)} y={py(p.value) - 11} textAnchor="middle" fontSize={12} fontWeight={600} fill={T.text}>
            {p.value}
          </text>
          <text x={px(i)} y={height - 9} textAnchor="middle" fontSize={12} fill={T.muted}>
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function ActionRow({
  rec,
  checked,
  onToggle,
  compact,
}: {
  rec: Recommendation;
  checked: boolean;
  onToggle: () => void;
  compact?: boolean;
}) {
  return (
    <li className="flex gap-3 border-b py-3 last:border-b-0" style={{ borderColor: T.border }}>
      <input
        id={`rec-${compact ? "c-" : ""}${rec.id}`}
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className={`mt-0.5 h-5 w-5 shrink-0 cursor-pointer ${FOCUS}`}
        style={{ accentColor: T.teal }}
      />
      <label htmlFor={`rec-${compact ? "c-" : ""}${rec.id}`} className="flex-1 cursor-pointer">
        <span
          className={`block text-sm font-medium ${checked ? "line-through" : ""}`}
          style={{ color: checked ? T.muted : T.text }}
        >
          {rec.title}
        </span>
        {!compact && (
          <span className="mt-0.5 block text-sm" style={{ color: T.muted }}>
            {rec.why} Takes about {rec.effort}.
          </span>
        )}
      </label>
      <div className="shrink-0 text-right">
        <Chip risk={rec.impact >= 7 ? "high" : "medium"}>{rec.impact >= 7 ? "High impact" : "Medium impact"}</Chip>
        {!compact && (
          <p className="mt-1 text-sm" style={{ color: checked ? T.lowText : T.muted }}>
            -{rec.impact} points
          </p>
        )}
      </div>
    </li>
  );
}

/* ---------- Footprint map ---------- */

const MAP_W = 960;
const MAP_H = 540;
const CX = 480;
const CY = 270;
const CAT_DX = 170;
const LEAF_DX = 290;
const ROW = 30;

function FootprintMap({ active, animate }: { active: Connection; animate: boolean }) {
  const pos = (c: Category) => ({ x: CX + (c.side === "left" ? -CAT_DX : CAT_DX), y: c.y });
  const find = (id: CatId): Category => {
    const c = CATEGORIES.find((x) => x.id === id);
    if (!c) throw new Error(`Unknown category ${id}`);
    return c;
  };
  const linkPath = (a: CatId, b: CatId) => {
    const pa = pos(find(a));
    const pb = pos(find(b));
    const mx = (pa.x + pb.x) / 2;
    const my = (pa.y + pb.y) / 2;
    const qx = mx + (CX - mx) * 0.55;
    const qy = my + (CY - my) * 0.55;
    return `M${pa.x} ${pa.y} Q${qx} ${qy} ${pb.x} ${pb.y}`;
  };
  const kindColor = KIND[active.kind].color;
  const transition = animate ? "stroke 0.3s ease, stroke-width 0.3s ease" : "none";
  const total = CATEGORIES.reduce((n, c) => n + c.items.length, 0);

  return (
    <div className="mt-4 overflow-x-auto">
      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        className="h-auto w-full min-w-[720px]"
        role="img"
        aria-label={`Map of ${total} pieces of information in ${CATEGORIES.length} groups. Selected connection: ${active.title}.`}
      >
        {/* spokes from you to each group */}
        {CATEGORIES.map((c) => {
          const p = pos(c);
          const mid = (CX + p.x) / 2;
          return (
            <path
              key={`spoke-${c.id}`}
              d={`M${CX} ${CY} C${mid} ${CY}, ${mid} ${p.y}, ${p.x} ${p.y}`}
              fill="none"
              stroke={c.color}
              strokeOpacity={0.35}
              strokeWidth={2.5}
            />
          );
        })}

        {/* indirect links between groups */}
        {CONNECTIONS.filter((c) => c.id !== active.id).map((c) => (
          <path
            key={`link-${c.id}`}
            d={linkPath(c.cats[0], c.cats[1])}
            fill="none"
            stroke={T.indirect}
            strokeWidth={1.5}
            strokeDasharray="5 5"
            style={{ transition }}
          />
        ))}
        <path
          d={linkPath(active.cats[0], active.cats[1])}
          fill="none"
          stroke={kindColor}
          strokeWidth={3.5}
          strokeDasharray="7 5"
          style={{ transition }}
        />

        {/* items */}
        {CATEGORIES.flatMap((c) => {
          const p = pos(c);
          const dir = c.side === "left" ? -1 : 1;
          const lx = CX + dir * LEAF_DX;
          const mid = (p.x + lx) / 2;
          return c.items.map((item, j) => {
            const ly = c.y + (j - (c.items.length - 1) / 2) * ROW;
            const w = item.label.length * 6.2 + 34;
            const x0 = dir === 1 ? lx + 6 : lx - 6 - w;
            return (
              <g key={`${c.id}-${j}`}>
                <path
                  d={`M${p.x} ${p.y} C${mid} ${p.y}, ${mid} ${ly}, ${lx} ${ly}`}
                  fill="none"
                  stroke={c.color}
                  strokeOpacity={0.5}
                  strokeWidth={1.6}
                />
                <rect x={x0} y={ly - 12} width={w} height={24} rx={12} fill={T.card} stroke={T.border} />
                <circle cx={x0 + 13} cy={ly} r={4.5} fill={RISK[item.risk].color} />
                <text x={x0 + 24} y={ly + 4} fontSize={12} fill={T.text}>
                  {item.label}
                </text>
              </g>
            );
          });
        })}

        {/* groups */}
        {CATEGORIES.map((c) => {
          const p = pos(c);
          const on = active.cats.includes(c.id);
          return (
            <g key={c.id}>
              {on && <circle cx={p.x} cy={p.y} r={35} fill="none" stroke={kindColor} strokeWidth={3} />}
              <circle cx={p.x} cy={p.y} r={28} fill={c.color} />
              <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize={17} fontWeight={700} fill={T.deep}>
                {c.items.length}
              </text>
              <text
                x={p.x}
                y={p.y + 52}
                textAnchor="middle"
                fontSize={13}
                fontWeight={600}
                fill={T.text}
                stroke={T.card}
                strokeWidth={4}
                paintOrder="stroke"
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* you */}
        <circle cx={CX} cy={CY} r={46} fill={T.deep} stroke={T.border} strokeWidth={2} />
        <text x={CX} y={CY + 7} textAnchor="middle" fontSize={20} fontWeight={600} fill={T.text} style={{ fontFamily: "var(--font-display), serif" }}>
          YOU
        </text>
      </svg>
    </div>
  );
}

/* ---------- Page ---------- */

export default function DashboardPage() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [done, setDone] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>({ name: "", reduceMotion: false });
  const [selectedId, setSelectedId] = useState<string>("c1");

  const sortedRecs = useMemo(() => [...RECOMMENDATIONS].sort((a, b) => b.impact - a.impact), []);
  const sortedConnections = useMemo(() => [...CONNECTIONS].sort((a, b) => b.weight - a.weight), []);
  const active = CONNECTIONS.find((c) => c.id === selectedId) ?? CONNECTIONS[0];

  const totalItems = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  const highItems = CATEGORIES.reduce((n, c) => n + c.items.filter((i) => i.risk === "high").length, 0);

  const latest = HISTORY[HISTORY.length - 1].score;
  const removed = RECOMMENDATIONS.filter((r) => done.includes(r.id)).reduce((sum, r) => sum + r.impact, 0);
  const current = Math.max(0, latest - removed);
  const band = getBand(current);
  const delta = HISTORY[0].score - current;

  const points = [
    ...HISTORY.map((h) => ({ label: h.date, value: h.score })),
    ...(removed > 0 ? [{ label: "Now", value: current }] : []),
  ];

  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
  const name = settings.name.trim();
  const meta = PAGES.find((p) => p.id === page) ?? PAGES[0];
  const title = page === "dashboard" && name ? `Welcome back, ${name}` : meta.title;

  const streakCard = (
    <section className="rounded-xl border p-5" style={{ background: T.deep, borderColor: T.border, color: T.text }}>
      <h2 className="font-display text-xl font-medium">Privacy streak</h2>
      <p className="font-display mt-3 text-4xl font-medium">{STREAK.days} days</p>
      <p className="mt-1 text-sm" style={{ color: T.dim }}>
        Great work staying consistent.
      </p>
      <ul className="mt-4 flex justify-between" aria-label="This week">
        {STREAK.letters.map((l, i) => (
          <li key={i} className="flex flex-col items-center gap-1.5 text-xs" style={{ color: T.dim }}>
            {l}
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: STREAK.week[i] ? T.low : "transparent",
                border: STREAK.week[i] ? "none" : `1.5px solid ${T.dim}`,
                color: T.deep,
              }}
            >
              {STREAK.week[i] ? "✓" : ""}
            </span>
            <span className="sr-only">{STREAK.week[i] ? "Done" : "Not yet"}</span>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="min-h-screen lg:flex" style={{ background: T.page, color: T.text }}>
      {/* Sidebar (desktop) */}
      <aside className="hidden w-60 shrink-0 flex-col p-5 lg:flex" style={{ background: T.deep }}>
        <Link href="/" aria-label="Overt home" className={`flex items-center gap-3 ${FOCUS}`}>
          <span className="grid h-8 w-8 grid-cols-2 gap-0.5" aria-hidden="true">
            <span className="rounded-sm" style={{ background: T.clay }} />
            <span className="rounded-sm" style={{ background: T.teal }} />
            <span className="rounded-sm" style={{ background: T.gold }} />
            <span className="rounded-sm" style={{ background: T.rose }} />
          </span>
          <div>
            <p className="font-display text-xl leading-tight text-parchment">Overt</p>
            <p className="text-xs" style={{ color: T.dim }}>
              See the whole picture
            </p>
          </div>
        </Link>

        <nav aria-label="Dashboard pages" className="mt-8 flex flex-col gap-1">
          {PAGES.map((p) => {
            const on = page === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                aria-current={on ? "page" : undefined}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium ${on ? "" : "hover:bg-white/10"} ${FOCUS}`}
                style={{ background: on ? "rgba(244,239,228,0.12)" : "transparent", color: on ? T.text : T.dim }}
              >
                {p.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 border-t pt-4" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <p className="px-4 pb-2 text-xs" style={{ color: T.dim }}>
            Website
          </p>
          <Link
            href="/"
            className={`block rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/10 ${FOCUS}`}
            style={{ color: T.dim }}
          >
            Home
          </Link>
          <Link
            href="/live-demo"
            className={`block rounded-lg px-4 py-2 text-sm font-medium hover:bg-white/10 ${FOCUS}`}
            style={{ color: T.dim }}
          >
            Try it live
          </Link>
        </div>

        <div className="mt-auto rounded-lg p-4 text-sm" style={{ background: "rgba(255,255,255,0.06)", color: T.dim }}>
          <p className="font-medium text-parchment">Privacy tip</p>
          <p className="mt-2">A username you reuse is a thread anyone can pull. Use a different one for each place.</p>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Nav (mobile) */}
        <nav
          aria-label="Dashboard pages"
          className="flex gap-1 overflow-x-auto px-4 py-3 lg:hidden"
          style={{ background: T.deep }}
        >
          {PAGES.map((p) => {
            const on = page === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPage(p.id)}
                aria-current={on ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${FOCUS}`}
                style={{ background: on ? "rgba(244,239,228,0.12)" : "transparent", color: on ? T.text : T.dim }}
              >
                {p.label}
              </button>
            );
          })}
          <Link
            href="/"
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${FOCUS}`}
            style={{ color: T.dim }}
          >
            Home
          </Link>
          <Link
            href="/live-demo"
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ${FOCUS}`}
            style={{ color: T.dim }}
          >
            Try it live
          </Link>
        </nav>

        <main className="mx-auto max-w-[1200px] px-5 py-6 lg:px-8">
          <header className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-medium">{title}</h1>
              <p className="mt-1 text-sm" style={{ color: T.muted }}>
                {meta.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border px-3 py-1 text-xs" style={{ borderColor: T.border, color: T.muted, background: T.card }}>
                Demo data
              </span>
              <Link
                href="/live-demo"
                className={`rounded-lg bg-parchment px-4 py-2 text-sm font-medium text-ink-deep transition-colors hover:bg-parchment-dim ${FOCUS}`}
              >
                Run a new audit
              </Link>
            </div>
          </header>

          <div className="mt-6">
            {/* ---------------- Dashboard ---------------- */}
            {page === "dashboard" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                  <Card className="col-span-2 lg:col-span-1">
                    <p className="text-sm font-medium" style={{ color: T.muted }}>
                      Footprint score
                    </p>
                    <Gauge score={current} color={band.color} />
                    <p className="mt-1 text-center text-sm font-medium" style={{ color: band.text }}>
                      {band.label}
                    </p>
                  </Card>
                  <Stat label="Exposed data points" value={totalItems} note="Pieces of info found" />
                  <Stat label="Connections found" value={CONNECTIONS.length} note="Details that link together" />
                  <Stat label="High risk items" value={highItems} note="Needs attention" valueColor={RISK.high.text} />
                  <Stat label="Last scan" value="2 days ago" note={HISTORY[HISTORY.length - 1].date} />
                </div>

                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <Card>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="max-w-md">
                        <h2 className="font-display text-xl font-medium">Your footprint map</h2>
                        <p className="mt-1 text-sm" style={{ color: T.muted }}>
                          Each group holds details about you. Dashed lines show how groups can be linked to identify
                          you.
                        </p>
                      </div>
                      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: T.muted }}>
                        {(["high", "medium", "low"] as Risk[]).map((r) => (
                          <li key={r} className="flex items-center gap-1.5">
                            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: RISK[r].color }} />
                            {RISK[r].label} risk
                          </li>
                        ))}
                        <li className="flex items-center gap-1.5">
                          <span
                            className="inline-block w-4 border-t-2 border-dashed"
                            style={{ borderColor: T.indirect }}
                          />
                          Indirect link
                        </li>
                      </ul>
                    </div>
                    <FootprintMap active={active} animate={!settings.reduceMotion} />
                  </Card>

                  <Card>
                    <h2 className="font-display text-xl font-medium">Connection details</h2>
                    <p className="mt-1 text-sm" style={{ color: T.muted }}>
                      Select one to see it on the map.
                    </p>
                    <ul className="mt-4 space-y-2">
                      {sortedConnections.map((c) => {
                        const on = c.id === active.id;
                        return (
                          <li key={c.id}>
                            <button
                              onClick={() => setSelectedId(c.id)}
                              aria-pressed={on}
                              className={`w-full rounded-lg p-3 text-left ${FOCUS}`}
                              style={{
                                background: on ? "rgba(244,239,228,0.08)" : T.inset,
                                borderLeft: `4px solid ${KIND[c.kind].color}`,
                              }}
                            >
                              <span className="block text-sm font-semibold">{c.title}</span>
                              <span className="mt-0.5 block text-sm" style={{ color: T.muted }}>
                                {c.why}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <button
                      onClick={() => setPage("connections")}
                      className={`mt-4 text-sm font-medium underline underline-offset-4 ${FOCUS}`}
                      style={{ color: T.gold }}
                    >
                      View full connection analysis
                    </button>
                  </Card>
                </div>

                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <Card>
                    <h2 className="font-display text-xl font-medium">Footprint over time</h2>
                    <div className="mt-3">
                      <TrendChart points={points} color={band.color} width={360} height={220} />
                    </div>
                    <p className="mt-2 text-sm font-medium" style={{ color: delta > 0 ? T.lowText : T.muted }}>
                      {delta > 0 ? `Down ${delta} points since your first audit` : "No change since your first audit"}
                    </p>
                  </Card>

                  <Card>
                    <h2 className="font-display text-xl font-medium">Top risk factors</h2>
                    <ul className="mt-2">
                      {RISKS.map((r) => (
                        <li
                          key={r.id}
                          className="flex items-center justify-between gap-3 border-b py-3 last:border-b-0"
                          style={{ borderColor: T.border }}
                        >
                          <span className="text-sm">{r.title}</span>
                          <Chip risk={r.risk}>{RISK[r.risk].label}</Chip>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setPage("recommendations")}
                      className={`mt-3 text-sm font-medium underline underline-offset-4 ${FOCUS}`}
                      style={{ color: T.gold }}
                    >
                      See how to fix them
                    </button>
                  </Card>

                  <Card>
                    <h2 className="font-display text-xl font-medium">Recommended actions</h2>
                    <ul className="mt-2">
                      {sortedRecs.slice(0, 4).map((r) => (
                        <ActionRow key={r.id} rec={r} checked={done.includes(r.id)} onToggle={() => toggle(r.id)} compact />
                      ))}
                    </ul>
                    <button
                      onClick={() => setPage("recommendations")}
                      className={`mt-3 text-sm font-medium underline underline-offset-4 ${FOCUS}`}
                      style={{ color: T.gold }}
                    >
                      View all recommendations
                    </button>
                  </Card>

                  <div>
                    {streakCard}
                    <button
                      onClick={() => setPage("progress")}
                      className={`mt-3 text-sm font-medium underline underline-offset-4 ${FOCUS}`}
                      style={{ color: T.gold }}
                    >
                      View progress
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- Connections ---------------- */}
            {page === "connections" && (
              <div>
                <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: T.muted }}>
                  {(Object.keys(KIND) as Kind[]).map((k) => (
                    <li key={k} className="flex items-center gap-2">
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: KIND[k].color }} />
                      <span>
                        {KIND[k].label}: {KIND[k].hint}
                      </span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-6 space-y-4">
                  {sortedConnections.map((c, i) => (
                    <li
                      key={c.id}
                      className="rounded-xl border p-5"
                      style={{ background: T.card, borderColor: T.border, borderLeft: `5px solid ${KIND[c.kind].color}` }}
                    >
                      {i === 0 && (
                        <p className="mb-1 text-sm font-medium" style={{ color: KIND[c.kind].color }}>
                          Most identifying link
                        </p>
                      )}
                      <p className="font-semibold">{c.title}</p>
                      <p className="mt-1 text-sm" style={{ color: T.muted }}>
                        {c.why}
                      </p>
                      <p className="mt-2 text-sm" style={{ color: T.muted }}>
                        Links {catLabel(c.cats[0])} and {catLabel(c.cats[1])}.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-medium" style={{ color: KIND[c.kind].color }}>
                          {KIND[c.kind].label}
                        </span>
                        <div className="h-1.5 w-32 rounded-full" style={{ background: T.border }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${c.weight * 10}%`, background: KIND[c.kind].color }}
                          />
                        </div>
                        <span style={{ color: T.muted }}>Strength {c.weight} of 10</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ---------------- Recommendations ---------------- */}
            {page === "recommendations" && (
              <Card>
                <p className="text-sm" style={{ color: T.muted }}>
                  {done.length} of {RECOMMENDATIONS.length} done. You have removed {removed} points so far, so your
                  score is now {current}.
                </p>
                <ul className="mt-2">
                  {sortedRecs.map((r) => (
                    <ActionRow key={r.id} rec={r} checked={done.includes(r.id)} onToggle={() => toggle(r.id)} />
                  ))}
                </ul>
              </Card>
            )}

            {/* ---------------- Progress ---------------- */}
            {page === "progress" && (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                  <Card>
                    <h2 className="font-display text-xl font-medium">Score over time</h2>
                    <p className="mb-3 mt-1 text-sm" style={{ color: T.muted }}>
                      Dashed lines mark the edges of the low and moderate ranges. Lower is safer.
                    </p>
                    <TrendChart points={points} color={band.color} />
                  </Card>
                  <Card>
                    <h2 className="font-display text-xl font-medium">Audit history</h2>
                    <table className="mt-3 w-full text-left text-sm">
                      <thead>
                        <tr style={{ color: T.muted }}>
                          <th scope="col" className="py-2 font-medium">
                            Date
                          </th>
                          <th scope="col" className="py-2 font-medium">
                            Score
                          </th>
                          <th scope="col" className="py-2 font-medium">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {points.map((p, i) => {
                          const change = i === 0 ? null : points[i - 1].value - p.value;
                          return (
                            <tr key={`${p.label}-${i}`} className="border-t" style={{ borderColor: T.border }}>
                              <td className="py-2.5">{p.label === "Now" ? "Now (after your actions)" : p.label}</td>
                              <td className="py-2.5 font-medium">{p.value}</td>
                              <td className="py-2.5" style={{ color: change && change > 0 ? T.lowText : T.muted }}>
                                {change === null ? "First audit" : change > 0 ? `Down ${change}` : "No change"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card>
                </div>
                <div>{streakCard}</div>
              </div>
            )}

            {/* ---------------- Settings ---------------- */}
            {page === "settings" && (
              <div className="grid gap-5 lg:grid-cols-2">
                <Card className="space-y-6">
                  <div>
                    <label htmlFor="display-name" className="block text-sm font-medium">
                      Display name
                    </label>
                    <input
                      id="display-name"
                      type="text"
                      maxLength={40}
                      value={settings.name}
                      onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
                      placeholder="First name or nickname"
                      className={`mt-2 w-full rounded-lg border px-3 py-2 ${FOCUS}`}
                      style={{ borderColor: T.border, background: T.inset, color: T.text }}
                    />
                    <p className="mt-2 text-sm" style={{ color: T.muted }}>
                      Only used for the greeting on the dashboard. A nickname works fine.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      id="reduce-motion"
                      type="checkbox"
                      checked={settings.reduceMotion}
                      onChange={(e) => setSettings((s) => ({ ...s, reduceMotion: e.target.checked }))}
                      className={`mt-1 h-5 w-5 ${FOCUS}`}
                      style={{ accentColor: T.teal }}
                    />
                    <label htmlFor="reduce-motion" className="cursor-pointer">
                      <span className="block text-sm font-medium">Reduce motion</span>
                      <span className="block text-sm" style={{ color: T.muted }}>
                        Highlights on the map change instantly instead of fading.
                      </span>
                    </label>
                  </div>

                  <div>
                    <button
                      onClick={() => {
                        if (window.confirm("Clear all completed actions?")) setDone([]);
                      }}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium ${FOCUS}`}
                      style={{ borderColor: T.high, color: RISK.high.text }}
                    >
                      Reset my progress
                    </button>
                    <p className="mt-2 text-sm" style={{ color: T.muted }}>
                      Clears your checked-off actions and puts your score back where it started.
                    </p>
                  </div>

                  <p className="border-t pt-4 text-sm" style={{ borderColor: T.border, color: T.muted }}>
                    This dashboard uses demo data. Nothing you do here is saved or sent anywhere.
                  </p>
                </Card>

                <Card>
                  <h2 className="font-display text-xl font-medium">Data sources</h2>
                  <p className="mt-1 text-sm" style={{ color: T.muted }}>
                    Overt combines these to build your score. Only the manual audit is live right now.
                  </p>
                  <ul className="mt-4 space-y-3">
                    {SOURCES.map((s) => (
                      <li key={s.id} className="rounded-lg p-4" style={{ background: T.inset }}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{s.name}</p>
                          <span className="flex items-center gap-2 text-sm" style={{ color: s.ok ? T.lowText : T.muted }}>
                            <span
                              className="inline-block h-2 w-2 rounded-full"
                              style={{ background: s.ok ? T.low : T.indirect }}
                            />
                            {s.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm" style={{ color: T.muted }}>
                          {s.text}
                        </p>
                        {s.href && (
                          <Link
                            href={s.href}
                            className={`mt-2 inline-block text-sm font-medium underline underline-offset-4 ${FOCUS}`}
                            style={{ color: T.gold }}
                          >
                            {s.cta}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
