import Image from "next/image";
import dag from "@/public/images/airflow-dag.png";
import { BigStat, Card, Flow, Lede, Title, type Slide } from "./slide-kit";

const QUESTIONS = [
  ["1", "The business problem", "Why it mattered and who it affected"],
  ["2", "The data product", "What it does, how people use it, its value"],
  ["3", "The approach", "Sourcing, preparation, methods and tools"],
  ["4", "Challenges", "Technical, analytical and stakeholder"],
  ["5", "Proudest feature", "The part that made the rest trustworthy"],
  ["6", "With more time", "What I'd build next"],
];

export const SLIDES: Slide[] = [
  {
    id: "title",
    dark: true,
    minutes: 0.5,
    body: (
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-[20px] font-semibold uppercase tracking-wide text-white/60">Data product case study</p>
        <h1 className="mt-4 max-w-[1000px] text-[68px] font-bold leading-[1.05] text-white">
          PRIME: one governed data layer for a multi-tenant product
        </h1>
        <p className="mt-6 max-w-[900px] text-[26px] text-white/85">
          How StellarAlgo got Customer Success, Product and clients working from the same numbers, and the same pattern
          rebuilt live on City of Calgary transit data.
        </p>
        <p className="mt-12 text-[22px] font-semibold text-white">Cody Chandler</p>
        <p className="text-[18px] text-white/60">Data and Business Analyst interview · The City of Calgary</p>
      </div>
    ),
    notes: [
      "Thank the panel. One sentence on who you are: [Your story: one line on your background].",
      "Frame: I'll walk through a data product I led end to end, then show the same pattern working on the City's own open data.",
    ],
  },
  {
    id: "agenda",
    section: "Agenda",
    minutes: 0.3,
    body: (
      <>
        <Title>Your six questions, in order</Title>
        <div className="mt-8 grid flex-1 grid-cols-3 gap-5">
          {QUESTIONS.map(([n, q, d]) => (
            <div key={n} className="rounded-lg border border-cgy-line p-5">
              <p className="text-[40px] font-bold leading-none text-cgy-red">{n}</p>
              <p className="mt-3 text-[22px] font-bold text-cgy-navy">{q}</p>
              <p className="mt-1 text-[17px]">{d}</p>
            </div>
          ))}
        </div>
      </>
    ),
    notes: ["Keep this short. The section label in the top-left corner of every slide tells the panel which question you're on."],
  },
  {
    id: "problem",
    section: "1 · The business problem",
    minutes: 2.5,
    body: (
      <>
        <Title>Multi-tenancy made accurate reporting hard</Title>
        <Lede>Every client&apos;s data lived in its own database. Any question across clients meant querying each one separately.</Lede>
        <div className="mt-6 grid flex-1 grid-cols-[1fr_1.15fr] gap-8">
          <div className="flex flex-col justify-center rounded-lg bg-cgy-paper p-6">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">Before PRIME</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {["Client A", "Client B", "Client C", "Client D", "Client E", "…"].map((c) => (
                <div key={c} className="rounded border-2 border-cgy-silver bg-white px-2 py-3 text-center text-[16px] font-semibold text-cgy-navy">
                  {c}
                  <span className="block text-[12px] font-normal text-cgy-grey">own database</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-[24px] text-cgy-red">↓ manual weekly refresh ↓</p>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center text-[15px]">
              {["CS numbers", "Product numbers", "Client numbers"].map((r) => (
                <div key={r} className="rounded bg-white p-2 font-semibold text-cgy-navy">{r}</div>
              ))}
            </div>
            <p className="mt-3 text-center text-[15px] text-cgy-grey">Same question, different answers</p>
          </div>
          <div className="flex flex-col gap-3">
            <Card compact title="Stale">A manual weekly refresh meant data could be up to 7 days old.</Card>
            <Card compact title="Fragmented">Cross-property questions meant querying every client system separately, through engineering.</Card>
            <Card compact title="Unowned">Ownership was split across teams, with no agreed service levels when something broke.</Card>
            <Card compact title="Who it hurt" accent="navy">
              Customer Success, Product, clients and analysts, and later the AI assistants, which can only be as right as the data under them.
            </Card>
          </div>
        </div>
      </>
    ),
    notes: [
      "Why it mattered: when CS, Product and clients each have different numbers, meetings turn into arguments about whose number is right instead of decisions.",
      "[Your story: one concrete moment where inconsistent numbers caused a real problem with a client or internally.]",
      "Bridge to the City: a multi-tenant product with siloed data is a lot like departments that each keep their own system. The questions that matter usually cut across them.",
    ],
  },
  {
    id: "product",
    section: "2 · The data product",
    minutes: 2,
    body: (
      <>
        <Title>PRIME: one governed layer every consumer reads from</Title>
        <div className="mt-7">
          <Flow
            steps={[
              { label: "Sources", title: "Ticketing, accounts, apps", detail: "Logs, automations, segments, reference files" },
              { label: "Bronze", title: "Raw, as landed", detail: "Personal data masked on arrival" },
              { label: "Silver", title: "One definition", detail: "Dimensional model across all clients" },
              { label: "Gold", title: "Consumption tables", detail: "Rebuilt every run, tested first", highlight: true },
              { label: "Consumers", title: "CS · clients · BI · AI", detail: "Role-based access by consumer", dark: true },
            ]}
          />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-5">
          <Card title="A data contract" accent="navy">
            Refresh and accuracy targets per domain, three incident tiers, and a named owner for each.
          </Card>
          <Card title="Governed access" accent="navy">
            Personal data masked at the raw layer. Analysts, client dashboards and AI queries each get their own role.
          </Card>
          <Card title="Watched, not hoped" accent="navy">
            Daily refresh with Airflow and dbt. Freshness checked against client targets every 30 minutes, with AI-written error digests.
          </Card>
        </div>
        <div className="mt-auto flex items-center gap-6 rounded-lg bg-cgy-paper px-6 py-4">
          <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-red">My role</p>
          <p className="text-[19px] leading-snug text-cgy-navy">
            Director of Product Innovation &amp; Analytics. I owned PRIME&apos;s product management from planning through
            general availability, working with Data Engineering and Customer Success through a small product pod.
          </p>
        </div>
      </>
    ),
    notes: [
      "What it does: replaces a database per client with one Snowflake layer in bronze, silver and gold stages.",
      "Value: CS, Product and clients work from the same numbers on a reliable schedule.",
      "[Your story: what you personally decided as product owner, e.g. what PRIME had to guarantee and how you got teams to agree to it.]",
    ],
  },
  {
    id: "usage",
    section: "2 · The data product",
    minutes: 0.75,
    body: (
      <>
        <Title>How people use it: ask a question, get the right grain</Title>
        <div className="mt-7 grid flex-1 grid-cols-[1fr_1.1fr] gap-8">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-cgy-navy p-6 text-white">
              <p className="text-[15px] font-bold uppercase tracking-wide text-white/60">A CS manager asks</p>
              <p className="mt-2 text-[28px] font-semibold leading-snug">“How did ticket revenue trend this month?”</p>
            </div>
            <p className="text-[19px] leading-snug">
              The agent picks the semantic model whose <strong className="text-cgy-navy">grain</strong> fits the question and
              answers from it.
            </p>
            <p className="text-[19px] leading-snug">
              Grain matters: answering a campaign question from a daily table would double-count clicks.
            </p>
            <p className="mt-auto text-[15px] font-bold uppercase tracking-wide text-cgy-grey">The same gold tables feed</p>
            <div className="flex flex-wrap gap-2">
              {["Client success platform", "Client data sharing", "BI dashboards", "AI assistants"].map((c) => (
                <span key={c} className="rounded-full bg-cgy-paper px-3 py-1.5 text-[15px] font-semibold text-cgy-navy">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <table className="self-start text-left text-[18px]">
            <thead>
              <tr className="border-b-2 border-cgy-navy text-cgy-navy">
                <th className="py-2 pr-4">Semantic model</th>
                <th className="py-2">One row per…</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Team trends", "team per day"],
                ["Campaigns", "email campaign"],
                ["Segments", "audience segment"],
                ["Users", "user per day"],
                ["Automations", "automation"],
              ].map(([m, g]) => (
                <tr key={m} className="border-b border-cgy-line">
                  <td className="py-2.5 pr-4 font-semibold text-cgy-navy">{m}</td>
                  <td className="py-2.5">{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
    notes: [
      "Stellar Insights, the client-facing version, is in discovery. We shipped an internal Customer Success bot first, to prove accuracy on our own people before clients.",
    ],
  },
  {
    id: "results",
    section: "2 · The data product",
    minutes: 0.75,
    body: (
      <>
        <Title>What changed</Title>
        <div className="mt-8 grid grid-cols-4 gap-5">
          <BigStat from="7 days" value="< 12 hrs" label="Data freshness" />
          <BigStat value="100+" label="Tested, documented dbt models, replacing a database per client" />
          <BigStat value="30 min" label="Time to flag a missed refresh" />
          <BigStat value="Self-serve" label="Routine Customer Success questions, no engineering ticket" />
        </div>
        <Lede>
          The bigger change was trust: when the dashboard, the client export and the AI assistant give the same number,
          people stop checking and start deciding.
        </Lede>
        <div className="mt-auto grid grid-cols-2 gap-5 text-[18px]">
          <div className="rounded-lg border border-cgy-line p-5">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">Before</p>
            <p className="mt-2">A database per client, a manual weekly refresh, split ownership and no service levels.</p>
          </div>
          <div className="rounded-lg border-2 border-cgy-red p-5">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-red">After</p>
            <p className="mt-2">One governed layer, refreshed daily, with a contract that names an owner and a target for every domain.</p>
          </div>
        </div>
      </>
    ),
    notes: [
      "[Your story: any adoption or time-saved signal you can share, e.g. tickets avoided or teams onboarded.]",
      "Pause here. This is the end of the 'what'; next is the 'how'.",
    ],
  },
  {
    id: "bridge",
    dark: true,
    minutes: 0.3,
    body: (
      <div className="flex flex-1 flex-col justify-center">
        <p className="text-[20px] font-semibold uppercase tracking-wide text-white/60">3 · The approach</p>
        <h2 className="mt-4 max-w-[1050px] text-[56px] font-bold leading-[1.1] text-white">
          PRIME&apos;s data belongs to StellarAlgo&apos;s clients. So I rebuilt the pattern on Calgary&apos;s open data.
        </h2>
        <p className="mt-8 text-[26px] text-white/85">Same architecture. Real City data. Running daily, and live in this browser.</p>
      </div>
    ),
    notes: ["Say it plainly: I can't show client data, so here is the same build on data you know."],
  },
  {
    id: "approach",
    section: "3 · The approach",
    minutes: 3,
    body: (
      <>
        <Title>Calgary Transit: the same build, end to end</Title>
        <div className="mt-6">
          <Flow
            steps={[
              { label: "Source", title: "Calgary open data", detail: "Ridership, service hours, 271K transit 311 requests" },
              { label: "Bronze", title: "Airflow", detail: "Raw JSON, incremental 311 loads, load log" },
              { label: "Silver", title: "dbt", detail: "One definition across reorgs and renamed categories" },
              { label: "Gold", title: "dbt", detail: "5 tables, one declared grain each", highlight: true },
              { label: "Consumers", title: "Dashboard · AI agent", detail: "Read gold only", dark: true },
            ]}
          />
        </div>
        <div className="mt-6 grid min-h-0 flex-1 grid-cols-[1.6fr_1fr] gap-6">
          <div className="overflow-hidden rounded-lg border border-cgy-line">
            <Image src={dag} alt="Airflow graph of the calgary_transit DAG" className="h-full w-full object-contain" sizes="760px" />
          </div>
          <div className="flex flex-col gap-3 text-[18px]">
            <p><strong className="text-cgy-navy">Orchestration:</strong> one Airflow DAG, 31 tasks, triggered daily by GitHub Actions.</p>
            <p><strong className="text-cgy-navy">Modelling:</strong> 10 dbt models, 26 tests, reference tables for every mapping.</p>
            <p><strong className="text-cgy-navy">Storage:</strong> DuckDB here; the same dbt code runs on Snowflake.</p>
            <p><strong className="text-cgy-navy">Consumption:</strong> gold published to the site and queried in the browser.</p>
          </div>
        </div>
      </>
    ),
    notes: [
      "Sourcing: three datasets from the City's Socrata API. Ridership and service hours are full snapshots; 311 loads incrementally on the updated date with a 7-day lookback.",
      "LIVE DEMO (about 90 seconds): open the Dashboard tab. Point at the data contract strip first: trust before charts. Then trips vs boardings, then the rider-group chart's grey unallocated slices.",
      "If the room has no internet, the slides still carry the story; the dashboard is a bonus.",
    ],
  },
  {
    id: "challenges",
    section: "4 · Challenges",
    minutes: 2,
    body: (
      <>
        <Title>The hard parts were definitions and ownership, not code</Title>
        <div className="mt-6 grid flex-1 grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">At StellarAlgo</p>
            <Card title="Technical: one definition across clients">
              Every client system had its own shape. Silver became one dimensional model all properties map into.
            </Card>
            <Card title="Analytical: grain">
              The wrong table silently double-counts. Each semantic model declares one grain, and the agent must choose by it.
            </Card>
            <Card title="Stakeholders: nobody owned freshness">
              Split ownership, no service levels. The data contract named owners, targets and incident tiers that teams signed up to.
            </Card>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">In the City&apos;s data, this week</p>
            <Card title="One department, four codes" accent="teal">
              Calgary Transit appears in 311 as TRAN, OS, OSC and Tranc across reorganizations. A reference table unifies them.
            </Card>
            <Card title="Two measures called ridership" accent="teal">
              8.1M trips vs 13.6M boardings in one month. Kept separate and documented.
            </Card>
            <Card title="Totals that don't add up" accent="teal">
              Fare products never sum to the published total. The gap is an explicit, tested “unallocated” row.
            </Card>
          </div>
        </div>
      </>
    ),
    notes: [
      "[Your story: the stakeholder conversation that got the data contract agreed. Who pushed back, and what changed their mind?]",
      "Make the point: none of the City's issues are mistakes. They're what operational data looks like after years of change. The fix is to handle each one once, in code, with a test.",
      "Also found: 258 of 480 ridership rows are placeholders, and ridership lags 311 by more than a year. Both are on the How it's built page.",
    ],
  },
  {
    id: "proud",
    section: "5 · Proudest feature",
    minutes: 1.5,
    body: (
      <>
        <Title>AI answers that match the dashboard</Title>
        <Lede>
          An AI assistant is only as good as the layer under it. One documented grain per table and a tested contract are
          what make plain-English answers trustworthy.
        </Lede>
        <div className="mt-6 grid grid-cols-3 gap-5">
          <Card title="Reads the docs, not the raw data" accent="navy">
            The agent&apos;s instructions are generated from the dbt documentation: table grains, column meanings, and rules like “never add trips to boardings”.
          </Card>
          <Card title="Shows the SQL" accent="navy">
            Every answer displays the exact query and rows behind it. Anyone can check the number.
          </Card>
          <Card title="Can't touch what it shouldn't" accent="navy">
            It runs read-only queries on gold tables only, in the browser, with file and network access switched off.
          </Card>
        </div>
        <div className="mt-auto grid grid-cols-[1fr_1.4fr] items-stretch overflow-hidden rounded-lg pt-5">
          <div className="bg-cgy-paper p-5">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">You ask</p>
            <p className="mt-2 text-[22px] font-semibold leading-snug text-cgy-navy">“How has ridership recovered since the pandemic?”</p>
          </div>
          <pre className="bg-cgy-navy p-5 font-mono text-[15px] leading-relaxed text-white">{`-- the kind of query it writes, shown with every answer
select year, sum(trips) as trips
from transit_monthly_kpis
where has_ridership_data
group by year
having count(*) = 12   -- complete years only
order by year;`}</pre>
        </div>
      </>
    ),
    notes: [
      "LIVE DEMO (about 60 seconds): open Ask the data and click 'How has ridership recovered since the pandemic?'. Expand the SQL. Then compare the number with the dashboard tile.",
      "Why this is the proudest part: it's the moment governance stops being overhead and becomes the reason people can self-serve.",
    ],
  },
  {
    id: "next",
    section: "6 · With more time",
    minutes: 1.5,
    body: (
      <>
        <Title>What I&apos;d build next</Title>
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">PRIME</p>
            <Card title="Stellar Insights for clients">Take plain-English answers from the internal CS bot to clients, on the same semantic layer.</Card>
            <Card title="Contract health as a product metric">Report freshness and incident history to the teams that own each domain.</Card>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-[15px] font-bold uppercase tracking-wide text-cgy-grey">Calgary Transit replica</p>
            <Card title="On-time performance" accent="teal">The City publishes real-time vehicle positions and trip updates every 30 seconds; land them to measure reliability by route.</Card>
            <Card title="An equity lens" accent="teal">Join requests and service to the Calgary Equity Index and census data by community.</Card>
            <Card title="Owner sign-off" accent="teal">Agree freshness targets and category mappings with the people who run the service.</Card>
          </div>
        </div>
        <div className="mt-5 rounded-lg bg-cgy-navy px-6 py-4 text-[20px] leading-snug text-white">
          The same work at the City: find where numbers disagree, agree one definition with the people who own it, and make
          it self-serve.
        </div>
      </>
    ),
    notes: [
      "[Your story: anything else you'd change about PRIME in hindsight.]",
      "Close the loop to the role: a Data and Business Analyst at the City does this work: find where numbers disagree, agree one definition with the people who own it, and make it self-serve.",
    ],
  },
  {
    id: "close",
    dark: true,
    minutes: 0.4,
    body: (
      <div className="flex flex-1 flex-col justify-center">
        <h2 className="text-[64px] font-bold text-white">Thank you. Questions?</h2>
        <p className="mt-6 max-w-[900px] text-[24px] text-white/85">
          Everything shown today is public: the live dashboard, the agent, the pipeline code and the dbt documentation.
        </p>
        <div className="mt-10 grid max-w-[900px] grid-cols-2 gap-x-10 gap-y-3 text-[20px]">
          <p className="text-white/60">Code</p>
          <p className="font-semibold text-white">github.com/frontier-platforms/data-product-use-case</p>
          <p className="text-white/60">dbt docs</p>
          <p className="font-semibold text-white">frontier-platforms.github.io/data-product-use-case</p>
        </div>
      </div>
    ),
    notes: ["Stop talking. Leave this slide up during questions."],
  },
];
