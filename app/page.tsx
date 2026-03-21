export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-10 md:px-10 lg:px-12">
      <section className="mx-auto flex max-w-6xl flex-col gap-6">
        <span className="inline-flex w-fit rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-stone-600 backdrop-blur">
          Proposal Agent
        </span>
        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-stone-950 md:text-6xl">
            Generate Client-Winning Proposals in Seconds
          </h1>
          <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
            Turn a client website or job brief into a persuasive freelance proposal
            with real business context, clear deliverables, and a polished output you
            can edit before sending.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-black/10 bg-white/80 p-6 shadow-[0_20px_80px_rgba(35,25,15,0.08)] backdrop-blur">
            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-700">Client website</span>
                <input
                  aria-label="Client website"
                  className="h-11 rounded-2xl border border-black/10 bg-stone-50 px-4 outline-none"
                  placeholder="https://client.com"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-medium text-stone-700">Job description</span>
                <textarea
                  aria-label="Job description"
                  className="min-h-36 rounded-[24px] border border-black/10 bg-stone-50 px-4 py-3 outline-none"
                  placeholder="Paste the project brief, goals, and constraints..."
                />
              </label>
              <button className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-950 px-5 text-sm font-medium text-stone-50">
                Generate Proposal
              </button>
            </div>
          </div>
          <div className="rounded-[28px] border border-amber-900/10 bg-stone-950 p-6 text-stone-50 shadow-[0_20px_80px_rgba(35,25,15,0.16)]">
            <p className="text-sm uppercase tracking-[0.28em] text-stone-400">Demo flow</p>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-stone-300">
              <li>Paste a URL for live client context via Apify.</li>
              <li>Add a job description to sharpen intent and scope.</li>
              <li>Generate an editable proposal with copy-ready sections.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
