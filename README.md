# Calgary Transit data product

A working replica of the PRIME pattern (one governed data layer that every consumer trusts), built on City of Calgary open data.

```
Calgary open data API (Socrata)
   │  Airflow: Python extract/load tasks
   ▼
bronze      raw JSON records exactly as published, with batch metadata
   │  Airflow: dbt via Astronomer Cosmos (one task per model, tests after each)
   ▼
silver      typed, deduplicated, one definition (reference seeds map reorgs and renamed categories)
   │
   ▼
gold        consumption tables, each with one declared grain
   │  publish: gold only, as Parquet + a catalog generated from dbt docs
   ▼
website     dashboard (DuckDB-WASM in the browser) and AI agent (writes SQL against gold only)
```

## Sources

| Domain | Dataset | Load |
|---|---|---|
| Ridership by fare product | [iema-jbc4](https://data.calgary.ca/resource/iema-jbc4.json) | Full snapshot |
| Service hours by mode | [64iy-rpqq](https://data.calgary.ca/resource/64iy-rpqq.json) | Full snapshot |
| 311 requests (transit slice) | [iahh-g8bj](https://data.calgary.ca/resource/iahh-g8bj.json) | Incremental on `updated_date`, 7-day lookback |

## Gold tables

| Table | Grain |
|---|---|
| `transit_monthly_kpis` | month (2012+) |
| `ridership_by_fare_product` | month x rider group x fare product |
| `service_requests_monthly` | month x department x program x category |
| `service_requests_by_community` | year x community x category |
| `data_contract_status` | data domain |

## Data issues the pipeline handles

- **One department, four codes.** 311 files Calgary Transit under `TRAN`, `OS`, `OSC` and `Tranc` as the org changed. `reference.agency_map` collapses them.
- **67 service names, 12 categories.** Retired (`Z CT -`) and renamed request types are mapped in `reference.service_category_map`. An unmapped name fails the build.
- **Two measures called ridership.** `trips` counts a journey once; `boardings` counts every vehicle boarded. They are separate, documented columns.
- **Totals that don't add up.** Published fare products never sum to published ridership. The gap is carried as explicit unallocated rows, so the breakdown always reconciles (tested), and months where the breakdown exceeds the total raise a warning.
- **Placeholder rows.** 258 of 480 ridership rows have a date and no values. They are excluded, and freshness is measured on real data only.
- **Uneven freshness.** 311 is current to yesterday; ridership lags by more than a year. `data_contract_status` compares each domain to its target.

## Run it

```bash
./scripts/setup.sh          # creates .venv (Airflow + Cosmos) and .venv-dbt (dbt-duckdb)
./scripts/run_pipeline.sh   # runs the Airflow DAG once: extract, freshness, dbt build, publish
```

`FULL_REFRESH=1` reloads 311 from scratch. GitHub Actions runs the same DAG daily (`.github/workflows/pipeline.yml`), commits refreshed gold data (which redeploys the website), and publishes the dbt docs to GitHub Pages.

## Explore locally

| What | Command | Opens |
|---|---|---|
| Airflow UI: DAG graph, runs, task logs | `./scripts/airflow_ui.sh` | http://localhost:8080 |
| DuckDB UI: query every layer (read-only) | `.venv/bin/python scripts/explore_data.py` | http://localhost:4213 |
| dbt docs: models, tests, lineage | `cd dbt && ../.venv-dbt/bin/dbt docs serve` | http://localhost:8080 |

Stop the DuckDB UI before running the pipeline: DuckDB allows one writer, and the UI holds the file open. dbt docs and Airflow both default to port 8080, so run one at a time (or pass `--port 8081` to `dbt docs serve`).
