"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Panel, PanelState } from "@/components/panel";
import { AXIS, C, RIDER_GROUP_COLOURS } from "@/components/charts/palette";
import { useQuery } from "@/lib/use-query";
import { fmtCompact, fmtDate, fmtMonth, fmtNumber, fmtPct, titleCase } from "@/lib/format";

type Contract = {
  domain: string;
  freshness_status: string;
  latest_data_date: string;
  days_since_latest_data: number;
  freshness_target_days: number;
  publish_cadence: string;
  incident_tier: string;
};

type Annual = {
  year: number;
  trips: number;
  boardings: number;
  service_hours: number;
  requests: number;
  months_with_ridership: number;
};

const Q_CONTRACT = `
select domain, freshness_status, latest_data_date, days_since_latest_data,
       freshness_target_days, publish_cadence, incident_tier
from data_contract_status
order by incident_tier, domain`;

const Q_ANNUAL = `
select year,
       sum(trips) as trips,
       sum(boardings) as boardings,
       sum(service_hours) as service_hours,
       sum(customer_requests_311) as requests,
       count(*) filter (where has_ridership_data) as months_with_ridership
from transit_monthly_kpis
group by year
order by year`;

const Q_MONTHLY = `
select month, trips, boardings
from transit_monthly_kpis
where has_ridership_data
order by month`;

const Q_FARE_MIX = `
with complete_years as (
    select year from transit_monthly_kpis group by year having count(*) filter (where has_ridership_data) = 12
)
select year, rider_group, sum(trips) as trips
from ridership_by_fare_product
where year >= 2014 and year in (select year from complete_years)
group by year, rider_group
order by year`;

export function Dashboard() {
  const annual = useQuery<Annual>(Q_ANNUAL);
  const years = useMemo(() => (annual.rows ?? []).map((r) => r.year), [annual.rows]);
  const latestRequestYear = years.length ? years[years.length - 1] : null;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? (latestRequestYear ? latestRequestYear - 1 : null);

  return (
    <div className="mt-8 space-y-6">
      <ContractStrip />
      <KpiTiles annual={annual.rows} error={annual.error} />
      <div className="grid gap-6 lg:grid-cols-5">
        <RidershipTrend className="lg:col-span-3" />
        <Productivity annual={annual.rows} error={annual.error} className="lg:col-span-2" />
      </div>
      <FareMix />
      <div className="flex flex-wrap items-center gap-3 border-t border-cgy-line pt-6">
        <h2 className="text-xl font-bold">311 service requests</h2>
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
          Year
          <select
            className="rounded border border-cgy-silver bg-white px-2 py-1 text-sm"
            value={selectedYear ?? ""}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years
              .filter((y) => y >= 2012)
              .slice()
              .reverse()
              .map((y) => (
                <option key={y} value={y}>
                  {y}
                  {y === latestRequestYear ? " (year to date)" : ""}
                </option>
              ))}
          </select>
        </label>
      </div>
      {selectedYear && (
        <div className="grid gap-6 lg:grid-cols-2">
          <RequestCategories year={selectedYear} />
          <Communities year={selectedYear} />
        </div>
      )}
    </div>
  );
}

