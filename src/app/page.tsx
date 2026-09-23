import MosaicHero from "@/components/MosaicHero";
import Link from "next/link";

const workflow = [
  { color: "#C97B4A", word: "Discover", body: "Identify the pieces of information that make up your public presence." },
  { color: "#4F9C93", word: "Understand", body: "See how those pieces connect into a single, more identifiable picture." },
  { color: "#D6B25E", word: "Act", body: "Get specific, prioritized steps for reducing exposure that matters." },
  { color: "#B86B7A", word: "Measure", body: "Come back later and see whether the picture actually got smaller." },
];

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <main className="flex-1">
        <section className="px-6 sm:px-12 pt-10 sm:pt-16 pb-20 sm:pb-28">
          <div className="mx-auto max-w-6xl grid gap-16 md:grid-cols-2 md:items-center">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl sm:text-5xl leading-[1.1]">
                Your information is harmless on its own. Combined, it isn&apos;t.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-parchment-dim leading-relaxed">
                Overt shows how scattered details - a school, a hometown, a
                username - connect into a picture far more identifiable than
                any single post. Then it helps you take it apart.
              </p>
              <div className="mt-9 flex items-center gap-4 flex-wrap">
                <Link
                  href="/live-demo"
                  className={`inline-flex items-center rounded-md bg-parchment px-5 py-3 text-sm font-medium text-ink-deep hover:bg-parchment-dim transition-colors ${FOCUS}`}
                >
                  Try it live
                </Link>
                <a
                  href="#workflow"
                  className={`inline-flex items-center rounded-md border border-white/15 px-5 py-3 text-sm font-medium text-parchment hover:border-white/30 transition-colors ${FOCUS}`}
                >
                  See how it works
                </a>
              </div>
            </div>
            <MosaicHero />
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 px-6 sm:px-12 pb-24 sm:pb-32 border-t border-white/10">
          <div className="mx-auto max-w-6xl pt-16 sm:pt-20">
            <h2 className="font-display text-2xl sm:text-3xl max-w-md">Four steps, not one scan.</h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((w) => (
                <div key={w.word}>
                  <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: w.color }} aria-hidden />
                  <h3 className="font-display text-xl mt-4">{w.word}</h3>
                  <p className="mt-2 text-sm text-parchment-dim leading-relaxed">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 sm:px-12 pb-24 sm:pb-32 border-t border-white/10">
          <div className="mx-auto max-w-6xl pt-16 sm:pt-20 grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl max-w-md">
                See the whole picture, then watch it shrink.
              </h2>
              <p className="mt-4 max-w-md text-parchment-dim leading-relaxed">
                Map your connections in the live demo. Then open the dashboard to see your score, the links that
                matter most, and a checklist that lowers your exposure as you go.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 md:justify-end">
              <Link
                href="/live-demo"
                className={`inline-flex items-center rounded-md bg-parchment px-5 py-3 text-sm font-medium text-ink-deep hover:bg-parchment-dim transition-colors ${FOCUS}`}
              >
                Try it live
              </Link>
              <Link
                href="/dashboard"
                className={`inline-flex items-center rounded-md border border-white/15 px-5 py-3 text-sm font-medium text-parchment hover:border-white/30 transition-colors ${FOCUS}`}
              >
                Open the dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 sm:px-12 py-8 border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="text-xs text-parchment-dim">Overt, {new Date().getFullYear()}.</span>
          <nav aria-label="Footer" className="flex gap-5 text-xs text-parchment-dim">
            <Link href="/" className={`hover:text-parchment transition-colors ${FOCUS}`}>
              Home
            </Link>
            <Link href="/live-demo" className={`hover:text-parchment transition-colors ${FOCUS}`}>
              Try it live
            </Link>
            <Link href="/dashboard" className={`hover:text-parchment transition-colors ${FOCUS}`}>
              Dashboard
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
