# SentinelDQ 
### Intelligent Data Quality & Anomaly Detection Platform

SentinelDQ is a cloud‑ready data quality and anomaly‑detection platform built with a modern software + data engineering stack. **It ingests datasets, validates schema and data integrity, detects anomalies using PySpark, and surfaces insights through a secure API layer and interactive React dashboard.** Designed with microservices, Dockerized workloads, and CI/CD automation, SentinelDQ mirrors the reliability and observability standards of enterprise data platforms.

The system combines *Python, PySpark, SQL, React, Docker, and Azure/AWS‑ready deployment patterns* to deliver a full end‑to‑end workflow: ingestion → validation → anomaly detection → lineage tracking → alerting → visualization.

SentinelDQ is built for engineers who need transparent, automated, and scalable data quality monitoring without the overhead of legacy ETL systems.

### What SentinelDQ Delivers
- Automated data ingestion with schema validation

- PySpark‑powered anomaly detection and data quality scoring

- Full lineage tracking for auditability and compliance

- REST APIs for metrics, alerts, and pipeline status

- React dashboard for real‑time visibility

- Dockerized microservices with CI/CD pipelines

- Secure secrets handling and cloud‑native deployment patterns


### Tech Stack (Components)
- **Frontend:** React + CSS (React dashboard)

- **API Gateway** Python FastAPI

- **Data Quality Engine:** PySpark service

- **Metadata & Results Storage:** SQL (Postgres)

- **Alerting & Automation Service:** Python microservice

- **Scheduler & Jobs:** Linux + cron

- **Infrastructure & Delivery:** Docker + CI/CD (GitHub Actions), deployable to AWS


## System Architecture

### 1. Frontend - React (TypeScript) + CSS (Dashboard)

**Responsibilities:**

- Dataset upload (CSV/JSON)

- Dataset list + run history

- Data quality metrics visualization

- Anomaly charts (trend lines, severity indicators)

- Alerts feed + acknowledgment

- API key–based authentication (simple for now)

**Key Pages:**

- Upload page

- Dataset overview

- Run history

- Metrics & anomalies

- Alerts center

---------------------------------------
### 2. API Gateway — Python FastAPI

