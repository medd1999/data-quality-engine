FROM python:3.10-slim

# Put shared in a safe global location
WORKDIR /app

RUN pip install fastapi uvicorn[standard] pydantic httpx

# Copy shared package OUTSIDE the mounted directory
COPY shared ./shared

# Copy alerting_service code into its own directory
COPY alerting_service ./alerting_service

# EXPOSE the port that FastAPI will run on
EXPOSE 8002

# Run the FastAPI app using uvicorn
CMD ["uvicorn", "alerting_service.main:app", "--host", "0.0.0.0", "--port", "8002"]
