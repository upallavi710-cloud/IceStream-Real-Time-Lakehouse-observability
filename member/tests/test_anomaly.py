
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import pandas as pd
from member.monitoring.anomaly import detect_amount_anomalies


transactions = [
    {"transaction_id": 101, "amount": 1000},
    {"transaction_id": 102, "amount": 1100},
    {"transaction_id": 103, "amount": 950},
    {"transaction_id": 104, "amount": 1050},
    {"transaction_id": 105, "amount": 10000}
]

df = pd.DataFrame(transactions)

result = detect_amount_anomalies(df)

print("\nICESTREAM ANOMALY DETECTION REPORT")
print("----------------------------------")
print("Total records:", result["total_records"])
print("Anomalies detected:", result["anomaly_count"])
print("\nAnomaly details:")

for anomaly in result["anomalies"]:
    print(anomaly)
