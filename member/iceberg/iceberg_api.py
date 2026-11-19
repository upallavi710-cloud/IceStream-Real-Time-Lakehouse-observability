
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query
from pyiceberg.exceptions import NoSuchTableError

from member.iceberg.catalog_setup import get_catalog

router = APIRouter(
    prefix="/monitoring/iceberg",
    tags=["Apache Iceberg Time Travel"],
)

TABLE_IDENTIFIER = "icestream.events"


def get_iceberg_table():
    catalog = get_catalog()

    try:
        return catalog.load_table(TABLE_IDENTIFIER)
    except NoSuchTableError:
        raise HTTPException(
            status_code=404,
            detail="Iceberg events table not found.",
        )


@router.get("/status")
def iceberg_status():
    """Return the actual Iceberg table status."""

    table = get_iceberg_table()
    snapshots = table.metadata.snapshots

    total_records = table.scan().to_arrow().num_rows

    return {
        "status": "connected",
        "catalog": "local",
        "table": TABLE_IDENTIFIER,
        "total_records": total_records,
        "snapshot_count": len(snapshots),
    }


@router.get("/snapshots")
def iceberg_snapshots():
    """List actual Iceberg table snapshots."""

    table = get_iceberg_table()
    snapshots = table.metadata.snapshots

    results = []

    for snapshot in snapshots:
        timestamp = datetime.fromtimestamp(
            snapshot.timestamp_ms / 1000,
            tz=timezone.utc,
        )

        results.append({
            "snapshot_id": str(snapshot.snapshot_id),
            "timestamp_ms": snapshot.timestamp_ms,
            "timestamp": timestamp.isoformat(),
            "operation": snapshot.summary.get("operation", "unknown"),
            "summary": dict(snapshot.summary),
        })

    results.sort(
        key=lambda item: item["timestamp_ms"],
        reverse=True,
    )

    return {
        "table": TABLE_IDENTIFIER,
        "snapshot_count": len(results),
        "snapshots": results,
    }


@router.get("/records")
def iceberg_records(
    snapshot_id: int = Query(..., description="Iceberg snapshot ID"),
    limit: int = Query(25, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    """Read records from a selected historical snapshot."""

    table = get_iceberg_table()

    available_ids = {
        snapshot.snapshot_id
        for snapshot in table.metadata.snapshots
    }

    if snapshot_id not in available_ids:
        raise HTTPException(
            status_code=404,
            detail="Snapshot ID not found.",
        )

    try:
        arrow_table = table.scan(
            snapshot_id=snapshot_id
        ).to_arrow()

        total_records = arrow_table.num_rows
        page = arrow_table.slice(offset, limit)

        return {
            "table": TABLE_IDENTIFIER,
            "snapshot_id": str(snapshot_id),
            "total_records": total_records,
            "limit": limit,
            "offset": offset,
            "columns": arrow_table.column_names,
            "records": page.to_pylist(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read snapshot records: {error}",
        )
