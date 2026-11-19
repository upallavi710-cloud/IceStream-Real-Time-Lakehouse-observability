
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";

const API_URL = "http://127.0.0.1:8000";

type Incident = {
    id?: number;
    incident_id?: number;
    type?: string;
    incident_type?: string;
    description?: string;
    message?: string;
    severity?: string;
    status?: string;
    timestamp?: string;
    created_at?: string;
    [key: string]: unknown;
};

function getIncidentId(incident: Incident): number {
    return Number(incident.incident_id ?? incident.id ?? 0);
}

function getIncidentType(incident: Incident): string {
    return String(incident.incident_type ?? incident.type ?? "Unknown");
}

function getDescription(incident: Incident): string {
    return String(incident.description ?? incident.message ?? "No description available");
}

function getTimestamp(incident: Incident): string {
    const value = incident.timestamp ?? incident.created_at;
    if (!value) return "Not available";

    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function getSeverity(incident: Incident): string {
    return String(incident.severity ?? "UNKNOWN").toUpperCase();
}

function getStatus(incident: Incident): string {
    return String(incident.status ?? "OPEN").toUpperCase();
}

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [resolvingId, setResolvingId] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState("");

    const fetchIncidents = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);

    try {
        const response = await fetch(`${API_URL}/monitoring/incidents`, {
        cache: "no-store",
        });

        if (!response.ok) {
        throw new Error(`Unable to load incidents (${response.status})`);
        }

        const data = await response.json();

        const records = Array.isArray(data)
        ? data
        : Array.isArray(data.incidents)
            ? data.incidents
            : Array.isArray(data.data)
            ? data.data
            : [];

        setIncidents(records);
        setConnected(true);
        setError("");
        setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
        setConnected(false);
        setError(
        err instanceof Error
            ? err.message
            : "Could not connect to the FastAPI backend."
        );
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
    }, []);

    useEffect(() => {
    fetchIncidents();
    }, [fetchIncidents]);

    const resolveIncident = async (incident: Incident) => {
    const id = getIncidentId(incident);

    if (!id) {
        setError("Incident ID is missing. Cannot resolve this incident.");
        return;
    }

    const confirmed = window.confirm(
        `Are you sure you want to resolve incident #${id}?`
    );

    if (!confirmed) return;

    setResolvingId(id);
    setMessage("");
    setError("");

    try {
        const response = await fetch(
        `${API_URL}/monitoring/incidents/${id}/resolve`,
        { method: "PATCH" }
        );

        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.detail || "Failed to resolve incident.");
        }

        const updatedIncident =
        data.incident && typeof data.incident === "object"
            ? data.incident
            : { ...incident, status: "RESOLVED" };

        setIncidents((previous) =>
        previous.map((item) =>
            getIncidentId(item) === id ? updatedIncident : item
        )
        );

        setSelectedIncident((previous) =>
        previous && getIncidentId(previous) === id
            ? updatedIncident
            : previous
        );

        setMessage(`Incident #${id} resolved successfully.`);
    } catch (err) {
        setError(
        err instanceof Error ? err.message : "Unable to resolve incident."
        );
    } finally {
        setResolvingId(null);
    }
    };

    const total = incidents.length;

    const openCount = incidents.filter(
    (item) => getStatus(item) === "OPEN"
    ).length;

    const resolvedCount = incidents.filter(
    (item) => getStatus(item) === "RESOLVED"
    ).length;

    const highCount = incidents.filter(
    (item) => getSeverity(item) === "HIGH"
    ).length;

    const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
        const text = [
        getIncidentId(incident),
        getIncidentType(incident),
        getDescription(incident),
        getSeverity(incident),
        getStatus(incident),
        ]
        .join(" ")
        .toLowerCase();

        const matchesSearch = text.includes(search.toLowerCase());

        const matchesSeverity =
        severityFilter === "ALL" ||
        getSeverity(incident) === severityFilter;

        const matchesStatus =
        statusFilter === "ALL" ||
        getStatus(incident) === statusFilter;

        return matchesSearch && matchesSeverity && matchesStatus;
    });
    }, [incidents, search, severityFilter, statusFilter]);

    return (
    <div style={styles.app}>
        <Sidebar />

        <main style={styles.main}>
        <div style={styles.header}>
            <div>
            <p style={styles.eyebrow}>ICESTREAM MONITORING</p>
            <h1 style={styles.heading}>Incidents Management</h1>
            <p style={styles.subtitle}>
                Monitor, review and manage data pipeline incidents.
            </p>
            </div>

            <button
            style={styles.refreshButton}
            onClick={() => fetchIncidents(true)}
            disabled={refreshing}
            >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
            </button>
        </div>

        <div style={styles.connectionRow}>
            <span
            style={{
                ...styles.connectionDot,
                background: connected ? "#16a34a" : "#dc2626",
            }}
            />
            <span style={styles.connectionText}>
            FastAPI {connected ? "Connected" : "Disconnected"}
            </span>
            {lastUpdated && (
            <span style={styles.updatedText}>
                Last updated: {lastUpdated}
            </span>
            )}
        </div>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}

        <section style={styles.metricsGrid}>
            <Metric title="Total Incidents" value={total} color="#2563eb" />
            <Metric title="Open Incidents" value={openCount} color="#ea580c" />
            <Metric title="Resolved Incidents" value={resolvedCount} color="#16a34a" />
            <Metric title="High Severity" value={highCount} color="#dc2626" />
        </section>

        <section style={styles.panel}>
            <div style={styles.panelHeader}>
            <div>
                <h2 style={styles.panelTitle}>Incident Records</h2>
                <p style={styles.panelSubtitle}>
                Review incidents reported by the monitoring system.
                </p>
            </div>
            <span style={styles.recordCount}>
                {filteredIncidents.length} records
            </span>
            </div>

            <div style={styles.filters}>
            <input
                style={styles.search}
                type="text"
                placeholder="Search incidents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <select
                style={styles.select}
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
            >
                <option value="ALL">All Severities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
            </select>

            <select
                style={styles.select}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
            </select>
            </div>

            {loading ? (
            <p style={styles.empty}>Loading incidents...</p>
            ) : !connected ? (
            <p style={styles.empty}>
                Backend is not connected. Start FastAPI and refresh this page.
            </p>
            ) : filteredIncidents.length === 0 ? (
            <p style={styles.empty}>No incidents match your search or filters.</p>
            ) : (
            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                <thead>
                    <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Incident Type</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Severity</th>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {filteredIncidents.map((incident, index) => {
                    const id = getIncidentId(incident);
                    const severity = getSeverity(incident);
                    const status = getStatus(incident);

                    return (
                        <tr key={id || index}>
                        <td style={styles.td}>#{id || "—"}</td>
                        <td style={styles.td}>{getIncidentType(incident)}</td>
                        <td style={styles.descriptionCell}>
                            {getDescription(incident)}
                        </td>
                        <td style={styles.td}>
                            <span style={getSeverityStyle(severity)}>
                            {severity}
                            </span>
                        </td>
                        <td style={styles.td}>{getTimestamp(incident)}</td>
                        <td style={styles.td}>
                            <span style={getStatusStyle(status)}>
                            {status}
                            </span>
                        </td>
                        <td style={styles.td}>
                            <div style={styles.actions}>
                            <button
                                style={styles.viewButton}
                                onClick={() => setSelectedIncident(incident)}
                            >
                                View
                            </button>

                            {status === "OPEN" ? (
                                <button
                                style={styles.resolveButton}
                                onClick={() => resolveIncident(incident)}
                                disabled={resolvingId === id}
                                >
                                {resolvingId === id ? "Resolving..." : "Resolve"}
                                </button>
                            ) : (
                                <span style={styles.completed}>Completed</span>
                            )}
                            </div>
                        </td>
                        </tr>
                    );
                    })}
                </tbody>
                </table>
            </div>
            )}
        </section>

        {selectedIncident && (
            <div
            style={styles.overlay}
            onClick={() => setSelectedIncident(null)}
            >
            <div
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={styles.modalHeader}>
                <div>
                    <p style={styles.eyebrow}>INCIDENT DETAILS</p>
                    <h2 style={styles.modalTitle}>
                    Incident #{getIncidentId(selectedIncident)}
                    </h2>
                </div>
                <button
                    style={styles.closeButton}
                    onClick={() => setSelectedIncident(null)}
                    aria-label="Close incident details"
                >
                    ×
                </button>
                </div>

                <Detail label="Incident Type" value={getIncidentType(selectedIncident)} />
                <Detail label="Description" value={getDescription(selectedIncident)} />
                <Detail label="Severity" value={getSeverity(selectedIncident)} />
                <Detail label="Timestamp" value={getTimestamp(selectedIncident)} />
                <Detail label="Status" value={getStatus(selectedIncident)} />

                <div style={styles.modalFooter}>
                {getStatus(selectedIncident) === "OPEN" && (
                    <button
                    style={styles.resolveButton}
                    disabled={
                        resolvingId === getIncidentId(selectedIncident)
                    }
                    onClick={() => resolveIncident(selectedIncident)}
                    >
                    {resolvingId === getIncidentId(selectedIncident)
                        ? "Resolving..."
                        : "Resolve Incident"}
                    </button>
                )}

                <button
                    style={styles.closeModalButton}
                    onClick={() => setSelectedIncident(null)}
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
        <h2 style={styles.metricValue}>{value}</h2>
    </div>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
    <div style={styles.detailRow}>
        <span style={styles.detailLabel}>{label}</span>
        <span style={styles.detailValue}>{value}</span>
    </div>
    );
}

