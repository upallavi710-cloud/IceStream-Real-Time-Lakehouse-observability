
def calculate_event_metrics(total_records, valid_records, invalid_records):
    """Calculate quality metrics for IceStream event data."""

    if total_records == 0:
        return {
            "total_events": 0,
            "valid_events": 0,
            "invalid_events": 0,
            "quality_percentage": 0.0
        }

    quality_percentage = (
        valid_records / total_records
    ) * 100

    return {
        "total_events": total_records,
        "valid_events": valid_records,
        "invalid_events": invalid_records,
        "quality_percentage": round(quality_percentage, 2)
    }
