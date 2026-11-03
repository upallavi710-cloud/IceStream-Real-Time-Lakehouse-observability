
from datetime import datetime, timezone
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException

from member.monitoring.rules import validate_transactions
from member.monitoring.metrics import calculate_quality_metrics
from member.monitoring.anomaly import detect_amount_anomalies

app = FastAPI(
    title="IceStream Monitoring API",
    description="Real-time lakehouse data quality and pipeline monitoring",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "project": "IceStream",
        "message": "Monitoring API is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "IceStream Monitoring API",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/monitoring/status")
def monitoring_status():
    return {
        "pipeline": "IceStream",
        "monitoring": "active",
        "data_quality": "ready"
    }


@app.post("/monitoring/data-quality")
def data_quality_check(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)

        valid, invalid, report = validate_transactions(df)

        valid_records = (
            valid.astype(object)
            .where(pd.notna(valid), None)
            .to_dict(orient="records")
        )

        invalid_records = (
            invalid.astype(object)
            .where(pd.notna(invalid), None)
            .to_dict(orient="records")
        )

        return {
            "status": "completed",
            "report": report,
            "valid_records": valid_records,
            "invalid_records": invalid_records
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.post("/monitoring/metrics")
def data_quality_metrics(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)
        metrics = calculate_quality_metrics(df)

        return {
            "status": "success",
            "metrics": metrics
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))


@app.post("/monitoring/anomalies")
def transaction_anomalies(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)
        result = detect_amount_anomalies(df)

        return {
            "status": "success",
            "anomaly_report": result
        }

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