function getSeverityStyle(severity: string): React.CSSProperties {
    const colors: Record<string, string> = {
    HIGH: "#fee2e2",
    MEDIUM: "#fef3c7",
    LOW: "#dcfce7",
    };

    const textColors: Record<string, string> = {
    HIGH: "#b91c1c",
    MEDIUM: "#92400e",
    LOW: "#166534",
    };

    return {
    ...styles.badge,
    background: colors[severity] ?? "#e5e7eb",
    color: textColors[severity] ?? "#374151",
    };
}

function getStatusStyle(status: string): React.CSSProperties {
    return {
    ...styles.badge,
    background: status === "RESOLVED" ? "#dcfce7" : "#ffedd5",
    color: status === "RESOLVED" ? "#166534" : "#c2410c",
    };
}

const styles: Record<string, React.CSSProperties> = {
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
    gap: "16px",
    flexWrap: "wrap",
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
    margin: "8px 0 0",
    fontSize: "14px",
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
    connectionRow: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    marginBottom: "24px",
    },
    connectionDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    },
    connectionText: {
    fontSize: "13px",
    fontWeight: 600,
    },
    updatedText: {
    color: "#64748b",
    fontSize: "12px",
    marginLeft: "8px",
    },
    error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    },
    success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "16px",
    },
    metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
    },
    metricCard: {
    background: "#fff",
    border: "1px solid #e5eaf1",
    borderRadius: "12px",
    padding: "18px",
    position: "relative",
    overflow: "hidden",
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
    gap: "12px",
    flexWrap: "wrap",
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
    flex: "1 1 220px",
    minWidth: "180px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "13px",
    },
    select: {
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
    padding: "14px 10px",
    borderBottom: "1px solid #edf0f5",
    verticalAlign: "middle",
    },
    descriptionCell: {
    padding: "14px 10px",
    borderBottom: "1px solid #edf0f5",
    minWidth: "180px",
    maxWidth: "260px",
    lineHeight: 1.5,
    },
    badge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "10px",
    fontWeight: 700,
    whiteSpace: "nowrap",
    },
    actions: {
    display: "flex",
    gap: "7px",
    alignItems: "center",
    flexWrap: "wrap",
    },
    viewButton: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    },
    resolveButton: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "7px 10px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    },
    completed: {
    color: "#15803d",
    fontSize: "11px",
    fontWeight: 700,
    },
    empty: {
    padding: "30px 10px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
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
    maxWidth: "550px",
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
    marginBottom: "22px",
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
    padding: "13px 0",
    borderBottom: "1px solid #e2e8f0",
    },
    detailLabel: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: 600,
    flex: "0 0 125px",
    },
    detailValue: {
    fontSize: "13px",
    textAlign: "right",
    overflowWrap: "anywhere",
    },
    modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "22px",
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
