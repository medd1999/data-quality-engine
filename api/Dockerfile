FROM python:3.10

WORKDIR /app

COPY api/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY api api

COPY spark_engine spark_engine


EXPOSE 8000

RUN ls -R /app