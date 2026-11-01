import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pandas as pd
from member.monitoring.rules import validate_transactions

data = {
    "transaction_id": [101, 102, 103],
    "customer_id": ["C01", None, "C03"],
    "product": ["Laptop", "Mobile", "Tablet"],
    "amount": [50000, -200, 15000],
    "timestamp": ["2026-11-01", "2026-11-01", "2026-11-01"]
}

df = pd.DataFrame(data)

valid, invalid, report = validate_transactions(df)

print("\nDATA QUALITY REPORT")
print("-------------------")
print("Total records:", report["total_records"])
print("Valid records:", report["valid_records"])
print("Invalid records:", report["invalid_records"])
print("\nErrors:")

for error in report["errors"]:
    print("-", error)