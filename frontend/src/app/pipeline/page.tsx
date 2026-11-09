
"use client";

import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    BackgroundVariant,
    Position,
    Handle,
    type Node,
    type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import {
    Database,
    Activity,
    ShieldCheck,
    AlertTriangle,
    BarChart3,
    Server,
    ArrowLeft,
} from "lucide-react";

import Link from "next/link";

const pipelineNodes: Node[] = [
    {
    id: "source",
    position: { x: 50, y: 180 },
    data: {
        label: "Event Source",
        description: "Mock event dataset",
        status: "Available",
        type: "source",
    },
    type: "default",
    style: {
        background: "#123b4b",
        color: "#ffffff",
        border: "1px solid #14b8a6",
        borderRadius: 12,
        padding: 15,
        width: 190,
    },
    },
    {
    id: "ingestion",
    position: { x: 330, y: 180 },
    data: {
        label: "Event Ingestion",
        description: "Event collection",
        status: "Dataset-backed",
        type: "ingestion",
    },
    type: "default",
    style: {
        background: "#123b4b",
        color: "#ffffff",
        border: "1px solid #14b8a6",
        borderRadius: 12,
        padding: 15,
        width: 190,
    },
    },
    {
    id: "processing",
    position: { x: 610, y: 180 },
    data: {
        label: "Stream Processing",
        description: "Kafka / Flink integration",
        status: "Not connected",
        type: "processing",
    },
    type: "default",
    style: {
        background: "#292b3d",
        color: "#ffffff",
        border: "1px solid #64748b",
        borderRadius: 12,
        padding: 15,
        width: 190,
    },
    },
    {
    id: "validation",
    position: { x: 890, y: 180 },
    data: {
        label: "Data Validation",
        description: "Python validation engine",
        status: "Operational",
        type: "validation",
    },
    type: "default",
    style: {
        background: "#123b4b",
        color: "#ffffff",
        border: "1px solid #14b8a6",
        borderRadius: 12,
        padding: 15,
        width: 190,
    },
    },
    {
    id: "storage",
    position: { x: 1170, y: 180 },
    data: {
        label: "Iceberg Storage",
        description: "Apache Iceberg integration",
        status: "Not connected",
        type: "storage",
    },
    type: "default",
    style: {
        background: "#292b3d",
        color: "#ffffff",
        border: "1px solid #64748b",
        borderRadius: 12,
        padding: 15,
        width: 190,
    },
    },
    {
    id: "analytics",
    position: { x: 1450, y: 180 },
    data: {
        label: "Analytics",
        description: "Quality and anomaly metrics",
        status: "Operational",
        type: "analytics",
    },
    type: "default",
    style: {
        background: "#123b4b",
        color: "#ffffff",
        border: "1px solid #14b8a6",
        borderRadius: 12,
        padding: 15,
        width: 190,
    },
    },
];

const pipelineEdges: Edge[] = [
    {
    id: "e1",
    source: "source",
    target: "ingestion",
    animated: true,
    label: "Events",
    style: { stroke: "#14b8a6", strokeWidth: 2 },
    labelStyle: { fill: "#cbd5e1", fontSize: 12 },
    },
    {
    id: "e2",
    source: "ingestion",
    target: "processing",
    label: "Stream",
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#cbd5e1", fontSize: 12 },
    },
    {
    id: "e3",
    source: "processing",
    target: "validation",
    label: "Processed data",
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#cbd5e1", fontSize: 12 },
    },
    {
    id: "e4",
    source: "validation",
    target: "storage",
    label: "Validated data",
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#cbd5e1", fontSize: 12 },
    },
    {
    id: "e5",
    source: "storage",
    target: "analytics",
    label: "Lakehouse data",
    style: { stroke: "#64748b", strokeWidth: 2 },
    labelStyle: { fill: "#cbd5e1", fontSize: 12 },
    },
];

const nodeTypes = [
    { icon: Database, color: "#2dd4bf", label: "Event Source" },
    { icon: Server, color: "#2dd4bf", label: "Event Ingestion" },
    { icon: Activity, color: "#a78bfa", label: "Stream Processing" },
    { icon: ShieldCheck, color: "#2dd4bf", label: "Data Validation" },
    { icon: Database, color: "#a78bfa", label: "Iceberg Storage" },
    { icon: BarChart3, color: "#2dd4bf", label: "Analytics" },
];

function PipelineFlow() {
    return (
    <div className="h-[570px] w-full overflow-hidden rounded-xl border border-slate-700 bg-[#0b1724]">
        <ReactFlow
        nodes={pipelineNodes}
        edges={pipelineEdges}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        >
        <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="#334155"
        />
        <Controls />
        <MiniMap
            nodeColor="#14b8a6"
            maskColor="rgba(15, 23, 42, 0.7)"
        />
        </ReactFlow>
    </div>
    );
}

export default function PipelinePage() {
    return (
    <main className="min-h-screen bg-[#0b1724] p-8 text-white">

        <div className="mb-7 flex items-center justify-between">
        <div>
            <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300"
            >
            <ArrowLeft size={16} />
            Back to Overview
            </Link>

            <h1 className="text-3xl font-bold">
            Pipeline Lineage
            </h1>

            <p className="mt-2 text-sm text-slate-400">
            Interactive visualization of the IceStream data pipeline
            </p>
        </div>

        <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 px-4 py-3 text-sm text-teal-300">
            Pipeline Architecture
        </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <p className="text-sm text-slate-400">Operational Components</p>
            <h2 className="mt-2 text-3xl font-bold text-teal-400">3</h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <p className="text-sm text-slate-400">Pending Integrations</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-400">3</h2>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#142334] p-5">
            <p className="text-sm text-slate-400">Pipeline Stages</p>
            <h2 className="mt-2 text-3xl font-bold text-white">6</h2>
        </div>

        </div>

        <section className="rounded-xl border border-slate-800 bg-[#142334] p-6">

        <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
            Data Flow Architecture
            </h2>

            <span className="text-xs text-slate-400">
            Drag nodes • Zoom • Explore
            </span>
        </div>

        <PipelineFlow />

        <div className="mt-6 flex flex-wrap gap-5 text-xs text-slate-400">

            <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-teal-400" />
            Operational / available
            </span>

            <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-slate-500" />
            Not connected
            </span>

        </div>
        </section>

        <section className="mt-6 rounded-xl border border-slate-800 bg-[#142334] p-6">

        <h2 className="mb-5 text-lg font-semibold">
            Pipeline Component Details
        </h2>

        <div className="space-y-4">

            {nodeTypes.map((item) => (
            <div
                key={item.label}
                className="flex items-center gap-4 rounded-lg bg-[#0b1724] p-4"
            >
                <item.icon
                size={22}
                color={item.color}
                />

                <span className="text-sm font-medium">
                {item.label}
                </span>

                <span className="ml-auto text-xs text-slate-500">
                {item.label === "Data Validation" ||
                item.label === "Analytics" ||
                item.label === "Event Source" ||
                item.label === "Event Ingestion"
                    ? "Available"
                    : "Integration pending"}
                </span>
            </div>
            ))}

        </div>
        </section>

    </main>
    );
}
