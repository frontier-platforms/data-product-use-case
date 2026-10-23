import type { Metadata } from "next";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-wide text-cgy-red">Gold layer, live in your browser</p>
      <h1 className="mt-1 text-3xl font-bold">Calgary Transit at a glance</h1>
      <p className="mt-2 max-w-3xl text-cgy-charcoal">
        Every chart below runs a SQL query against the published gold tables using DuckDB in your browser. Nothing here
        is pre-computed for the page: the numbers are the same ones the AI agent sees.
      </p>
      <Dashboard />
    </div>
  );
}
