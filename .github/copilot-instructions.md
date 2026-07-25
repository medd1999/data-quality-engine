% SentinelDQ — Copilot instructions

Purpose
- Help AI coding agents become productive quickly in this repository by outlining the architecture, critical workflows, key files/URLs, and project-specific conventions (drawn from `readme.md`).

Big picture (from readme.md)
- SentinelDQ is a containerized, microservice data-quality platform: ingestion → validation → anomaly detection → lineage → alerts → dashboard.
- Primary services described in the repo documentation: `frontend` (React), `api` (FastAPI), `spark-engine` (PySpark), `alerting-service` (Python), and `db` (Postgres).

Where to look first
- `readme.md` (root) — high level architecture, endpoints and table names.
- Expected service directories (check for these paths in the workspace): `frontend/`, `api/`, `spark-engine/`, `alerting-service/`, and sql/migrations or `db/` for Postgres schema.

Key endpoints and data artifacts (copied from readme for quick reference)
- API endpoints: POST /datasets, GET /datasets, POST /runs/{dataset_id}, GET /runs, GET /metrics/{run_id}, GET /alerts
- Main DB tables: `datasets`, `runs`, `quality_results`, `anomaly_events`, `alerts`

Developer workflows and assumptions (verify paths before running)
- Local dev (assumption: docker-compose or equivalent exists):
  - Bring up services: `docker compose up --build` (or `docker-compose up --build` depending on repo)
  - API dev: expect a FastAPI app under `api/` — common dev command: `uvicorn api.main:app --reload` (adjust import path to the real module)
  - Frontend dev: expect `frontend/` with Node; common commands: `cd frontend && npm install && npm start` or `pnpm`/`yarn` depending on lockfile
  - PySpark engine: runs inside `spark-engine/` container; triggered by API `POST /runs/{dataset_id}`
  - Tests: look for `pytest` config or `tests/` folders; run `pytest` at repo root if present

Important integration points
- Storage: datasets may be local volumes or S3 (README mentions both). Look for code that loads from a path or S3 key.
- Secrets: expected to be provided by env vars or YAML; production deploys use AWS Secrets Manager (README note).
- Scheduler: periodic runs use cron that calls `POST /runs/{dataset_id}`; check for `cron` or `scripts/`.
- Alerting: alerting-service polls Postgres and sends notifications (email/Slack). Look for webhooks or SMTP/Slack clients.

Project-specific patterns to follow
- API request validation: Pydantic models (FastAPI) — mirror existing model organization when adding new endpoints
- Side effects: PySpark runs should be triggered asynchronously (background tasks or job queue) and update `runs` status in Postgres
- Results writing: column-level metrics go into `quality_results`; anomalies into `anomaly_events` — follow table field naming and types when producing results
- Config: prefer env vars for sensitive values; check for YAML config files mentioned in README

Concrete examples (copy from README to reduce search friction)
- Trigger run: POST /runs/{dataset_id} (used by cron and UI)
- Metric lookup: GET /metrics/{run_id} (frontend charts query this)

Editing guidance for AI agents
- When changing API shapes: update the Pydantic models, the OpenAPI surface (FastAPI), and add/modify tests under `api/tests` (or equivalent). Ensure DB migrations are created/updated.
- When changing the DB schema: update SQL migration files (look for `migrations/`, `alembic/`, or `sql/`) and the data-access layer that writes/reads `quality_results`/`anomaly_events`.
- When adding new env-driven config keys: document them in README and add to the Dockerfile/docker-compose environment sections.

Safety & housekeeping
- Never commit secrets or plaintext credentials. Use env vars and (for production) Secrets Manager as noted in README.
- If you can't find a directory named in README, ask the maintainer for the actual path before modifying files that depend on it.

If something is missing or ambiguous
- I assumed standard filenames and workflows (Docker Compose, FastAPI uvicorn command, Node-based frontend). If those assumptions are wrong, please provide the paths or preferred commands and I will update these instructions.

Next step for humans
- Tell me where the API, frontend, and spark-engine directories live (if they differ from the names above) or grant access to the rest of the workspace so I can refine commands and examples.

End of instructions
