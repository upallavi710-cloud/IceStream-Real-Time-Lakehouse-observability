
from member.monitoring.incidents import (
    log_incident,
    get_all_incidents,
    get_incidents_by_severity,
    resolve_incident
)


# Test 1: Log a pipeline error
incident1 = log_incident(
    "PIPELINE_ERROR",
    "HIGH",
    "Kafka data ingestion failed"
)

# Test 2: Log a data quality issue
incident2 = log_incident(
    "DATA_QUALITY",
    "MEDIUM",
    "Null values detected in transaction data"
)

# Test 3: Display all incidents
print("\nICESTREAM INCIDENT REPORT")
print("-------------------------")

for incident in get_all_incidents():
    print(incident)

# Test 4: Filter HIGH severity incidents
print("\nHIGH SEVERITY INCIDENTS")
print("-----------------------")

for incident in get_incidents_by_severity("HIGH"):
    print(incident)

# Test 5: Resolve the first incident
print("\nRESOLVING INCIDENT")
print("------------------")

resolved = resolve_incident(incident1["incident_id"])
print(resolved)

# Test 6: Verify incident status
assert resolved["status"] == "RESOLVED"
assert incident2["status"] == "OPEN"

print("\nAll incident logging tests passed!")
