
import pandas as pd


def calculate_quality_metrics(df):
    total_records = len(df)

    if total_records == 0:
        return {
            "total_records": 0,
            "valid_records": 0,
            "invalid_records": 0,
            "quality_percentage": 0.0
        }

    required_columns = [
        "transaction_id",
        "customer_id",
        "product",
        "amount",
        "timestamp"
    ]

    missing_columns = [
        col for col in required_columns if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(
            f"Missing required columns: {missing_columns}"
        )

    null_mask = df[required_columns].isnull().any(axis=1)
    duplicate_mask = df["transaction_id"].duplicated(keep="first")

    amount = pd.to_numeric(df["amount"], errors="coerce")
    invalid_amount_mask = amount.isna() | (amount <= 0)

    invalid_mask = (
        null_mask | duplicate_mask | invalid_amount_mask
    )

    invalid_records = int(invalid_mask.sum())
    valid_records = total_records - invalid_records

    quality_percentage = round(
        (valid_records / total_records) * 100, 2
    )

    return {
        "total_records": total_records,
        "valid_records": valid_records,
        "invalid_records": invalid_records,
        "quality_percentage": quality_percentage
    }
