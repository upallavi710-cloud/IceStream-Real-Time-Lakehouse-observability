
from member.monitoring.incidents import (
    log_incident,
    get_all_incidents
)


def create_event_incidents(anomaly_report):
    """Create incidents automatically for detected event anomalies."""

    created_incidents = []

    anomaly_breakdown = anomaly_report.get(
        "anomaly_breakdown", {}
    )

    for anomaly_type, count in anomaly_breakdown.items():

        if count <= 0:
            continue

        incident_type = f"EVENT_{anomaly_type}"

        # Prevent duplicate OPEN incidents
        existing_incident = any(
            incident["incident_type"] == incident_type
            and incident["status"] == "OPEN"
            for incident in get_all_incidents()
        )

        if existing_incident:
            continue

        severity = "high" if count >= 50 else "medium"

        incident = log_incident(
            incident_type=incident_type,
            severity=severity,
            description=(
                f"Event monitoring detected {count} "
                f"records with anomaly type {anomaly_type}."
            )
        )

        created_incidents.append(incident)

    return created_incidents
