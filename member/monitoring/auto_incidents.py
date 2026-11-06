
from member.monitoring.incidents import (
    log_incident,
    get_all_incidents
)


def has_open_incident(incident_type):
    """Check whether an OPEN incident of this type already exists."""

    incidents = get_all_incidents()

    for incident in incidents:
        if (
            incident["incident_type"] == incident_type
            and incident["status"] == "OPEN"
        ):
            return True

    return False


def create_quality_incidents(quality_report):
    """Automatically create an incident when data quality fails."""

    incidents = []

    invalid_count = quality_report.get("invalid_records", 0)
    total_count = quality_report.get("total_records", 0)

    if invalid_count > 0:

        if has_open_incident("DATA_QUALITY_FAILURE"):
            return incidents

        severity = "high" if invalid_count >= 2 else "medium"

        incident = log_incident(
            incident_type="DATA_QUALITY_FAILURE",
            severity=severity,
            description=(
                f"Data quality validation detected {invalid_count} "
                f"invalid records out of {total_count} transactions."
            )
        )

        incidents.append(incident)

    return incidents


def create_anomaly_incidents(anomaly_report):
    """Automatically create an incident when anomalies are detected."""

    incidents = []

    anomaly_count = anomaly_report.get("anomaly_count", 0)
    total_records = anomaly_report.get("total_records", 0)

    if anomaly_count > 0:

        if has_open_incident("ANOMALY_DETECTED"):
            return incidents

        severity = "high" if anomaly_count >= 2 else "medium"

        incident = log_incident(
            incident_type="ANOMALY_DETECTED",
            severity=severity,
            description=(
                f"Anomaly detection found {anomaly_count} unusual "
                f"transactions out of {total_records} records."
            )
        )

        incidents.append(incident)

    return incidents


def create_automatic_incidents(quality_report, anomaly_report):
    """Create incidents without duplicating existing OPEN incidents."""

    created_incidents = []

    created_incidents.extend(
        create_quality_incidents(quality_report)
    )

    created_incidents.extend(
        create_anomaly_incidents(anomaly_report)
    )

    return created_incidents