function ContractStrip() {
  const { rows, error } = useQuery<Contract>(Q_CONTRACT);
  return (
    <Panel
      title="Data contract status"
      subtitle="Each domain has an owner, a refresh target and an incident tier. Trust comes first: if a feed is behind, the dashboard says so."
      source="data_contract_status"
    >
      {!rows ? (
        <PanelState error={error} height={96} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map((r) => {
            const ok = r.freshness_status === "Meeting target";
            return (
              <div key={r.domain} className="rounded border border-cgy-line p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-cgy-navy">{r.domain}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${ok ? "bg-cgy-green" : "bg-cgy-orange"}`}
                  >
                    {r.freshness_status}
                  </span>
                </div>
                <p className="mt-2 text-sm">
                  Latest data <span className="font-semibold">{fmtDate(r.latest_data_date)}</span>
                </p>
                <p className="text-xs text-cgy-grey">
                  {fmtNumber(r.days_since_latest_data)} days old · target {fmtNumber(r.freshness_target_days)} days ·{" "}
                  {r.incident_tier}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

function KpiTiles({ annual, error }: { annual: Annual[] | null; error: string | null }) {
  if (!annual) return <PanelState error={error} height={112} />;
  const complete = annual.filter((r) => r.months_with_ridership === 12);
  const latest = complete[complete.length - 1];
  const baseline = annual.find((r) => r.year === 2019);
  if (!latest || !baseline) return null;

  const perHour = (r: Annual) => r.trips / r.service_hours;
  const per100k = (r: Annual) => (r.requests * 100000) / r.trips;
  const tiles = [
    {
      label: `Trips in ${latest.year}`,
      value: fmtCompact(latest.trips),
      note: `${fmtPct((latest.trips / baseline.trips) * 100)} of 2019, before the pandemic`,
    },
    {
      label: "Boardings per trip",
      value: fmtNumber(latest.boardings / latest.trips, 2),
      note: `${fmtCompact(latest.boardings)} boardings: transfers count twice`,
    },
    {
      label: "Trips per service hour",
      value: fmtNumber(perHour(latest), 1),
      note: `${fmtNumber(perHour(baseline), 1)} in 2019`,
    },
    {
      label: "311 requests per 100k trips",
      value: fmtNumber(per100k(latest), 1),
      note: `${fmtNumber(per100k(baseline), 1)} in 2019`,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-lg border-l-4 border-cgy-red bg-cgy-paper p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cgy-grey">{t.label}</p>
          <p className="tabular mt-1 text-3xl font-bold text-cgy-navy">{t.value}</p>
          <p className="mt-1 text-xs text-cgy-charcoal">{t.note}</p>
        </div>
      ))}
    </div>
  );
}

function RidershipTrend({ className }: { className?: string }) {
  const { rows, error } = useQuery<{ month: string; trips: number; boardings: number }>(Q_MONTHLY);
  return (
    <Panel
      className={className}
      title="Monthly ridership: two different measures"
      subtitle="Trips count a journey once. Boardings count every vehicle boarded. Both are published as “ridership”; they are never added together."
      source="transit_monthly_kpis"
    >
      {!rows ? (
        <PanelState error={error} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis
              dataKey="month"
              {...AXIS}
              tickFormatter={(m: string) => m.slice(0, 4)}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis {...AXIS} tickFormatter={(v: number) => fmtCompact(v)} width={48} />
            <Tooltip labelFormatter={(m) => fmtMonth(String(m))} formatter={(v) => fmtNumber(Number(v))} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="boardings" name="Boardings" stroke={C.navy} dot={false} strokeWidth={2} />
            <Line type="monotone" dataKey="trips" name="Trips" stroke={C.red} dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function Productivity({
  annual,
  error,
  className,
}: {
  annual: Annual[] | null;
  error: string | null;
  className?: string;
}) {
  const data = (annual ?? [])
    .filter((r) => r.months_with_ridership === 12)
    .map((r) => ({ year: r.year, perHour: Math.round((r.trips / r.service_hours) * 10) / 10 }));
  return (
    <Panel
      className={className}
      title="Trips per service hour"
      subtitle="How much ridership each hour of bus, CTrain and shuttle service carries. Complete years only."
      source="transit_monthly_kpis"
    >
      {!annual ? (
        <PanelState error={error} />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="year" {...AXIS} tickFormatter={(y: number) => `’${String(y).slice(2)}`} />
            <YAxis {...AXIS} width={32} />
            <Tooltip formatter={(v) => [fmtNumber(Number(v), 1), "Trips per hour"]} />
            <Bar dataKey="perHour" fill={C.teal} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function FareMix() {
  const { rows, error } = useQuery<{ year: number; rider_group: string; trips: number }>(Q_FARE_MIX);
  const { data, groups } = useMemo(() => {
    const byYear = new Map<number, Record<string, number>>();
    const totals = new Map<number, number>();
    for (const r of rows ?? []) {
      totals.set(r.year, (totals.get(r.year) ?? 0) + r.trips);
    }
    for (const r of rows ?? []) {
      const entry = byYear.get(r.year) ?? { year: r.year };
      entry[r.rider_group] = Math.round((r.trips / (totals.get(r.year) ?? 1)) * 1000) / 10;
      byYear.set(r.year, entry);
    }
    const order = Object.keys(RIDER_GROUP_COLOURS);
    const present = new Set((rows ?? []).map((r) => r.rider_group));
    return { data: [...byYear.values()], groups: order.filter((g) => present.has(g)) };
  }, [rows]);

  return (
    <Panel
      title="Who rides: share of trips by rider group"
      subtitle="The City’s fare breakdown never adds up to its own total. The gap is kept as an explicit “Unallocated” share, so every bar reconciles to official ridership."
      source="ridership_by_fare_product"
    >
      {!rows ? (
        <PanelState error={error} />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.line} vertical={false} />
            <XAxis dataKey="year" {...AXIS} />
            <YAxis {...AXIS} unit="%" width={52} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} allowDataOverflow />
            <Tooltip formatter={(v, name) => [fmtPct(Number(v), 1), name]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {groups.map((g) => (
              <Bar key={g} dataKey={g} stackId="mix" fill={RIDER_GROUP_COLOURS[g]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function RequestCategories({ year }: { year: number }) {
  const sql = `
select service_category,
       sum(requests) as requests,
       round(sum(pct_closed_within_7_days * closed_requests) / nullif(sum(closed_requests), 0), 1) as pct_within_7
from service_requests_monthly
where department = 'Calgary Transit' and year = ${year}
group by service_category
order by requests desc`;
  const { rows, error } = useQuery<{ service_category: string; requests: number; pct_within_7: number }>(sql);
  const height = Math.max(220, (rows?.length ?? 8) * 30);
  return (
    <Panel
      title={`What riders contact 311 about (${year})`}
      subtitle="67 raw request types, including retired and renamed ones, mapped to 12 stable categories."
      source="service_requests_monthly"
    >
      {!rows ? (
        <PanelState error={error} height={height} />
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={C.line} horizontal={false} />
            <XAxis type="number" {...AXIS} tickFormatter={(v: number) => fmtCompact(v)} />
            <YAxis type="category" dataKey="service_category" {...AXIS} width={170} interval={0} />
            <Tooltip
              formatter={(v) => [fmtNumber(Number(v)), "Requests"]}
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload as { pct_within_7?: number } | undefined;
                return `${label} · ${fmtPct(p?.pct_within_7)} closed within 7 days`;
              }}
            />
            <Bar dataKey="requests" fill={C.red} radius={[0, 2, 2, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}

function Communities({ year }: { year: number }) {
  const sql = `
select community_name, sum(requests) as requests
from service_requests_by_community
where year = ${year}
group by community_name
order by requests desc
limit 10`;
  const { rows, error } = useQuery<{ community_name: string; requests: number }>(sql);
  const max = rows?.[0]?.requests ?? 1;
  return (
    <Panel
      title={`Communities with the most transit requests (${year})`}
      subtitle="About a quarter of requests have no community recorded and are left out rather than guessed."
      source="service_requests_by_community"
    >
      {!rows ? (
        <PanelState error={error} />
      ) : (
        <ol className="space-y-2">
          {rows.map((r, i) => (
            <li key={r.community_name} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-2 text-sm">
              <span className="tabular text-cgy-grey">{i + 1}</span>
              <div>
                <p className="font-semibold text-cgy-navy">{titleCase(r.community_name)}</p>
                <div className="mt-1 h-1.5 rounded bg-cgy-mist">
                  <div className="h-1.5 rounded bg-cgy-blue" style={{ width: `${(r.requests / max) * 100}%` }} />
                </div>
              </div>
              <span className="tabular font-semibold">{fmtNumber(r.requests)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
