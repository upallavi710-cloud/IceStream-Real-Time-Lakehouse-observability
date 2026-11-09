
"use client";

import { useEffect, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    AreaChart,
    Area,
} from "recharts";

import {
    RefreshCw,
    Activity,
    AlertTriangle,
    ShieldCheck,
    Database,
    ArrowLeft,
} from "lucide-react";

import Link from "next/link";
import Sidebar from "../components/Sidebar";

const API_URL = "http://127.0.0.1:8000";

interface Analysis {
    metrics: {
    total_events: number;
    valid_events: number;
    invalid_events: number;
    quality_percentage: number;
    };

    anomaly_report: {
    anomaly_count: number;
    normal_count: number;
    anomaly_percentage: number;
    anomaly_breakdown: Record<string, number>;
    };

    validation_report: {
    total_records: number;
    valid_records: number;
    invalid_records: number;
    };
}

const COLORS = [
    "#14b8a6",
    "#f97316",
    "#ef4444",
    "#8b5cf6",
    "#3b82f6",
    "#eab308",
    "#ec4899",
];

export default function AnalyticsPage() {
    const [analysis, setAnalysis] = useState<Analysis | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
        const response = await fetch(
        `${API_URL}/monitoring/events/analyze`,
        {
            method: "POST",
            cache: "no-store",
        }
        );

        if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
        }

        const data: Analysis = await response.json();
        setAnalysis(data);
    } catch (err) {
        setError(
        err instanceof Error
            ? err.message
            : "Unable to load analytics"
    );
    } finally {
        setLoading(false);
    }
    }

    useEffect(() => {
    loadAnalytics();
    }, []);

    const metrics = analysis?.metrics;
    const anomalies = analysis?.anomaly_report;

    const eventComparison = metrics
    ? [
        { name: "Valid Events", value: metrics.valid_events },
        { name: "Invalid Events", value: metrics.invalid_events },
        ]
    : [];

    const pieData = eventComparison;

    const anomalyData = anomalies
    ? Object.entries(anomalies.anomaly_breakdown).map(
        ([name, count]) => ({
            name: name.replaceAll("_", " "),
            count,
        })
        )
    : [];

    const qualityData = metrics
    ? [
        { name: "Valid", value: metrics.valid_events },
        { name: "Invalid", value: metrics.invalid_events },
        ]
    : [];

    return (
    <div className="min-h-screen bg-[#0b1724] text-white">

        <Sidebar />

        <main className="ml-64 min-h-screen p-8">

        {/* Header */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

            <div>
            <Link
                href="/"
                className="mb-3 inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
            >
                <ArrowLeft size={16} />
                Back to Overview
            </Link>

            <h1 className="text-3xl font-bold">
                Analytics Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-400">
                Data quality, event distribution and anomaly insights
            </p>
            </div>

            <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold hover:bg-teal-500 disabled:opacity-50"
            >
            <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
            />
            {loading ? "Loading..." : "Refresh Analytics"}
            </button>

        </div>

        {/* Loading */}

        {loading && (
            <div className="mb-6 rounded-xl border border-slate-800 bg-[#142334] p-5 text-sm text-slate-300">
            Loading analytics from FastAPI...
            </div>
        )}

        {/* Error */}

        {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
            <p className="mt-2 text-xs text-slate-400">
                Check that your FastAPI server is running.
            </p>
            </div>
        )}

        {/* KPI Cards */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Total Events</p>
                <Database className="text-blue-400" />
            </div>

            <h2 className="mt-5 text-3xl font-bold">
                {metrics?.total_events?.toLocaleString() ?? "--"}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
                Total dataset records
            </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Valid Events</p>
                <ShieldCheck className="text-green-400" />
            </div>

            <h2 className="mt-5 text-3xl font-bold text-green-400">
                {metrics?.valid_events?.toLocaleString() ?? "--"}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
                Successfully validated
            </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Invalid Events</p>
                <AlertTriangle className="text-red-400" />
            </div>

            <h2 className="mt-5 text-3xl font-bold text-red-400">
                {metrics?.invalid_events?.toLocaleString() ?? "--"}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
                Events requiring attention
            </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">Quality Score</p>
                <Activity className="text-teal-400" />
            </div>

            <h2 className="mt-5 text-3xl font-bold text-teal-400">
                {metrics ? `${metrics.quality_percentage}%` : "--"}
            </h2>

            <p className="mt-2 text-xs text-slate-400">
                Overall data quality
            </p>
            </div>

        </div>

        {/* Charts Row 1 */}

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Event Comparison */}

            <section className="rounded-xl border border-slate-800 bg-[#142334] p-6">

            <h2 className="text-lg font-semibold">
                Valid vs Invalid Events
            </h2>

            <p className="mt-1 text-sm text-slate-400">
                Comparison of event validation results
            </p>

            <div className="mt-5 h-[320px]">

                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={65}
                    paddingAngle={4}
                    label
                    >
                    <Cell fill="#14b8a6" />
                    <Cell fill="#ef4444" />
                    </Pie>

                    <Tooltip
                    contentStyle={{
                        backgroundColor: "#142334",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        color: "#fff",
                }}
                    />

                    <Legend />
                </PieChart>
                </ResponsiveContainer>

            </div>
            </section>

          {/* Anomaly Categories */}

            <section className="rounded-xl border border-slate-800 bg-[#142334] p-6">

            <h2 className="text-lg font-semibold">
                Anomaly Categories
            </h2>

            <p className="mt-1 text-sm text-slate-400">
                Distribution of injected anomaly types
            </p>

            <div className="mt-5 h-[320px]">

                <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={anomalyData}
                    margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 50,
                    }}
                >
                    <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    />

                    <XAxis
                    dataKey="name"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    />

                    <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />

                    <Tooltip
                    contentStyle={{
                        backgroundColor: "#142334",
                        border: "1px solid #334155",
                        borderRadius: 8,
                    }}
                    />

                    <Bar
                    dataKey="count"
                    fill="#14b8a6"
                    radius={[5, 5, 0, 0]}
                    />
                </BarChart>
                </ResponsiveContainer>

            </div>
            </section>

        </div>

        {/* Charts Row 2 */}

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* Quality Distribution */}

            <section className="rounded-xl border border-slate-800 bg-[#142334] p-6">

            <h2 className="text-lg font-semibold">
                Data Quality Distribution
            </h2>

            <p className="mt-1 text-sm text-slate-400">
                Number of valid and invalid records
        </p>

            <div className="mt-5 h-[280px]">

                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={qualityData}>

                    <defs>
                    <linearGradient
                        id="qualityGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                        offset="5%"
                        stopColor="#14b8a6"
                        stopOpacity={0.5}
                        />

                        <stop
                        offset="95%"
                        stopColor="#14b8a6"
                        stopOpacity={0}
                        />
                    </linearGradient>
                    </defs>

                    <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    />

                    <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8" }}
                    />

                    <YAxis
                    tick={{ fill: "#94a3b8" }}
                    />

                    <Tooltip />

                    <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#14b8a6"
                    fill="url(#qualityGradient)"
                    strokeWidth={3}
                    />

                </AreaChart>
                </ResponsiveContainer>

            </div>
            </section>

          {/* Anomaly Summary */}

            <section className="rounded-xl border border-slate-800 bg-[#142334] p-6">

            <h2 className="text-lg font-semibold">
                Anomaly Summary
            </h2>

            <p className="mt-1 text-sm text-slate-400">
                Event anomaly evaluation results
            </p>

            <div className="mt-6 space-y-6">

                <div>
                <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">
                    Normal Events
                    </span>

                    <span className="font-semibold text-green-400">
                    {anomalies?.normal_count ?? "--"}
                    </span>
                </div>

                <div className="h-3 rounded-full bg-slate-700">
                    <div
                    className="h-3 rounded-full bg-green-500"
                    style={{
                        width: `${
                        anomalies && anomalies.normal_count + anomalies.anomaly_count > 0
                            ? (anomalies.normal_count /
                              (anomalies.normal_count + anomalies.anomaly_count)) * 100
                            : 0
                        }%`,
                    }}
                    />
                </div>
                </div>

                <div>
                <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-400">
                    Anomalous Events
                    </span>

                    <span className="font-semibold text-red-400">
                    {anomalies?.anomaly_count ?? "--"}
                    </span>
                </div>

                <div className="h-3 rounded-full bg-slate-700">
                    <div
                    className="h-3 rounded-full bg-red-500"
                    style={{
                        width: `${
                        anomalies?.anomaly_percentage ?? 0
                        }%`,
                    }}
                    />
                </div>
                </div>

                <div className="rounded-lg bg-[#0b1724] p-5">

                <p className="text-sm text-slate-400">
                    Overall anomaly percentage
                </p>

                <p className="mt-2 text-3xl font-bold text-orange-400">
                    {anomalies
                    ? `${anomalies.anomaly_percentage}%`
                    : "--"}
                </p>

                </div>

            </div>
            </section>

        </div>

        {/* Footer */}

        <footer className="border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
            IceStream Analytics | Powered by FastAPI and Recharts
        </footer>

        </main>
    </div>
    );
}
