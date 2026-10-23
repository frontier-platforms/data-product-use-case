import type { Metadata } from "next";
import Image from "next/image";
import { Architecture } from "@/components/architecture";
import { ContractTable } from "@/components/contract-table";
import dag from "@/public/images/airflow-dag.png";

export const metadata: Metadata = { title: "How it's built" };

const MAPPING = [
  ["Warehouse", "Snowflake", "DuckDB (same dbt models; the adapter is the only change)"],
  ["Orchestration", "Airflow", "Airflow, with dbt rendered as tasks by Astronomer Cosmos, triggered daily by GitHub Actions"],
  ["Transformation", "dbt, 100+ tested models, bronze / silver / gold", "dbt, bronze / silver / gold, tests after every model"],
  ["Data contract", "Refresh and accuracy targets per domain, three incident tiers, named owners", "A versioned contract seed, checked every run and shown on the dashboard"],
  ["Access control", "PII masked at bronze; role-based access for analysts, dashboards and AI", "Only gold is published; the browser database blocks files, URLs and writes"],
  ["Monitoring", "Freshness checked every 30 minutes; AI-written error digests", "dbt source freshness; a stale Tier 1 feed fails the run"],
  ["Semantic layer and AI", "Grain-specific semantic models behind Stellar Insights", "Gold tables with one declared grain, documented in dbt and read by the agent"],
];

const ISSUES = [
  {
    title: "One department, four codes",
    body: "311 files Calgary Transit under TRAN, OS, OSC and Tranc as the organization changed. Filtering on one code silently drops most requests. A reference table maps every code to one department.",
  },
  {
    title: "67 request types, 12 categories",
    body: "Request types were retired (“Z CT -”), renamed and split over 15 years. A governed mapping keeps trends continuous. A new, unmapped type fails the build instead of disappearing from a chart.",
  },
  {
    title: "Two measures called ridership",
    body: "June 2025: 8.1M trips and 13.6M boardings. A transfer is one trip but two boardings. They are separate, documented columns, and the agent is told never to add them.",
  },
  {
    title: "Totals that don’t add up",
    body: "Published fare products never sum to published ridership. The gap is carried as explicit unallocated rows so every breakdown reconciles (tested every run). 58 months where the breakdown exceeds the total raise a warning.",
  },
  {
    title: "Rows that look like data",
    body: "258 of the 480 ridership rows hold a date and nothing else. They are dropped in silver, and freshness is measured on real values, not on the newest placeholder.",
  },
  {
    title: "Feeds that move at different speeds",
    body: "311 is current to yesterday; ridership and service hours lag by more than a year. The contract gives each domain its own target, so the lag is visible instead of surprising.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-cgy-red">The approach</p>
      <h1 className="mt-1 text-3xl font-bold">How it&apos;s built</h1>
      <p className="mt-2 max-w-3xl">
        The same pattern as PRIME, rebuilt on public data: land raw data untouched, model it once with tests, and let
        every consumer read only the governed gold layer.
      </p>

      <section className="mt-8">
        <Architecture />
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">PRIME and this replica</h2>
        <div className="mt-4 overflow-x-auto rounded-lg border border-cgy-line">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-cgy-mist text-cgy-navy">
              <tr>
                <th className="px-3 py-2 font-semibold">Concern</th>
                <th className="px-3 py-2 font-semibold">PRIME at StellarAlgo</th>
                <th className="px-3 py-2 font-semibold">Calgary Transit replica</th>
              </tr>
            </thead>
            <tbody>
              {MAPPING.map(([concern, prime, replica]) => (
                <tr key={concern} className="border-t border-cgy-line align-top">
                  <td className="px-3 py-2 font-semibold text-cgy-navy">{concern}</td>
                  <td className="px-3 py-2">{prime}</td>
                  <td className="px-3 py-2">{replica}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">The pipeline in Airflow</h2>
        <p className="mt-2 max-w-3xl">
          One DAG, 31 tasks: three extract-and-load tasks into bronze, a freshness check, then every dbt model as its own
          run and test pair, grouped into seeds, silver and gold. Tests that span several models wait for all of them.
        </p>
        <a href={dag.src} className="mt-4 block overflow-hidden rounded-lg border border-cgy-line bg-white">
          <Image src={dag} loading="eager" alt="Airflow graph of the calgary_transit DAG: bronze loads, freshness check, dbt seeds, silver and gold task groups, reconciliation test, docs and publish." sizes="(min-width: 1152px) 1152px, 100vw" className="h-auto w-full" />
        </a>
        <p className="mt-2 text-xs text-cgy-grey">Successful run on a brand-new warehouse. Select the image to open it full size.</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Six problems in the City&apos;s published data</h2>
        <p className="mt-2 max-w-3xl">
          None of these are errors by the City. They are what real operational data looks like after years of
          reorganizations and changing programs. The point of a governed layer is that each one is handled once, in code,
          with a test, instead of in every report.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ISSUES.map((i) => (
            <div key={i.title} className="rounded-lg border border-cgy-line border-l-4 border-l-cgy-red bg-white p-4">
              <h3 className="font-bold">{i.title}</h3>
              <p className="mt-2 text-sm">{i.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">The data contract</h2>
        <p className="mt-2 mb-4 max-w-3xl">
          Each domain has an owner, a refresh target, an incident tier and an accuracy rule. This table is read live from
          the gold layer.
        </p>
        <ContractTable />
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-3">
        <div>
          <h2 className="text-xl font-bold">Tested every run</h2>
          <p className="mt-2 text-sm">
            26 dbt tests across 10 models: unique and not-null keys, accepted values, ranges, unique grain per gold table, every service name
            and agency mapped, and fare products reconciling to the official total. A failing test stops publishing.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold">Access by design</h2>
          <p className="mt-2 text-sm">
            Only gold leaves the warehouse. The website and the AI agent load those tables into a browser database with
            file, network and write access switched off, so they cannot reach raw or intermediate data.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-bold">Open to inspect</h2>
          <p className="mt-2 text-sm">
            The code, the{" "}
            <a className="font-semibold text-cgy-blue underline" href="https://frontier-platforms.github.io/data-product-use-case/">
              dbt docs and lineage
            </a>
            , and the run history are public. The{" "}
            <a className="font-semibold text-cgy-blue underline" href="https://github.com/frontier-platforms/data-product-use-case">
              GitHub repository
            </a>{" "}
            has the commands to run the whole pipeline locally.
          </p>
        </div>
      </section>
    </div>
  );
}
