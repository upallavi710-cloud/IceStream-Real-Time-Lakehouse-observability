
import pandas as pd


def detect_event_anomalies(df):
    """Detect and summarize injected anomalies in event data."""

    if df.empty:
        return {
            "total_events": 0,
            "anomaly_count": 0,
            "normal_count": 0,
            "anomaly_percentage": 0.0,
            "anomaly_breakdown": {},
            "anomalies": []
        }

    required_columns = [
        "is_injected_anomaly",
        "anomaly_type"
    ]

    missing_columns = [
        column for column in required_columns
        if column not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    # Identify injected anomalies
    anomaly_mask = (
        df["is_injected_anomaly"]
        .fillna(False)
        .astype(bool)
    )

    anomalies = df.loc[anomaly_mask].copy()

    # Count each anomaly type
    breakdown = (
        anomalies["anomaly_type"]
        .fillna("Unspecified")
        .value_counts()
        .to_dict()
    )

    total_events = len(df)
    anomaly_count = len(anomalies)
    normal_count = total_events - anomaly_count

    anomaly_percentage = (
        anomaly_count / total_events
    ) * 100

    # Convert missing values to JSON-compatible nulls
    anomaly_records = (
        anomalies.astype(object)
        .where(pd.notna(anomalies), None)
        .to_dict(orient="records")
    )

    return {
        "total_events": total_events,
        "anomaly_count": anomaly_count,
        "normal_count": normal_count,
        "anomaly_percentage": round(anomaly_percentage, 2),
        "anomaly_breakdown": breakdown,
        "anomalies": anomaly_records
    }
