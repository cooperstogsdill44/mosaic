import MosaicHero from "@/components/MosaicHero";

const workflow = [
  {
    color: "#C97B4A",
    word: "Discover",
    body: "Identify the pieces of information that make up a student's public presence.",
  },
  {
    color: "#4F9C93",
    word: "Understand",
    body: "See how those pieces connect into a single, more identifiable picture.",
  },
  {
    color: "#D6B25E",
    word: "Act",
    body: "Get specific, prioritized steps for reducing exposure that matters.",
  },
  {
    color: "#B86B7A",
    word: "Measure",
    body: "Come back later and see whether the picture actually got smaller.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1">
      <header className="flex items-center justify-between px-6 py-6 sm:px-12 sm:py-8">
        <span className="font-display text-lg tracking-tight">Mosaic</span>
        <span className="text-xs text-parchment-dim">
          a student capstone project
        </span>
      </header>

      <main className="flex-1">
        <section className="px-6 sm:px-12 pt-10 sm:pt-16 pb-20 sm:pb-28">
          <div className="mx-auto max-w-6xl grid gap-16 md:grid-cols-2 md:items-center">
            <div className="max-w-xl">
              <h1 className="font-display text-4xl sm:text-5xl leading-[1.1]">
                Your information is harmless on its own. Combined, it isn&apos;t.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-parchment-dim leading-relaxed">
                Mosaic shows high school students how scattered details — a
                school, a hometown, a username — connect into a picture far
                more identifiable than any single post. Then it helps you
                take it apart.
              </p>
              <div className="mt-9 flex items-center gap-5">
                <a
                  href="#workflow"
                  className="inline-flex items-center rounded-md bg-parchment px-5 py-3 text-sm font-medium text-ink-deep hover:bg-parchment-dim transition-colors"
                >
                  See how it works
                </a>
                <span className="text-sm text-parchment-dim">
                  No sign-up needed to look around.
                </span>
              </div>
            </div>

            <MosaicHero />
          </div>
        </section>

        <section
          id="workflow"
          className="px-6 sm:px-12 pb-24 sm:pb-32 border-t border-white/10"
        >
          <div className="mx-auto max-w-6xl pt-16 sm:pt-20">
            <h2 className="font-display text-2xl sm:text-3xl max-w-md">
              Four steps, not one scan.
            </h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((w) => (
                <div key={w.word}>
                  <span
                    className="inline-block h-3 w-3 rounded-sm"
                    style={{ backgroundColor: w.color }}
                    aria-hidden
                  />
                  <h3 className="font-display text-xl mt-4">{w.word}</h3>
                  <p className="mt-2 text-sm text-parchment-dim leading-relaxed">
                    {w.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 sm:px-12 py-8 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-parchment-dim">
          Mosaic — built for a high school capstone, {new Date().getFullYear()}.
        </span>
      </footer>
    </div>
  );
}
