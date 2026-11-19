
from pathlib import Path

import pandas as pd
import pyarrow as pa

from pyiceberg.catalog import load_catalog
from pyiceberg.exceptions import NoSuchTableError

PROJECT_ROOT = Path(__file__).resolve().parents[2]

CSV_PATH = PROJECT_ROOT / "data" / "icestream_events_with_anomalies.csv"
WAREHOUSE_PATH = PROJECT_ROOT / "iceberg_warehouse"
CATALOG_DB = PROJECT_ROOT / "iceberg_catalog.db"

NAMESPACE = "icestream"
TABLE_NAME = "events"
TABLE_IDENTIFIER = f"{NAMESPACE}.{TABLE_NAME}"


def get_catalog():
    warehouse_uri = f"file://{WAREHOUSE_PATH.as_posix()}"

    return load_catalog(
        "local",
        **{
            "type": "sql",
            "uri": f"sqlite:///{CATALOG_DB.as_posix()}",
            "warehouse": warehouse_uri,
        },
    )


def load_events():
    if not CSV_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {CSV_PATH}")

    print("Reading dataset...")
    df = pd.read_csv(CSV_PATH)

    print(f"CSV records: {len(df)}")
    print(f"CSV columns: {len(df.columns)}")

    arrow_table = pa.Table.from_pandas(df, preserve_index=False)

    catalog = get_catalog()

    try:
        table = catalog.load_table(TABLE_IDENTIFIER)
        print("Existing Iceberg table found.")

    except NoSuchTableError:
        table = catalog.create_table(
            identifier=TABLE_IDENTIFIER,
            schema=arrow_table.schema,
        )
        print("Created Iceberg table:", TABLE_IDENTIFIER)

    existing_records = table.scan().to_arrow().num_rows

    if existing_records > 0:
        print("Table already contains records.")
        print("Skipping duplicate load.")
    else:
        table.append(arrow_table)
        print("Dataset successfully loaded into Iceberg.")

    total_records = table.scan().to_arrow().num_rows

    print("\n--- Iceberg Table Details ---")
    print("Table:", TABLE_IDENTIFIER)
    print("Total records:", total_records)
    print("Snapshot count:", len(table.metadata.snapshots))


if __name__ == "__main__":
    load_events()
