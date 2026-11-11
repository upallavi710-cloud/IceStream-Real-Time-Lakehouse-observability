
"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import Sidebar from "../components/Sidebar";

import {
    AlertTriangle,
    Bell,
    CheckCircle2,
    Clock,
    RefreshCw,
    Search,
    ShieldAlert,
    Activity,
    Wifi,
    WifiOff,
} from "lucide-react";

interface Incident {
    incident_id: number;
    incident_type: string;
    severity: string;
    description: string;
    timestamp: string;
    status: string;
}

interface IncidentResponse {
    status: string;
    total_incidents: number;
    incidents: Incident[];
}

const API_URL = "http://127.0.0.1:8000";
const REFRESH_INTERVAL = 10000;

export default function AlertsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [severityFilter, setSeverityFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const requestInProgress = useRef(false);
    const hasLoaded = useRef(false);

  // Fetch incidents from FastAPI
    const fetchIncidents = useCallback(async (manual = false) => {
    if (requestInProgress.current) return;

    requestInProgress.current = true;

    if (!hasLoaded.current) {
        setLoading(true);
    }

    if (manual) {
        setRefreshing(true);
    }

    try {
        const response = await fetch(
        `${API_URL}/monitoring/incidents`,
        {
            cache: "no-store",
        }
        );

        if (!response.ok) {
        throw new Error(`Backend returned HTTP ${response.status}`);
        }

        const data: IncidentResponse = await response.json();

        if (!Array.isArray(data.incidents)) {
        throw new Error("Invalid incident response from backend");
        }

        setIncidents(data.incidents);
        setConnected(true);
        setError("");
        setLastUpdated(new Date());
        hasLoaded.current = true;
    } catch (err) {
        setConnected(false);

        setError(
        err instanceof Error
            ? err.message
            : "Unable to connect to FastAPI"
        );
    } finally {
        requestInProgress.current = false;
        setLoading(false);
        setRefreshing(false);
    }
    }, []);

  // Initial fetch and automatic refresh every 10 seconds
    useEffect(() => {
    fetchIncidents();

    const interval = setInterval(() => {
        fetchIncidents();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
    }, [fetchIncidents]);

  // Incident statistics
    const total = incidents.length;

    const high = incidents.filter(
    (item) => item.severity.toUpperCase() === "HIGH"
    ).length;

    const medium = incidents.filter(
    (item) => item.severity.toUpperCase() === "MEDIUM"
    ).length;

    const low = incidents.filter(
    (item) => item.severity.toUpperCase() === "LOW"
    ).length;

    const open = incidents.filter(
    (item) => item.status.toUpperCase() === "OPEN"
    ).length;

    const resolved = incidents.filter(
    (item) => item.status.toUpperCase() === "RESOLVED"
    ).length;

  // Search and filters
    const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
        const matchesSearch =
        incident.incident_type
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        incident.description
            .toLowerCase()
            .includes(search.toLowerCase()) ||
        String(incident.incident_id).includes(search);

        const matchesSeverity =
        severityFilter === "ALL" ||
        incident.severity.toUpperCase() === severityFilter;

        const matchesStatus =
        statusFilter === "ALL" ||
        incident.status.toUpperCase() === statusFilter;

        return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus
        );
    });
    }, [incidents, search, severityFilter, statusFilter]);

    const severityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
        case "HIGH":
        return "border-red-500/30 bg-red-500/10 text-red-400";
        case "MEDIUM":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
        case "LOW":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";
        default:
        return "border-slate-500/30 bg-slate-500/10 text-slate-300";
    }
    };

    const statusStyle = (status: string) => {
    return status.toUpperCase() === "OPEN"
        ? "bg-red-500/10 text-red-400"
        : "bg-emerald-500/10 text-emerald-400";
    };

    const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleString();
    };

    return (
    <div className="min-h-screen bg-[#0B1724] text-white">
        <Sidebar />

        <main className="min-h-screen p-6 md:ml-64 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/10 p-3">
                <Bell className="text-red-400" size={25} />
                </div>

                <div>
                <h1 className="text-3xl font-bold">
                    Live Alerts
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                    Monitor incidents detected by IceStream
                </p>
                </div>
            </div>

            <button
                onClick={() => fetchIncidents(true)}
                disabled={refreshing || loading}
                className="flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50"
            >
                <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh Alerts"}
            </button>
            </div>

          {/* Connection status */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-[#172638] p-4">
            <div className="flex items-center gap-2">
                {connected ? (
                <>
                    <Wifi size={19} className="text-emerald-400" />
                    <span className="text-sm text-emerald-400">
                    FastAPI Connected
                    </span>
                </>
                ) : (
                <>
                    <WifiOff size={19} className="text-red-400" />
                    <span className="text-sm text-red-400">
                    FastAPI Disconnected
                    </span>
                </>
                )}
            </div>

            <div className="text-xs text-slate-400">
                {lastUpdated
                ? `Last successful update: ${lastUpdated.toLocaleTimeString()}`
                : "Waiting for first successful update"}
            </div>
            </div>

          {/* Automatic refresh information */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-teal-500/20 bg-teal-500/5 p-3 text-sm text-teal-300">
            <RefreshCw size={16} />
            Automatic refresh is enabled – every 10 seconds
            </div>

          {/* Error message */}
            {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
                <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle size={18} />
                Unable to refresh alerts
                </div>

                <p className="mt-2">{error}</p>

                <p className="mt-1 text-xs text-slate-400">
                Check whether FastAPI is running at {API_URL}.
                </p>
            </div>
            )}

          {/* Severity cards */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
                title="Total Incidents"
                value={total}
                subtitle="Incidents returned by API"
                icon={<Activity size={21} />}
                color="text-teal-400"
            />

            <Metric
                title="High Severity"
                value={high}
                subtitle="Requires priority attention"
                icon={<ShieldAlert size={21} />}
                color="text-red-400"
            />

            <Metric
                title="Medium Severity"
                value={medium}
                subtitle="Needs investigation"
                icon={<AlertTriangle size={21} />}
                color="text-amber-400"
            />

            <Metric
                title="Low Severity"
                value={low}
                subtitle="Lower priority incidents"
                icon={<Bell size={21} />}
                color="text-blue-400"
            />
            </section>

          {/* Open and resolved */}
            <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-[#172638] p-5">
                <div className="flex items-center gap-3">
                <Clock className="text-red-400" size={22} />
                <p className="text-sm text-slate-400">
                    Open Incidents
                </p>
                </div>

                <h2 className="mt-4 text-3xl font-bold">
                {open}
                </h2>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#172638] p-5">
                <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400" size={22} />
                <p className="text-sm text-slate-400">
                    Resolved Incidents
                </p>
                </div>

                <h2 className="mt-4 text-3xl font-bold">
                {resolved}
                </h2>
            </div>
            </section>

          {/* Search and filters */}
            <section className="rounded-xl border border-slate-800 bg-[#172638] p-5">
            <div className="mb-5">
                <h2 className="text-lg font-semibold">
                Incident History
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                Search and filter incidents from the backend
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="relative">
                <Search
                    size={18}
                    className="absolute left-3 top-3 text-slate-500"
                />

                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search incidents..."
                    className="w-full rounded-lg border border-slate-700 bg-[#0B1724] py-3 pl-10 pr-3 text-sm outline-none focus:border-teal-500"
                />
                </div>

                <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0B1724] px-3 py-3 text-sm outline-none focus:border-teal-500"
                >
                <option value="ALL">All Severities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
                </select>

                <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-[#0B1724] px-3 py-3 text-sm outline-none focus:border-teal-500"
                >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="RESOLVED">Resolved</option>
                </select>
            </div>
            </section>

          {/* Incident table */}
            <section className="overflow-hidden rounded-xl border border-slate-800 bg-[#172638]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 p-5">
                <h2 className="text-lg font-semibold">
                Detected Incidents
                </h2>

                <span className="text-sm text-slate-400">
                Showing {filteredIncidents.length} of {total}
                </span>
            </div>

            {loading && incidents.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                Loading incidents from FastAPI...
                </div>
            ) : filteredIncidents.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                No incidents match your filters.
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-[#101D2B] text-xs uppercase text-slate-400">
                    <tr>
                        <th className="px-5 py-4">Incident ID</th>
                        <th className="px-5 py-4">Incident Type</th>
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4">Severity</th>
                        <th className="px-5 py-4">Timestamp</th>
                        <th className="px-5 py-4">Status</th>
                    </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-800">
                    {filteredIncidents.map((incident) => (
                        <tr
                        key={incident.incident_id}
                        className="transition hover:bg-slate-800/40"
                        >
                        <td className="px-5 py-4 font-semibold text-teal-400">
                            #{incident.incident_id}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-200">
                            {incident.incident_type}
                        </td>

                        <td className="max-w-sm px-5 py-4 text-slate-400">
                            {incident.description}
                        </td>

                        <td className="px-5 py-4">
                            <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${severityStyle(incident.severity)}`}
                            >
                            {incident.severity}
                            </span>
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-400">
                            {formatDate(incident.timestamp)}
                        </td>

                        <td className="px-5 py-4">
                            <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(incident.status)}`}
                            >
                            {incident.status}
                            </span>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
            </section>

            <p className="text-center text-xs text-slate-500">
            IceStream Live Alerts · FastAPI monitoring
            </p>
        </div>
        </main>
    </div>
    );
}

function Metric({
    title,
    value,
    subtitle,
    icon,
    color,
}: {
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
}) {
    return (
    <div className="rounded-xl border border-slate-800 bg-[#172638] p-5 transition hover:-translate-y-1 hover:border-teal-500/40">
        <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>

        <div className={`rounded-lg bg-slate-800 p-2 ${color}`}>
            {icon}
        </div>
        </div>

        <h2 className="mt-5 text-3xl font-bold">{value}</h2>

        <p className="mt-2 text-xs text-slate-500">
        {subtitle}
        </p>
    </div>
    );
}
