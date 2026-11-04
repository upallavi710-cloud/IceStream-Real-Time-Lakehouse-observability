
from datetime import datetime, timezone


# Store pipeline incidents
_incidents = []


def log_incident(incident_type, severity, description):
    """Record a new pipeline incident."""

    incident = {
        "incident_id": len(_incidents) + 1,
        "incident_type": incident_type,
        "severity": severity.lower(),
        "description": description,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "status": "OPEN"
    }

    _incidents.append(incident)

    return incident


def get_all_incidents():
    """Return all recorded incidents."""

    return _incidents.copy()


def get_incidents_by_severity(severity):
    """Return incidents matching the requested severity."""

    return [
        incident
        for incident in _incidents
        if incident["severity"] == severity.lower()
    ]


def resolve_incident(incident_id):
    """Mark an incident as resolved."""

    for incident in _incidents:
        if incident["incident_id"] == incident_id:
            incident["status"] = "RESOLVED"
            return incident

    return None
