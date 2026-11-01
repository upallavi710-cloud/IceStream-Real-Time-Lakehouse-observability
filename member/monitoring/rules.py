
import pandas as pd

REQUIRED_COLUMNS = [
    "transaction_id",
    "customer_id",
    "product",
    "amount",
    "timestamp"
]


def validate_transactions(df):
    errors = []

    missing_columns = [
        col for col in REQUIRED_COLUMNS if col not in df.columns
    ]

    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    if df.empty:
        report = {
            "total_records": 0,
            "valid_records": 0,
            "invalid_records": 0,
            "errors": ["Dataset is empty"]
        }
        return df.copy(), df.copy(), report

    valid_mask = pd.Series(True, index=df.index)

    null_mask = df[REQUIRED_COLUMNS].isnull().any(axis=1)
    if null_mask.any():
        errors.append("Null values detected")
        valid_mask &= ~null_mask

    duplicate_mask = df["transaction_id"].duplicated(keep="first")
    if duplicate_mask.any():
        errors.append("Duplicate transaction IDs detected")
        valid_mask &= ~duplicate_mask

    amount = pd.to_numeric(df["amount"], errors="coerce")
    invalid_amount_mask = amount.isna() | (amount <= 0)

    if invalid_amount_mask.any():
        errors.append("Invalid transaction amounts detected")
        valid_mask &= ~invalid_amount_mask

    valid = df[valid_mask].copy()
    invalid = df[~valid_mask].copy()

    report = {
        "total_records": len(df),
        "valid_records": len(valid),
        "invalid_records": len(invalid),
        "errors": errors
    }

    return valid, invalid, report
