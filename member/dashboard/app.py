
import streamlit as st
import requests
import pandas as pd

API_URL = "http://127.0.0.1:8000"

st.set_page_config(
    page_title="IceStream Monitoring",
    page_icon="🌊",
    layout="wide"
)

st.title("🌊 IceStream Pipeline Monitoring Dashboard")
st.caption("Real-Time Lakehouse Observability")

st.sidebar.header("Dashboard Controls")

if st.sidebar.button("Refresh Dashboard"):
    st.rerun()


# =====================================================
# SAMPLE TRANSACTION DATA
# =====================================================

sample_data = pd.DataFrame([
    {
        "transaction_id": 101,
        "customer_id": 1,
        "product": "Laptop",
        "amount": 1000,
        "timestamp": "2026-11-05 10:00:00"
    },
    {
        "transaction_id": 102,
        "customer_id": 2,
        "product": "Phone",
        "amount": 1100,
        "timestamp": "2026-11-05 10:01:00"
    },
    {
        "transaction_id": 103,
        "customer_id": 3,
        "product": "Tablet",
        "amount": 950,
        "timestamp": "2026-11-05 10:02:00"
    },
    {
        "transaction_id": 104,
        "customer_id": 4,
        "product": "Watch",
        "amount": 1050,
        "timestamp": "2026-11-05 10:03:00"
    },
    {
        "transaction_id": 105,
        "customer_id": 5,
        "product": "Camera",
        "amount": 10000,
        "timestamp": "2026-11-05 10:04:00"
    }
])


# =====================================================
# API HEALTH CHECK
# =====================================================

st.header("Pipeline Health")

try:
    health_response = requests.get(
        f"{API_URL}/health",
        timeout=5
    )
    health_response.raise_for_status()
    st.success("Monitoring API is ONLINE")

except requests.RequestException:
    st.error("FastAPI is OFFLINE. Start the API server first.")
    st.stop()


# =====================================================
# PART 1: TRANSACTION MONITORING
# =====================================================

st.divider()
st.header("📊 Part 1: Transaction Monitoring")

st.write("Edit the sample transactions or add your own records.")

edited_data = st.data_editor(
    sample_data,
    num_rows="dynamic",
    use_container_width=True,
    key="transaction_editor"
)


if st.button("Analyze Transaction Data", type="primary"):

    transactions = edited_data.to_dict(orient="records")

    if not transactions:
        st.warning("Please enter at least one transaction.")

    else:
        try:
            with st.spinner("Analyzing transaction data..."):

                analysis_response = requests.post(
                    f"{API_URL}/monitoring/analyze",
                    json=transactions,
                    timeout=30
                )
                analysis_response.raise_for_status()

                quality_response = requests.post(
                    f"{API_URL}/monitoring/data-quality",
                    json=transactions,
                    timeout=30
                )
                quality_response.raise_for_status()

                analysis = analysis_response.json()
                quality = quality_response.json()

                st.session_state["analysis"] = analysis
                st.session_state["quality"] = quality
                st.session_state["metrics"] = analysis["quality_metrics"]
                st.session_state["anomalies"] = analysis["anomaly_report"]

            st.success("Transaction analysis completed!")

        except requests.RequestException as error:
            st.error(f"API request failed: {error}")

        except (KeyError, ValueError) as error:
            st.error(f"Unexpected API response: {error}")


# Transaction data quality

st.subheader("Transaction Data Quality")

metrics = st.session_state.get("metrics")
quality = st.session_state.get("quality")

if metrics:

    col1, col2, col3, col4 = st.columns(4)

    col1.metric("Total Records", metrics["total_records"])
    col2.metric("Valid Records", metrics["valid_records"])
    col3.metric("Invalid Records", metrics["invalid_records"])
    col4.metric(
        "Quality Percentage",
        f'{metrics["quality_percentage"]}%'
    )

    chart_data = pd.DataFrame({
        "Record Type": ["Valid", "Invalid"],
        "Count": [
            metrics["valid_records"],
            metrics["invalid_records"]
        ]
    })

    st.bar_chart(chart_data.set_index("Record Type"))

    if quality:
        st.subheader("Valid Transactions")
        st.dataframe(
            pd.DataFrame(quality["valid_records"]),
            use_container_width=True
        )

        st.subheader("Invalid Transactions")

        if quality["invalid_records"]:
            st.dataframe(
                pd.DataFrame(quality["invalid_records"]),
                use_container_width=True
            )
        else:
            st.success("No invalid transactions found.")

        st.subheader("Transaction Validation Report")
        st.json(quality["report"])

else:
    st.info("Run transaction analysis to view the results.")


# Transaction anomaly detection

st.subheader("Transaction Anomaly Detection")

anomalies = st.session_state.get("anomalies")

if anomalies:

    col1, col2 = st.columns(2)

    col1.metric("Total Anomalies", anomalies["anomaly_count"])
    col2.metric("Records Analyzed", anomalies["total_records"])

    if anomalies["anomalies"]:
        st.warning("Unusual transaction amounts detected.")

        st.dataframe(
            pd.DataFrame(anomalies["anomalies"]),
            use_container_width=True
        )
    else:
        st.success("No anomalies detected.")

else:
    st.info("Transaction anomaly results will appear after analysis.")


# Transaction automatic incidents

st.subheader("Transaction Automatic Incident Detection")

transaction_analysis = st.session_state.get("analysis")

if transaction_analysis:

    new_incidents = transaction_analysis.get(
        "automatic_incidents", []
    )

    st.metric(
        "New Transaction Incidents",
        transaction_analysis.get("total_new_incidents", 0)
    )

    if new_incidents:
        st.dataframe(
            pd.DataFrame(new_incidents),
            use_container_width=True
        )
    else:
        st.success("No new transaction incidents.")

