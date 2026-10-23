import Link from "next/link";

const SECTIONS = [
  {
    href: "/presentation",
    title: "Presentation",
    body: "The 15-minute walkthrough: the problem PRIME solved, how it was built, and what it changed.",
  },
  {
    href: "/dashboard",
    title: "Dashboard",
    body: "Calgary Transit ridership, service and 311 requests, queried live from the gold layer in your browser.",
  },
  {
    href: "/ask",
    title: "Ask the data",
    body: "Ask a question in plain English. The agent writes SQL against the gold tables and shows its work.",
  },
  {
    href: "/how-it-works",
    title: "How it's built",
    body: "Airflow, dbt and DuckDB: the pipeline, the data contract, and the data problems it had to solve.",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-cgy-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/70">Data product case study</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-bold text-white sm:text-5xl">
            One governed data layer, so every number matches.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">
            At StellarAlgo I led PRIME, which consolidated client data trapped in a multi-tenant architecture into one
            tested, documented layer. This site rebuilds the same pattern on City of Calgary open data, so you can see how
            it works.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/presentation"
              className="rounded bg-cgy-red px-5 py-2.5 font-semibold text-white hover:bg-cgy-red-dark"
            >
              Start the presentation
            </Link>
            <Link
              href="/dashboard"
              className="rounded border border-white/40 px-5 py-2.5 font-semibold text-white hover:border-white"
            >
              Open the dashboard
            </Link>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group rounded-lg border border-cgy-line border-t-4 border-t-cgy-red bg-white p-5 transition-shadow hover:shadow-md"
          >
            <h2 className="text-lg font-bold group-hover:text-cgy-red">{s.title}</h2>
            <p className="mt-2 text-sm">{s.body}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
