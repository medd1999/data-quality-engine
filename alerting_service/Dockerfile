FROM python:3.10-slim

# Put shared in a safe global location
WORKDIR /app

RUN pip install fastapi uvicorn[standard] pydantic

# Copy shared package OUTSIDE the mounted directory
COPY shared /app/shared

# Copy alerting_service code into its own directory
COPY alerting_service /alerting_service

# Add /app/shared to PYTHONPATH
ENV PYTHONPATH="/app:${PYTHONPATH}"

# Run your service
CMD ["python", "/alerting_service/main.py"]
