
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

# Sample transaction data
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

# Check API health
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

# Transaction input
st.divider()
st.header("Transaction Data Input")

st.write("Edit the sample transactions or add your own records.")

edited_data = st.data_editor(
    sample_data,
    num_rows="dynamic",
    use_container_width=True,
    key="transaction_editor"
)

# Complete transaction analysis
if st.button("Analyze Transaction Data", type="primary"):

    transactions = edited_data.to_dict(orient="records")

    if not transactions:
        st.warning("Please enter at least one transaction.")

    else:
        try:
            with st.spinner("Running complete transaction analysis..."):

                # Run complete analysis and automatic incident detection
                analysis_response = requests.post(
                    f"{API_URL}/monitoring/analyze",
                    json=transactions,
                    timeout=30
                )
                analysis_response.raise_for_status()

                # Get valid and invalid transaction details
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

            st.success("Analysis completed and automatic incident detection executed!")

        except requests.RequestException as error:
            st.error(f"API request failed: {error}")

        except (KeyError, ValueError) as error:
            st.error(f"Unexpected API response: {error}")


# Data quality overview
st.divider()
st.header("Data Quality Overview")

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

    st.subheader("Data Quality Chart")
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

        st.subheader("Validation Report")
        st.json(quality["report"])

else:
    st.info("Enter transaction data and click Analyze Transaction Data.")


# Anomaly detection
st.divider()
st.header("Anomaly Detection")

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
    st.info("Anomaly results will appear after analysis.")


# Automatic incident detection results
st.divider()
st.header("Automatic Incident Detection")

analysis = st.session_state.get("analysis")

if analysis:

    new_incidents = analysis.get("automatic_incidents", [])

    st.metric(
        "New Incidents Created",
        analysis.get("total_new_incidents", 0)
    )

    if new_incidents:
        st.warning("The system automatically detected issues and created incidents.")

        st.dataframe(
            pd.DataFrame(new_incidents),
            use_container_width=True
        )
    else:
        st.success("No new incidents were detected during this analysis.")

else:
    st.info("Automatic incident results will appear after analysis.")


# Incident monitoring
st.divider()
st.header("Incident Monitoring")

try:
    incident_response = requests.get(
        f"{API_URL}/monitoring/incidents",
        timeout=5
    )

    incident_response.raise_for_status()

    incidents = incident_response.json()["incidents"]

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
        st.dataframe(
            pd.DataFrame(incidents),
            use_container_width=True
        )
    else:
        st.success("No incidents recorded.")

except requests.RequestException:
    st.warning("Incident information is unavailable.")


st.divider()
st.caption("IceStream | Real-Time Lakehouse Observability")
