
"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Sidebar from "../components/Sidebar";

export default function TimeTravelPage() {
  const [selectedMode, setSelectedMode] = useState("timestamp");

  return (
    <div style={styles.app}>
      <Sidebar />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.eyebrow}>ICESTREAM MONITORING</p>
            <h1 style={styles.heading}>Time Travel</h1>
            <p style={styles.subtitle}>
              Explore historical lakehouse snapshots and data versions.
            </p>
          </div>

          <span style={styles.pendingBadge}>
            Iceberg Integration Pending
          </span>
        </header>

        <section style={styles.notice}>
          <div style={styles.noticeIcon}>◷</div>
          <div>
            <h2 style={styles.noticeTitle}>
              Apache Iceberg Time Travel
            </h2>
            <p style={styles.noticeText}>
              Time Travel will allow users to access previous versions of
              lakehouse data using snapshot IDs or timestamps. Apache Iceberg
              integration is not connected to this application yet.
            </p>
          </div>
        </section>

        <section style={styles.metrics}>
          <Metric title="Snapshot History" value="Pending" />
          <Metric title="Current Snapshot" value="Not Connected" />
          <Metric title="Historical Versions" value="Pending" />
        </section>

        <section style={styles.panel}>
          <h2 style={styles.panelTitle}>Select Historical Data</h2>
          <p style={styles.panelSubtitle}>
            Choose how you would access a historical Iceberg table version.
          </p>

          <div style={styles.modeOptions}>
            <button
              style={{
                ...styles.modeCard,
                ...(selectedMode === "timestamp"
                  ? styles.selectedMode
                  : {}),
              }}
              onClick={() => setSelectedMode("timestamp")}
            >
              <span style={styles.modeIcon}>◷</span>
              <strong>Timestamp Based</strong>
              <span style={styles.modeDescription}>
                Select a date and time to access an earlier table version.
              </span>
            </button>

            <button
              style={{
                ...styles.modeCard,
                ...(selectedMode === "snapshot"
                  ? styles.selectedMode
                  : {}),
              }}
              onClick={() => setSelectedMode("snapshot")}
            >
              <span style={styles.modeIcon}>▤</span>
              <strong>Snapshot ID Based</strong>
              <span style={styles.modeDescription}>
                Access a historical version using its snapshot ID.
              </span>
            </button>
          </div>

          <div style={styles.formArea}>
            <label style={styles.label}>
              {selectedMode === "timestamp"
                ? "Select Timestamp"
                : "Enter Snapshot ID"}
            </label>

            {selectedMode === "timestamp" ? (
              <input
                type="datetime-local"
                disabled
                style={styles.input}
              />
            ) : (
              <input
                type="text"
                disabled
                placeholder="Snapshot ID will be available after integration"
                style={styles.input}
              />
            )}

            <button style={styles.disabledButton} disabled>
              Preview Historical Data
            </button>

            <p style={styles.helperText}>
              Historical queries are unavailable until Apache Iceberg
              storage and snapshot APIs are integrated.
            </p>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Snapshot History</h2>
              <p style={styles.panelSubtitle}>
                Historical table versions will appear here after integration.
              </p>
            </div>

            <span style={styles.pendingBadge}>
              Not Connected
            </span>
          </div>

          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>◷</div>
            <h3 style={styles.emptyTitle}>
              No Snapshot History Available
            </h3>
            <p style={styles.emptyText}>
              Apache Iceberg is not connected yet. Snapshot IDs, commit
              timestamps and historical versions will be displayed here
              after integration.
            </p>
          </div>
        </section>

        <section style={styles.infoPanel}>
          <h2 style={styles.panelTitle}>
            How Iceberg Time Travel Works
          </h2>

          <div style={styles.steps}>
            <Step
              number="01"
              title="Data Commit"
              description="A new data change creates a table snapshot."
            />

            <Step
              number="02"
              title="Snapshot History"
              description="Iceberg maintains metadata describing table versions."
            />

            <Step
              number="03"
              title="Version Selection"
              description="Select an earlier version using a snapshot ID or timestamp."
            />

            <Step
              number="04"
              title="Historical Query"
              description="Query the table as it existed at the selected version."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={styles.metricCard}>
      <p style={styles.metricTitle}>{title}</p>
      <h2 style={styles.metricValue}>{value}</h2>
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div style={styles.step}>
      <span style={styles.stepNumber}>{number}</span>
      <div>
        <h3 style={styles.stepTitle}>{title}</h3>
        <p style={styles.stepDescription}>{description}</p>
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#172033",
  },
  main: {
    flex: 1,
    minWidth: 0,
    marginLeft: "256px",
    width: "calc(100% - 256px)",
    padding: "32px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "24px",
  },
  eyebrow: {
    color: "#64748b",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1.4px",
    margin: "0 0 8px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 750,
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: "8px 0 0",
  },
  pendingBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "22px",
  },
  noticeIcon: {
    fontSize: "30px",
    color: "#2563eb",
  },
  noticeTitle: {
    fontSize: "17px",
    margin: "0 0 8px",
  },
  noticeText: {
    color: "#475569",
    fontSize: "13px",
    lineHeight: 1.7,
    margin: 0,
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: "16px",
    marginBottom: "22px",
  },
  metricCard: {
    background: "#fff",
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    padding: "20px",
  },
  metricTitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: "0 0 13px",
  },
  metricValue: {
    fontSize: "20px",
    margin: 0,
    fontWeight: 700,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "22px",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "18px",
  },
  panelTitle: {
    fontSize: "18px",
    fontWeight: 700,
    margin: 0,
  },
  panelSubtitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: "7px 0 0",
  },
  modeOptions: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginTop: "22px",
  },
  modeCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
    padding: "18px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    background: "#fff",
    color: "#334155",
    textAlign: "left",
    cursor: "pointer",
  },
  selectedMode: {
    border: "2px solid #2563eb",
    background: "#eff6ff",
  },
  modeIcon: {
    fontSize: "25px",
    color: "#2563eb",
  },
  modeDescription: {
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.6,
  },
  formArea: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #e2e8f0",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    marginBottom: "9px",
  },
  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    boxSizing: "border-box",
    background: "#f1f5f9",
    color: "#94a3b8",
  },
  disabledButton: {
    marginTop: "14px",
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    background: "#94a3b8",
    color: "#fff",
    fontWeight: 600,
    cursor: "not-allowed",
  },
  helperText: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "12px",
  },
  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: "10px",
    padding: "36px 20px",
    textAlign: "center",
    background: "#f8fafc",
  },
  emptyIcon: {
    fontSize: "34px",
    color: "#94a3b8",
  },
  emptyTitle: {
    fontSize: "16px",
    margin: "12px 0 8px",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.7,
    maxWidth: "550px",
    margin: "0 auto",
  },
  infoPanel: {
    background: "#fff",
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "22px",
  },
  steps: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "18px",
    marginTop: "22px",
  },
  step: {
    display: "flex",
    gap: "13px",
    alignItems: "flex-start",
  },
  stepNumber: {
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: 800,
  },
  stepTitle: {
    fontSize: "14px",
    margin: "0 0 6px",
  },
  stepDescription: {
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.6,
    margin: 0,
  },
};
