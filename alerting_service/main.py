from fastapi import FastAPI
from alerts.router import router as alerts_router

app = FastAPI()


app.include_router(alerts_router, prefix="/api/alerts")