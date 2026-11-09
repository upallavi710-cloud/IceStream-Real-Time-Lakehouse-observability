
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Database,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  GitBranch,
  Server,
  Zap,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import MetricCard from "./components/MetricCard";

const API_URL = "http://127.0.0.1:8000";

interface EventMetrics {
  total_events: number;
  valid_events: number;
  invalid_events: number;
  quality_percentage: number;
}

interface AnomalyReport {
  anomaly_count: number;
  normal_count: number;
  anomaly_percentage: number;
  anomaly_breakdown: Record<string, number>;
}

interface EventAnalysis {
  metrics: EventMetrics;
  anomaly_report: AnomalyReport;
  validation_report: {
    total_records: number;
    valid_records: number;
    invalid_records: number;
    errors: string[];
  };
}

export default function Home() {
  const [analysis, setAnalysis] = useState<EventAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiOnline, setApiOnline] = useState(false);

  async function analyzeDataset() {
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
        throw new Error(`API returned status ${response.status}`);
      }

      const data: EventAnalysis = await response.json();

      setAnalysis(data);
      setApiOnline(true);
    } catch (err) {
      setApiOnline(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the backend"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    analyzeDataset();
  }, []);

  const metrics = analysis?.metrics;
  const anomalies = analysis?.anomaly_report;

  return (
    <div className="min-h-screen bg-[#0b1724] text-white">
      <Sidebar />

      <main className="ml-64 min-h-screen p-8">

        {/* Dashboard Header */}

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Pipeline Overview
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Real-Time Lakehouse Observability
            </p>
          </div>

          <button
            onClick={analyzeDataset}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-3 text-sm font-semibold hover:bg-teal-500 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            {loading ? "Analyzing..." : "Refresh Analysis"}
          </button>
        </div>

        {/* Backend Connection Status */}

        <div className="mb-7 flex items-center gap-3 rounded-xl border border-slate-800 bg-[#142334] p-4">
          <span
            className={`h-3 w-3 rounded-full ${
              apiOnline ? "bg-green-400" : "bg-red-500"
            }`}
          />

          <span className="text-sm font-medium">
            FastAPI Status:
          </span>

          <span
            className={`text-sm ${
              apiOnline ? "text-green-400" : "text-red-400"
            }`}
          >
            {apiOnline ? "Connected" : "Disconnected"}
          </span>

          <span className="ml-auto text-xs text-slate-500">
            IceStream Monitoring Engine
          </span>
        </div>

        {/* Error Message */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}

            <p className="mt-2 text-xs text-slate-400">
              Check that FastAPI is running and that CORS is configured.
            </p>
          </div>
        )}

        {/* Metric Cards */}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Total Events"
            value={metrics?.total_events?.toLocaleString() ?? "--"}
            subtitle="Events in the dataset"
            icon={<Database size={21} />}
            color="bg-blue-500/20 text-blue-400"
          />

          <MetricCard
            title="Valid Events"
            value={metrics?.valid_events?.toLocaleString() ?? "--"}
            subtitle="Successfully validated events"
            icon={<ShieldCheck size={21} />}
            color="bg-green-500/20 text-green-400"
          />

          <MetricCard
            title="Invalid Events"
            value={metrics?.invalid_events?.toLocaleString() ?? "--"}
            subtitle="Events requiring attention"
            icon={<AlertTriangle size={21} />}
            color="bg-red-500/20 text-red-400"
          />

          <MetricCard
            title="Data Quality"
            value={
              metrics
                ? `${metrics.quality_percentage}%`
                : "--"
            }
            subtitle="Overall validation score"
            icon={<Activity size={21} />}
            color="bg-teal-500/20 text-teal-400"
          />
        </div>

        {/* Pipeline Architecture */}

        <section
          id="pipeline"
          className="mb-8 rounded-xl border border-slate-800 bg-[#142334] p-6"
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                Pipeline Architecture
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Logical data processing flow
              </p>
            </div>

            <GitBranch size={24} className="text-teal-400" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {[
              "Event Ingestion",
              "Stream Processing",
              "Data Validation",
              "Iceberg Storage",
              "Analytics",
            ].map((node, index) => (
              <div
                key={node}
                className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-center"
              >
                <div className="mb-3 flex justify-center">
                  <Server size={23} className="text-teal-400" />
                </div>

                <p className="text-sm font-semibold">
                  {node}
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  {index === 2
                    ? "Validation module"
                    : "Integration stage"}
                </p>

                {index < 4 && (
                  <Zap
                    size={15}
                    className="mx-auto mt-3 text-teal-400 md:hidden"
                  />
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-slate-500">
            This represents the planned logical pipeline.
            Actual Kafka, Flink and Iceberg execution requires
            integration with the corresponding services.
          </p>
        </section>

        {/* Anomaly Monitoring */}

        <section
          id="analytics"
          className="mb-8 rounded-xl border border-slate-800 bg-[#142334] p-6"
        >
          <h2 className="text-xl font-semibold">
            Anomaly Monitoring
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Injected anomaly evaluation from the event dataset
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-lg bg-[#0b1724] p-5">
              <p className="text-sm text-slate-400">
                Total Anomalies
              </p>

              <p className="mt-3 text-3xl font-bold text-red-400">
                {anomalies?.anomaly_count ?? "--"}
              </p>
            </div>

            <div className="rounded-lg bg-[#0b1724] p-5">
              <p className="text-sm text-slate-400">
                Normal Events
              </p>

              <p className="mt-3 text-3xl font-bold text-green-400">
                {anomalies?.normal_count ?? "--"}
              </p>
            </div>

            <div className="rounded-lg bg-[#0b1724] p-5">
              <p className="text-sm text-slate-400">
                Anomaly Percentage
              </p>

              <p className="mt-3 text-3xl font-bold text-orange-400">
                {anomalies
                  ? `${anomalies.anomaly_percentage}%`
                  : "--"}
              </p>
            </div>
          </div>

          {anomalies?.anomaly_breakdown && (
            <div className="mt-6">
              <h3 className="mb-4 text-sm font-semibold text-slate-300">
                Anomaly Categories
              </h3>

              <div className="space-y-4">
                {Object.entries(anomalies.anomaly_breakdown).map(
                  ([name, count]) => (
                    <div key={name}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-slate-300">
                          {name.replaceAll("_", " ")}
                        </span>

                        <span className="text-red-400">
                          {count}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{
                            width: `${
                              anomalies.anomaly_count > 0
                                ? (count / anomalies.anomaly_count) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </section>

        {/* Data Validation Summary */}

        <section className="rounded-xl border border-slate-800 bg-[#142334] p-6">
          <h2 className="text-xl font-semibold">
            Data Validation Summary
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-[#0b1724] p-4">
              <p className="text-xs text-slate-400">
                Total Records
              </p>

              <p className="mt-2 text-2xl font-bold">
                {analysis?.validation_report.total_records ?? "--"}
              </p>
            </div>

            <div className="rounded-lg bg-[#0b1724] p-4">
              <p className="text-xs text-slate-400">
                Valid Records
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">
                {analysis?.validation_report.valid_records ?? "--"}
              </p>
            </div>

            <div className="rounded-lg bg-[#0b1724] p-4">
              <p className="text-xs text-slate-400">
                Invalid Records
              </p>

              <p className="mt-2 text-2xl font-bold text-red-400">
                {analysis?.validation_report.invalid_records ?? "--"}
              </p>
            </div>
          </div>

          {analysis?.validation_report.errors?.map((item, index) => (
            <p
              key={index}
              className="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-300"
            >
              {item}
            </p>
          ))}
        </section>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-5 text-center text-xs text-slate-500">
          IceStream | Real-Time Lakehouse Observability
        </footer>
      </main>
    </div>
  );
}