else:
    st.info("Transaction incident results will appear after analysis.")


# =====================================================
# PART 2: REAL ICЕSTREAM EVENT MONITORING
# =====================================================

st.divider()
st.header("🌊 Part 2: Real-Time IceStream Event Monitoring")

st.write(
    "Analyze the actual IceStream event dataset stored in the project's data folder."
)

st.caption("Dataset: icestream_events_with_anomalies.csv")


if st.button("Analyze IceStream Event Dataset", type="primary"):

    try:
        with st.spinner("Loading and analyzing 10,000 IceStream events..."):

            event_response = requests.post(
                f"{API_URL}/monitoring/events/analyze",
                timeout=60
            )

            event_response.raise_for_status()

            event_analysis = event_response.json()

            st.session_state["event_analysis"] = event_analysis

        st.success("IceStream event dataset analyzed successfully!")

    except requests.RequestException as error:
        st.error(f"Event analysis API request failed: {error}")

    except (KeyError, ValueError) as error:
        st.error(f"Unexpected event analysis response: {error}")


# Display event analysis

event_analysis = st.session_state.get("event_analysis")

if event_analysis:

    event_metrics = event_analysis.get("metrics", {})
    validation = event_analysis.get("validation_report", {})
    anomaly_report = event_analysis.get("anomaly_report", {})

    st.subheader("Event Data Quality Overview")

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Total Events",
        event_metrics.get("total_events", 0)
    )

    col2.metric(
        "Valid Events",
        event_metrics.get("valid_events", 0)
    )

    col3.metric(
        "Invalid Events",
        event_metrics.get("invalid_events", 0)
    )

    col4.metric(
        "Data Quality",
        f'{event_metrics.get("quality_percentage", 0)}%'
    )

    # Event quality chart

    event_quality_chart = pd.DataFrame({
        "Event Type": ["Valid Events", "Invalid Events"],
        "Count": [
            event_metrics.get("valid_events", 0),
            event_metrics.get("invalid_events", 0)
        ]
    })

    st.subheader("Event Quality Chart")

    st.bar_chart(
        event_quality_chart.set_index("Event Type")
    )

    # Validation report

    st.subheader("Event Validation Report")

    st.write("Total records:", validation.get("total_records", 0))
    st.write("Valid records:", validation.get("valid_records", 0))
    st.write("Invalid records:", validation.get("invalid_records", 0))

    validation_errors = validation.get("errors", [])

    if validation_errors:
        st.warning("Data quality issues found:")

        for error in validation_errors:
            st.write(f"- {error}")

    else:
        st.success("No validation issues found.")

    # Event anomaly detection

    st.divider()
    st.subheader("Event Anomaly Detection")

    col1, col2, col3 = st.columns(3)

    col1.metric(
        "Total Events",
        anomaly_report.get("total_events", 0)
    )

    col2.metric(
        "Anomalies",
        anomaly_report.get("anomaly_count", 0)
    )

    col3.metric(
        "Anomaly Percentage",
        f'{anomaly_report.get("anomaly_percentage", 0)}%'
    )

    anomaly_breakdown = anomaly_report.get(
        "anomaly_breakdown", {}
    )

    if anomaly_breakdown:

        st.write("Anomalies by Category")

        anomaly_chart = pd.DataFrame(
            list(anomaly_breakdown.items()),
            columns=["Anomaly Type", "Count"]
        )

        st.bar_chart(
            anomaly_chart.set_index("Anomaly Type")
        )

        st.dataframe(
            anomaly_chart,
            use_container_width=True
        )

    else:
        st.success("No anomalies found.")

    # Automatic event incidents

    st.divider()
    st.subheader("Automatic Event Incident Detection")

    event_incidents = event_analysis.get(
        "automatic_incidents", []
    )

    st.metric(
        "New Event Incidents Created",
        event_analysis.get("total_new_incidents", 0)
    )

    if event_incidents:

        st.warning("Event anomalies generated automatic incidents.")

        st.dataframe(
            pd.DataFrame(event_incidents),
            use_container_width=True
        )

    else:
        st.info(
            "No new incidents created. Existing open incidents may already cover these anomaly types."
        )

else:
    st.info(
        "Click 'Analyze IceStream Event Dataset' to load the real dataset results."
    )


# =====================================================
# PART 3: ALL INCIDENTS
# =====================================================

st.divider()
st.header("🚨 Part 3: Incident Monitoring")

try:
    incident_response = requests.get(
        f"{API_URL}/monitoring/incidents",
        timeout=10
    )

    incident_response.raise_for_status()

    incidents = incident_response.json().get("incidents", [])

    open_incidents = [
        item for item in incidents
        if item["status"] == "OPEN"
    ]

    resolved_incidents = [
        item for item in incidents
        if item["status"] == "RESOLVED"
    ]

    col1, col2, col3 = st.columns(3)

    col1.metric("Total Incidents", len(incidents))
    col2.metric("Open Incidents", len(open_incidents))
    col3.metric("Resolved Incidents", len(resolved_incidents))

    if incidents:

        st.subheader("All Recorded Incidents")

        st.dataframe(
            pd.DataFrame(incidents),
            use_container_width=True
        )

    else:
        st.success("No incidents recorded.")

except requests.RequestException:
    st.warning("Incident information is unavailable.")


# =====================================================
# FOOTER
# =====================================================

st.divider()

st.caption(
    "IceStream | Real-Time Lakehouse Observability | Member 2"
)
