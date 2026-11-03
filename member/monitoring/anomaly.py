
import pandas as pd


def detect_amount_anomalies(df):
    if "amount" not in df.columns:
        raise ValueError("Dataset must contain an amount column")

    if df.empty:
        return {
            "total_records": 0,
            "anomaly_count": 0,
            "anomalies": []
        }

    amounts = pd.to_numeric(df["amount"], errors="coerce")
    valid_amounts = amounts.dropna()

    if len(valid_amounts) < 4:
        return {
            "total_records": len(df),
            "anomaly_count": 0,
            "anomalies": [],
            "message": "At least 4 valid amounts are required"
        }

    q1 = valid_amounts.quantile(0.25)
    q3 = valid_amounts.quantile(0.75)

    iqr = q3 - q1

    lower_limit = q1 - (1.5 * iqr)
    upper_limit = q3 + (1.5 * iqr)

    anomaly_mask = (
        (amounts < lower_limit) |
        (amounts > upper_limit)
    )

    anomalies = df[anomaly_mask.fillna(False)].copy()

    return {
        "total_records": len(df),
        "anomaly_count": len(anomalies),
        "lower_limit": round(float(lower_limit), 2),
        "upper_limit": round(float(upper_limit), 2),
        "anomalies": anomalies.astype(object)
            .where(pd.notna(anomalies), None)
            .to_dict(orient="records")
    }
