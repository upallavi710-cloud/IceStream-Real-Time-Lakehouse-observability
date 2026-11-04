
from datetime import datetime, timezone
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from member.monitoring.rules import validate_transactions
from member.monitoring.metrics import calculate_quality_metrics
from member.monitoring.anomaly import detect_amount_anomalies
from member.monitoring.incidents import (
    log_incident,
    get_all_incidents,
    resolve_incident
)


app = FastAPI(
    title="IceStream Monitoring API",
    description="Real-time lakehouse data quality and pipeline monitoring",
    version="1.0.0"
)


# Incident request model
class IncidentRequest(BaseModel):
    incident_type: str
    severity: str
    description: str


# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Welcome to IceStream Monitoring API",
        "status": "running"
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# Pipeline monitoring status
@app.get("/monitoring/status")
def monitoring_status():
    return {
        "project": "IceStream",
        "monitoring": "active",
        "status": "running",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# Data quality validation endpoint
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
            "status": "success",
            "report": report,
            "valid_records": valid_records,
            "invalid_records": invalid_records
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Data quality metrics endpoint
@app.post("/monitoring/metrics")
def quality_metrics(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)

        metrics = calculate_quality_metrics(df)

        return {
            "status": "success",
            "metrics": metrics
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Anomaly detection endpoint
@app.post("/monitoring/anomalies")
def anomaly_detection(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)

        anomaly_report = detect_amount_anomalies(df)

        return {
            "status": "success",
            "anomaly_report": anomaly_report
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Create a new incident
@app.post("/monitoring/incidents")
def create_incident(request: IncidentRequest):
    try:
        incident = log_incident(
            request.incident_type,
            request.severity,
            request.description
        )

        return {
            "status": "success",
            "incident": incident
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Retrieve all incidents
@app.get("/monitoring/incidents")
def list_incidents():
    incidents = get_all_incidents()

    return {
        "status": "success",
        "total_incidents": len(incidents),
        "incidents": incidents
    }


# Resolve an incident
@app.patch("/monitoring/incidents/{incident_id}/resolve")
def resolve_incident_api(incident_id: int):
    incident = resolve_incident(incident_id)

    if incident is None:
        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    return {
        "status": "success",
        "message": "Incident resolved successfully",
        "incident": incident
    }
