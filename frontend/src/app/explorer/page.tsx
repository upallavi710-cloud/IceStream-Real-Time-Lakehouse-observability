
"use client";

import { useCallback, useEffect, useState } from "react";
import type { CSSProperties } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://127.0.0.1:8000";
const PAGE_SIZE = 25;

type EventRecord = {
    event_id: string;
    event_time: string;
    ingestion_time: string;
    source_system: string;
    pipeline_node: string;
    event_type: string;
    entity_id: string;
    metric_name: string;
    metric_value: number;
    status: string;
    region: string;
    schema_version: number;
    ingestion_delay_ms: number;
    payload_size_bytes: number;
    is_injected_anomaly: boolean;
    anomaly_type: string | null;
};

type ApiResponse = {
    status: string;
    total_records: number;
    limit: number;
    offset: number;
    columns: string[];
    records: EventRecord[];
};

export default function DataExplorerPage() {
    const [records, setRecords] = useState<EventRecord[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [eventType, setEventType] = useState("");
    const [status, setStatus] = useState("");
    const [anomaly, setAnomaly] = useState("");
    const [page, setPage] = useState(0);
    const [selectedRecord, setSelectedRecord] =
    useState<EventRecord | null>(null);

    const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
        const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
        search,
        event_type: eventType,
        status,
        anomaly,
        });

        const response = await fetch(
        `${API_URL}/monitoring/events/records?${params.toString()}`,
        { cache: "no-store" }
        );

        if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
        }

        const data: ApiResponse = await response.json();

        setRecords(data.records || []);
        setTotalRecords(data.total_records || 0);
    } catch (err) {
        setError(
        err instanceof Error
            ? err.message
            : "Unable to load event records."
        );
        setRecords([]);
        setTotalRecords(0);
    } finally {
        setLoading(false);
    }
    }, [page, search, eventType, status, anomaly]);

    useEffect(() => {
    fetchRecords();
    }, [fetchRecords]);

    const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

    const anomalyCount = records.filter(
    (record) => record.is_injected_anomaly === true
    ).length;

    const normalCount = records.length - anomalyCount;

    const changeFilter = (
    setter: (value: string) => void,
    value: string
    ) => {
    setter(value);
    setPage(0);
    };

    const formatDate = (value: string) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? value
        : date.toLocaleString();
    };

    return (
    <div style={styles.app}>
        <Sidebar />

        <main style={styles.main}>
        <header style={styles.header}>
            <div>
            <p style={styles.eyebrow}>ICESTREAM MONITORING</p>
            <h1 style={styles.heading}>Data Explorer</h1>
            <p style={styles.subtitle}>
                Explore, search and filter event records from the IceStream dataset.
            </p>
            </div>

            <button
            style={styles.refreshButton}
            onClick={() => fetchRecords()}
            disabled={loading}
            >
            {loading ? "Loading..." : "↻ Refresh"}
            </button>
        </header>

        <div style={styles.connection}>
            <span
            style={{
                ...styles.dot,
                background: error ? "#dc2626" : "#16a34a",
            }}
            />
            <strong>
            {error ? "API Disconnected" : "FastAPI Connected"}
            </strong>
            <span style={styles.datasetName}>
            Dataset: icestream_events_with_anomalies.csv
            </span>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <section style={styles.metrics}>
            <Metric title="Total Matching Records" value={totalRecords} color="#2563eb" />
            <Metric title="Records on This Page" value={records.length} color="#0891b2" />
            <Metric title="Anomalies on This Page" value={anomalyCount} color="#dc2626" />
            <Metric title="Normal on This Page" value={normalCount} color="#16a34a" />
        </section>

        <section style={styles.panel}>
            <div style={styles.panelHeader}>
            <div>
                <h2 style={styles.panelTitle}>Event Records</h2>
                <p style={styles.panelSubtitle}>
                Search and filter actual records retrieved from the backend.
                </p>
            </div>

            <span style={styles.recordCount}>
                {totalRecords.toLocaleString()} matching records
            </span>
            </div>

            <div style={styles.filters}>
            <input
                style={styles.search}
                placeholder="Search event ID, source, region, metric..."
                value={search}
                onChange={(e) =>
                changeFilter(setSearch, e.target.value)
                }
            />

            <input
                style={styles.filterInput}
                placeholder="Event type"
                value={eventType}
                onChange={(e) =>
                changeFilter(setEventType, e.target.value)
                }
            />

            <input
                style={styles.filterInput}
                placeholder="Status"
                value={status}
                onChange={(e) =>
                changeFilter(setStatus, e.target.value)
                }
            />

            <select
                style={styles.filterInput}
                value={anomaly}
                onChange={(e) =>
                changeFilter(setAnomaly, e.target.value)
                }
            >
                <option value="">All Records</option>
                <option value="yes">Anomalies Only</option>
                <option value="no">Normal Only</option>
            </select>
            </div>

            {loading ? (
            <p style={styles.empty}>Loading event records...</p>
            ) : error ? (
            <p style={styles.empty}>
                Could not load records. Check that FastAPI is running.
            </p>
            ) : records.length === 0 ? (
            <p style={styles.empty}>No matching event records found.</p>
            ) : (
            <>
                <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th style={styles.th}>Event ID</th>
                        <th style={styles.th}>Event Time</th>
                        <th style={styles.th}>Source System</th>
                        <th style={styles.th}>Pipeline Node</th>
                        <th style={styles.th}>Event Type</th>
                        <th style={styles.th}>Metric</th>
                        <th style={styles.th}>Value</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Region</th>
                        <th style={styles.th}>Anomaly</th>
                        <th style={styles.th}>Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {records.map((record, index) => (
                        <tr key={record.event_id || index}>
                        <td style={styles.td}>
                            {record.event_id}
                        </td>
                        <td style={styles.td}>
                            {formatDate(record.event_time)}
                        </td>
                        <td style={styles.td}>
                            {record.source_system}
                        </td>
                        <td style={styles.td}>
                            {record.pipeline_node}
                        </td>
                        <td style={styles.td}>
                            {record.event_type}
                        </td>
                        <td style={styles.td}>
                            {record.metric_name}
                        </td>
                        <td style={styles.td}>
                            {record.metric_value ?? "—"}
                        </td>
                        <td style={styles.td}>
                            {record.status}
                        </td>
                        <td style={styles.td}>
                            {record.region}
                        </td>
                        <td style={styles.td}>
                            <span
                            style={
                                record.is_injected_anomaly
                                ? styles.anomalyBadge
                                : styles.normalBadge
                            }
                            >
                            {record.is_injected_anomaly
                                ? "Anomaly"
                                : "Normal"}
                            </span>
                        </td>
                        <td style={styles.td}>
                            <button
                            style={styles.viewButton}
                            onClick={() => setSelectedRecord(record)}
                            >
                            View
                            </button>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                <div style={styles.pagination}>
                <span style={styles.pageInfo}>
                  Showing {page * PAGE_SIZE + 1}–
                  {page * PAGE_SIZE + records.length} of{" "}
                    {totalRecords.toLocaleString()}
                </span>

                <div style={styles.pageButtons}>
                    <button
                    style={styles.pageButton}
                    disabled={page === 0 || loading}
                    onClick={() => setPage((previous) => previous - 1)}
                    >
                    Previous
                    </button>

                    <span style={styles.pageNumber}>
                    Page {page + 1} of {Math.max(totalPages, 1)}
                    </span>

                    <button
                    style={styles.pageButton}
                    disabled={
                        loading ||
                        page + 1 >= totalPages
                    }
                    onClick={() => setPage((previous) => previous + 1)}
                    >
                    Next
                    </button>
                </div>
                </div>
            </>
            )}
        </section>

        {selectedRecord && (
            <div
            style={styles.overlay}
            onClick={() => setSelectedRecord(null)}
            >
            <div
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={styles.modalHeader}>
                <div>
                    <p style={styles.eyebrow}>EVENT DETAILS</p>
                    <h2 style={styles.modalTitle}>
                    {selectedRecord.event_id}
                    </h2>
                </div>

                <button
                    style={styles.closeButton}
                    onClick={() => setSelectedRecord(null)}
                >
                    ×
                </button>
                </div>

                {Object.entries(selectedRecord).map(([key, value]) => (
                <div style={styles.detailRow} key={key}>
                    <span style={styles.detailLabel}>
                    {key.replaceAll("_", " ")}
                    </span>
                    <span style={styles.detailValue}>
                    {value === null || value === ""
                        ? "—"
                        : String(value)}
                    </span>
                </div>
                ))}

                <div style={styles.modalFooter}>
                <button
                style={styles.closeModalButton}
                    onClick={() => setSelectedRecord(null)}
                >
                    Close
                </button>
                </div>
            </div>
            </div>
        )}
        </main>
    </div>
    );
}

function Metric({
    title,
    value,
    color,
}: {
    title: string;
    value: number;
    color: string;
}) {
    return (
    <div style={styles.metricCard}>
        <div style={{ ...styles.metricLine, background: color }} />
        <p style={styles.metricTitle}>{title}</p>
        <h2 style={styles.metricValue}>
        {value.toLocaleString()}
        </h2>
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
    overflowX: "hidden",
    boxSizing: "border-box",
    },
    header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "18px",
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
    refreshButton: {
    padding: "10px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    color: "#1e293b",
    fontWeight: 600,
    cursor: "pointer",
    },
    connection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "24px",
    fontSize: "13px",
    },
    dot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    },
    datasetName: {
    color: "#64748b",
    marginLeft: "8px",
    },
    error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    },
    metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
    },
    metricCard: {
    position: "relative",
    overflow: "hidden",
    background: "#fff",
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    padding: "18px",
    },
    metricLine: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "4px",
    },
    metricTitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: "2px 0 12px",
    },
    metricValue: {
    fontSize: "27px",
    margin: 0,
    fontWeight: 750,
    },
    panel: {
    background: "#fff",
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    padding: "22px",
    },
    panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "18px",
    },
    panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    },
    panelSubtitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: "6px 0 0",
    },
    recordCount: {
    color: "#64748b",
    fontSize: "12px",
    },
    filters: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "18px",
    },
    search: {
    flex: "1 1 240px",
    minWidth: "180px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "13px",
    },
    filterInput: {
    flex: "0 1 150px",
    minWidth: "120px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    background: "#fff",
    color: "#334155",
    fontSize: "13px",
    },
    tableWrapper: {
    width: "100%",
    overflowX: "auto",
    },
    table: {
    width: "100%",
    minWidth: "1100px",
    borderCollapse: "collapse",
    textAlign: "left",
    fontSize: "12px",
    },
    th: {
    padding: "13px 10px",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    whiteSpace: "nowrap",
    },
    td: {
    padding: "13px 10px",
    borderBottom: "1px solid #edf0f5",
    whiteSpace: "nowrap",
    },
    anomalyBadge: {
    display: "inline-block",
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    },
    normalBadge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#166534",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    },
    viewButton: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "7px 11px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    },
    empty: {
    padding: "30px 10px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    },
    pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
    },
    pageInfo: {
    color: "#64748b",
    fontSize: "12px",
    },
    pageButtons: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    },
    pageButton: {
    padding: "8px 12px",
    background: "#fff",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    color: "#334155",
    cursor: "pointer",
    },
    pageNumber: {
    color: "#64748b",
    fontSize: "12px",
    },
    overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    zIndex: 1000,
    },
    modal: {
    width: "100%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: "14px",
    padding: "25px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    },
    modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    },
    modalTitle: {
    fontSize: "22px",
    margin: 0,
    },
    closeButton: {
    border: "none",
    background: "transparent",
    fontSize: "28px",
    cursor: "pointer",
    color: "#64748b",
    },
    detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "11px 0",
    borderBottom: "1px solid #e2e8f0",
    },
    detailLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
    textTransform: "capitalize",
    flex: "0 0 150px",
    },
    detailValue: {
    fontSize: "12px",
    textAlign: "right",
    overflowWrap: "anywhere",
    },
    modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    },
    closeModalButton: {
    background: "#e2e8f0",
    color: "#334155",
    border: "none",
    borderRadius: "7px",
    padding: "9px 16px",
    cursor: "pointer",
    },
};
