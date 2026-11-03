
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pandas as pd
from member.monitoring.metrics import calculate_quality_metrics


transactions = [
    {
        "transaction_id": 101,
        "customer_id": "C01",
        "product": "Laptop",
        "amount": 50000,
        "timestamp": "2026-11-03"
    },
    {
        "transaction_id": 102,
        "customer_id": None,
        "product": "Mobile",
        "amount": -200,
        "timestamp": "2026-11-03"
    },
    {
        "transaction_id": 103,
        "customer_id": "C03",
        "product": "Tablet",
        "amount": 15000,
        "timestamp": "2026-11-03"
    }
]

df = pd.DataFrame(transactions)

metrics = calculate_quality_metrics(df)

print("\nICESTREAM DATA QUALITY METRICS")
print("--------------------------------")

for key, value in metrics.items():
    print(f"{key}: {value}")
