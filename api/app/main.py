from fastapi import FastAPI
from app.routers import datasets, run
from app.s3 import S3_BUCKET, ensure_bucket_exists
from fastapi.middleware.cors import CORSMiddleware

print("MAIN.PY STARTING", flush=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("INCLUDING ROUTER", flush=True)
app.include_router(datasets.router)
app.include_router(run.router)
