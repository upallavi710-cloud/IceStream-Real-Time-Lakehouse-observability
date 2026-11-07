
import pandas as pd


REQUIRED_COLUMNS = [
    "event_id",
    "event_time",
    "ingestion_time",
    "source_system",
    "pipeline_node",
    "event_type",
    "entity_id",
    "metric_name",
    "metric_value",
    "status",
    "region",
    "schema_version",
    "ingestion_delay_ms",
    "payload_size_bytes"
]


def validate_events(df):
    """
    Validate IceStream event records.

    Returns:
        valid_events: DataFrame containing valid records.
        invalid_events: DataFrame containing invalid records.
        report: Summary of validation results.
    """

    if df.empty:
        return df.copy(), df.copy(), {
            "total_records": 0,
            "valid_records": 0,
            "invalid_records": 0,
            "errors": ["Dataset is empty"]
        }

    missing_columns = [
        column for column in REQUIRED_COLUMNS
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    data = df.copy()
    invalid_mask = pd.Series(False, index=data.index)
    errors = []

    # 1. Check missing required values
    required_data = data[REQUIRED_COLUMNS]

    missing_mask = required_data.isnull().any(axis=1)

    if missing_mask.any():
        invalid_mask |= missing_mask
        errors.append(
            f"Missing required values: {int(missing_mask.sum())} records"
        )

    # 2. Check duplicate event IDs
    duplicate_mask = (
        data["event_id"].notna()
        & data["event_id"].duplicated(keep="first")
    )

    if duplicate_mask.any():
        invalid_mask |= duplicate_mask
        errors.append(
            f"Duplicate event IDs: {int(duplicate_mask.sum())} records"
        )

    # 3. Check invalid event types
    # Use non-anomalous sample records as the reference
    if "is_injected_anomaly" in data.columns:
        normal_records = data[
            data["is_injected_anomaly"].eq(False)
        ]
    else:
        normal_records = data

    valid_event_types = set(
        normal_records["event_type"].dropna().unique()
    )

    invalid_type_mask = (
        data["event_type"].notna()
        & ~data["event_type"].isin(valid_event_types)
    )

    if invalid_type_mask.any():
        invalid_mask |= invalid_type_mask
        errors.append(
            f"Invalid event types: {int(invalid_type_mask.sum())} records"
        )

    # 4. Check negative metric values
    metric_values = pd.to_numeric(
        data["metric_value"],
        errors="coerce"
    )

    negative_metric_mask = metric_values < 0

    if negative_metric_mask.any():
        invalid_mask |= negative_metric_mask
        errors.append(
            f"Negative metric values: {int(negative_metric_mask.sum())} records"
        )

    # 5. Check excessive ingestion delay
    delays = pd.to_numeric(
        data["ingestion_delay_ms"],
        errors="coerce"
    )

    delay_mask = delays > 5000

    if delay_mask.any():
        invalid_mask |= delay_mask
        errors.append(
            f"Excessive ingestion delays: {int(delay_mask.sum())} records"
        )
        # 6. Check event time occurring after ingestion time
    event_times = pd.to_datetime(
        data["event_time"],
        errors="coerce",
        utc=True
    )

    ingestion_times = pd.to_datetime(
        data["ingestion_time"],
        errors="coerce",
        utc=True
    )

    future_event_mask = (
        event_times.notna()
        & ingestion_times.notna()
        & (event_times > ingestion_times)
    )

    if future_event_mask.any():
        invalid_mask |= future_event_mask
        errors.append(
            f"Future event timestamps: {int(future_event_mask.sum())} records"
        )
    # 6. Separate valid and invalid records
    valid_events = data.loc[~invalid_mask].copy()
    invalid_events = data.loc[invalid_mask].copy()

    # 7. Generate validation report
    report = {
        "total_records": len(data),
        "valid_records": len(valid_events),
        "invalid_records": len(invalid_events),
        "errors": errors
    }

    return valid_events, invalid_events, report