[API Gateway Diagram](https://lucid.app/lucidchart/77096829-b1e6-4b24-9c6f-ed155423ac27/edit?view_items=CRq3nRQO7aeB%2CbPq3e06zPNj6%2CeVq3zUHz3q7b%2CgJr3mIY5u1iH%2C27r3DwSVTraX%2C_Nr3zNmo7j8z%2Ce9r3OSScXe49%2CJ4r3ApwEwFVV%2C4Fq3XjRMtvke%2C_Nq3h4xwQRvH%2CAHr3p-Grj0TO%2CALr3rg2ev9J_%2CpNr3gulf67gm%2Cyqs3K_YA1kXl%2CRTr39R~YGWFD%2Czbs37P2GNdj1%2C3Ur3V-bFCgYV%2CA8r38lf0mqAa%2CqVr3KRODVFHG%2Ck-r3xXWJ1229%2Ckcs3PWykUwnG%2C4Er3ApB8j7dx%2C65r3xIfj0Ni6%2CoQq32yr8U7.h%2CUVq3S_COB-ET&page=0_0&invitationId=inv_3e150b2a-1b13-464e-9325-689599a54fb2)

**Responsibilities:**

- Central entry point for all clients

- Dataset registration + file upload

- Trigger PySpark jobs

- Serve metrics, lineage, alerts, and run history

- Validate request payloads (Pydantic)

- Handle auth (API key or JWT)

- Write metadata to Postgres

**Core Endpoints:**

- ```POST /datasets``` — upload dataset

- ```GET /datasets``` — list datasets

- ```POST /runs/{dataset_id}``` — trigger validation run

- ```GET /runs``` — run history

- ```GET /metrics/{run_id}``` — quality metrics

- ```GET /alerts``` — active alerts

---------------------------------------
### 3. Data Quality Engine - PySpark Service

[Data Quality Engine Diagram](https://lucid.app/lucidchart/11f2dbd4-1e80-484c-ad30-002059147205/edit?page=0_0&invitationId=inv_2bac48e1-9e69-4c16-8ea3-bb0c9af7d824#)

**Responsibilities:**

- Load dataset from storage (local volume or S3)

- Perform schema validation

- Compute data quality metrics:

    - Null %, duplicate %, type mismatches

    - Range checks

    - Distribution drift

- Perform anomaly detection:

    - Z‑score

    - IQR

    - Time‑series deviation (optional)

- Write results to Postgres:

    - ```quality_results```

    - ```anomaly_events```

    - ```runs``` (status updates)

**Execution Model:**

- Triggered via FastAPI call

- Runs inside its own Docker container

- Configurable via YAML or env vars

---------------------------------------
### 4. Metadata & Results Storage - Postgres

[Metadata & Results Storage (Postgres) Diagram](https://lucid.app/lucidchart/68a2cb2f-ac06-4928-9164-974250bc5ff9/edit?view_items=2q_2PRGPiH4P&page=0_0&invitationId=inv_67ab474d-4512-4b9e-a4fa-6c860caa70c3)

**Tables:**

- `datasets` — dataset metadata

- `runs` — each validation execution

- `quality_results` — column‑level metrics

- `anomaly_events` — anomalies detected

- `alerts` — alert records

**Why Postgres:**

- Strong relational integrity

- Easy to containerize

- Ideal for metrics + lineage

---------------------------------------
### 5. Alerting & Automation Service - Python Microservice

[Alerting & Automation Service Diagram](https://lucid.app/lucidchart/db9ee336-6189-4dd4-a4de-0a07122f9559/edit?viewport_loc=-2414%2C-386%2C6481%2C3512%2C0_0&invitationId=inv_596e0f8b-56a3-4d09-93a5-060fd57042e6)

**Responsibilities:**

- Poll Postgres for new anomalies or failed runs

- Apply alert rules (thresholds, severity mapping)

- Insert alerts into `alerts` table

- Send notifications (email/Slack)

- Expose alert feed via FastAPI or internal API

**Alert Types:**

- Schema drift

- High null %

- High duplicate %

- Outlier spikes

- Failed PySpark runs

-------------------------------------
### 6. Scheduler & Jobs - Linux + cron

[Scheduler & Jobs Diagram](https://lucid.app/lucidchart/f310a6f1-0ea7-40e2-b733-af4e21107d0f/edit?viewport_loc=-2116%2C-533%2C4609%2C3436%2C0_0&invitationId=inv_e5b390ca-9e4a-4380-a2dd-c635cf30871b)

**Responsibilities:**

- Periodic dataset re‑validation

- Nightly or hourly runs

- Calls FastAPI endpoint:

    - `POST /runs/{dataset_id}`

- Optional: rotate logs, archive old runs

---------------------------------------
### 7. Infrastructure & Delivery - Docker + GitHub Actions (AWS Deploy)

[AWS Deployment Diagram](https://lucid.app/lucidchart/4feee881-864c-4ab0-b40a-28e9c33eab13/edit?viewport_loc=-9716%2C-3404%2C9429%2C5042%2C0_0&invitationId=inv_559571aa-6cae-4b34-bc1c-f9e0cf0b8bb2)

**Dockerized Services:**

- `frontend` (React)

- `api` (FastAPI)

- `spark_engine` (PySpark)

- `alerting_service` (Python)

- `db` (Postgres)

**CI/CD Pipeline (GitHub Actions):**

- Lint + test

- Build Docker images

- Push to ECR (AWS)

- Deploy to ECS or EC2

- Run migrations

- Smoke tests

**AWS Deployment Options:**

- **ECS Fargate** (recommended)

- **EC2 + Docker Compose** (simple)

- **S3** for dataset storage

- **Secrets Manager** for credentials
-------------------------------------------------

# Run Commands


- `docker compose build service_name` - build service container
- `docker compose up service_name` - activate service container
- `docker compose logs api` - show api (backend) logs
- `docker exec -it <container-name> sh` - bash into docker container
- `npm run dev` - run application (from frontend)
- `curl -X POST http://localhost:8000/datasets \`
  `-F "dataset_name=test_upload" \`
  `-F "file=@/absolute/path/to/your/dataset.csv"` - test endpoint hit for dataset upload
- `docker exec -it sentineldq_db psql -U postgres -d sentineldq` - run SQL inside Postgres container
- `source .venv/bin/activate` - activate venv



# Checklist

- Backend/FastAPI √
- Docker/Compose √
- Postgres √
- MinIO √
- E2E Pipeline √
- Quality Check Trigger √

