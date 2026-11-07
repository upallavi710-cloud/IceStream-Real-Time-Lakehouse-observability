
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Existing transaction monitoring
from member.monitoring.rules import validate_transactions
from member.monitoring.metrics import calculate_quality_metrics
from member.monitoring.anomaly import detect_amount_anomalies
from member.monitoring.auto_incidents import create_automatic_incidents

# Existing incident management
from member.monitoring.incidents import (
    log_incident,
    get_all_incidents,
    resolve_incident
)

# New IceStream event monitoring
from member.monitoring.event_validation import validate_events
from member.monitoring.event_metrics import calculate_event_metrics
from member.monitoring.event_anomaly import detect_event_anomalies
from member.monitoring.event_incidents import create_event_incidents


app = FastAPI(
    title="IceStream Monitoring API",
    description="Real-time lakehouse data quality and pipeline monitoring",
    version="1.1.0"
)

# Locate the dataset relative to the project root
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATASET_PATH = (
    PROJECT_ROOT / "data" / "icestream_events_with_anomalies.csv"
)

# Store the most recent event analysis results
latest_event_analysis = None


class IncidentRequest(BaseModel):
    incident_type: str
    severity: str
    description: str


def load_event_dataset():
    """Load the IceStream event CSV file."""

    if not DATASET_PATH.is_file():
        raise HTTPException(
            status_code=404,
            detail=f"Dataset not found: {DATASET_PATH.name}"
        )

    try:
        return pd.read_csv(DATASET_PATH)
    except (OSError, pd.errors.ParserError) as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load event dataset: {error}"
        )


@app.get("/")
def home():
    return {
        "message": "Welcome to IceStream Monitoring API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/monitoring/status")
def monitoring_status():
    return {
        "project": "IceStream",
        "monitoring": "active",
        "status": "running",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ---------------------------------------------------
# Existing transaction monitoring endpoints
# ---------------------------------------------------

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

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/monitoring/metrics")
def quality_metrics(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)
        metrics = calculate_quality_metrics(df)

        return {
            "status": "success",
            "metrics": metrics
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/monitoring/anomalies")
def anomaly_detection(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)
        anomaly_report = detect_amount_anomalies(df)

        return {
            "status": "success",
            "anomaly_report": anomaly_report
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


@app.post("/monitoring/analyze")
def analyze_transactions(transactions: list[dict[str, Any]]):
    try:
        df = pd.DataFrame(transactions)

        valid, invalid, quality_report = validate_transactions(df)
        metrics = calculate_quality_metrics(df)
        anomaly_report = detect_amount_anomalies(df)

        quality_data = {
            "total_records": len(df),
            "invalid_records": len(invalid)
        }

        created_incidents = create_automatic_incidents(
            quality_data,
            anomaly_report
        )

        return {
            "status": "success",
            "message": "Transaction analysis completed",
            "data_quality_report": quality_report,
            "quality_metrics": metrics,
            "anomaly_report": anomaly_report,
            "automatic_incidents": created_incidents,
            "total_new_incidents": len(created_incidents)
        }

    except Exception as error:
        raise HTTPException(status_code=500, detail=str(error))


# ---------------------------------------------------
# New IceStream event monitoring endpoints
# ---------------------------------------------------

@app.post("/monitoring/events/analyze")
def analyze_event_dataset():
    """Analyze the IceStream dataset and create event incidents."""

    global latest_event_analysis

    df = load_event_dataset()

    try:
        valid, invalid, validation_report = validate_events(df)

        metrics = calculate_event_metrics(
            validation_report["total_records"],
            validation_report["valid_records"],
            validation_report["invalid_records"]
        )

        anomaly_report = detect_event_anomalies(df)

        created_incidents = create_event_incidents(anomaly_report)

        # Keep the API response reasonably small
        anomaly_summary = {
            key: value
            for key, value in anomaly_report.items()
            if key != "anomalies"
        }

        latest_event_analysis = {
            "status": "success",
            "dataset": DATASET_PATH.name,
            "validation_report": validation_report,
            "metrics": metrics,
            "anomaly_report": anomaly_summary,
            "automatic_incidents": created_incidents,
            "total_new_incidents": len(created_incidents)
        }

        return latest_event_analysis

    except ValueError as error:
        raise HTTPException(
            status_code=422,
            detail=str(error)
        )


@app.get("/monitoring/events/metrics")
def get_event_metrics():
    """Return metrics from the latest event analysis."""

    if latest_event_analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Run POST /monitoring/events/analyze first"
        )

    return {
        "status": "success",
        "metrics": latest_event_analysis["metrics"]
    }


@app.get("/monitoring/events/anomalies")
def get_event_anomalies():
    """Return anomaly summary from the latest analysis."""

    if latest_event_analysis is None:
        raise HTTPException(
            status_code=404,
            detail="Run POST /monitoring/events/analyze first"
        )

    return {
        "status": "success",
        "anomaly_report": latest_event_analysis["anomaly_report"]
    }


# ---------------------------------------------------
# Existing incident management endpoints
# ---------------------------------------------------

@app.post("/monitoring/incidents")
def create_incident(request: IncidentRequest):
    incident = log_incident(
        request.incident_type,
        request.severity,
        request.description
    )

    return {
        "status": "success",
        "incident": incident
    }


@app.get("/monitoring/incidents")
def list_incidents():
    incidents = get_all_incidents()

    return {
        "status": "success",
        "total_incidents": len(incidents),
        "incidents": incidents
    }


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
