"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default function SiteHeader() {
  const pathname = usePathname() ?? "";

  // The dashboard has its own sidebar, so it does not need this bar.
  if (pathname.startsWith("/dashboard")) return null;

  const onHome = pathname === "/";
  const onDemo = pathname.startsWith("/live-demo");

  const linkClass = (on: boolean) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${
      on
        ? "text-parchment underline decoration-gold decoration-2 underline-offset-8"
        : "text-parchment-dim hover:text-parchment"
    } ${FOCUS}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink-deep/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 sm:px-12">
        <Link href="/" aria-label="Overt home" className={`flex items-center gap-3 rounded-md ${FOCUS}`}>
          <span className="grid h-6 w-6 grid-cols-2 gap-0.5" aria-hidden="true">
            <span className="rounded-sm bg-clay" />
            <span className="rounded-sm bg-teal" />
            <span className="rounded-sm bg-gold" />
            <span className="rounded-sm bg-rose" />
          </span>
          <span className="font-display text-lg tracking-tight">Overt</span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          <Link
            href="/"
            aria-current={onHome ? "page" : undefined}
            className={`hidden sm:inline-flex ${linkClass(onHome)}`}
          >
            Home
          </Link>
          <Link href="/live-demo" aria-current={onDemo ? "page" : undefined} className={linkClass(onDemo)}>
            Try it live
          </Link>
          <Link
            href="/dashboard"
            className={`ml-2 rounded-md bg-parchment px-4 py-2 text-sm font-medium text-ink-deep transition-colors hover:bg-parchment-dim ${FOCUS}`}
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
