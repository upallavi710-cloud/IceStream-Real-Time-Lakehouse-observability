
"use client";

import {
    X,
    AlertTriangle,
    Clock,
    Hash,
    FileText,
    Activity,
    CheckCircle2,
} from "lucide-react";

interface Incident {
    incident_id: number;
    incident_type: string;
    severity: string;
    description: string;
    timestamp: string;
    status: string;
}

interface Props {
    incident: Incident | null;
    onClose: () => void;
}

export default function IncidentDetailsModal({
    incident,
    onClose,
}: Props) {
    if (!incident) return null;

    const isResolved =
        incident.status.toUpperCase() === "RESOLVED";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

            <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#172638] shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-700 p-5">

                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Incident Details
                        </h2>

                        <p className="mt-1 text-sm text-slate-400">
                            Incident #{incident.incident_id}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                        aria-label="Close incident details"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="space-y-5 p-6">

                    <div>
                        <p className="mb-2 text-xs uppercase text-slate-400">
                            Incident Type
                        </p>

                        <div className="flex items-center gap-2 text-white">
                            <AlertTriangle
                                size={19}
                                className="text-amber-400"
                            />
                            <span className="font-semibold">
                                {incident.incident_type}
                            </span>
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs uppercase text-slate-400">
                            Description
                        </p>

                        <div className="flex gap-2 text-sm leading-6 text-slate-300">
                            <FileText
                                size={18}
                                className="mt-1 shrink-0 text-teal-400"
                            />
                            {incident.description}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">

                        <div className="rounded-xl bg-[#0B1724] p-4">
                            <p className="mb-2 text-xs text-slate-400">
                                Incident ID
                            </p>

                            <div className="flex items-center gap-2 font-semibold text-teal-400">
                                <Hash size={17} />
                                {incident.incident_id}
                            </div>
                        </div>

                        <div className="rounded-xl bg-[#0B1724] p-4">
                            <p className="mb-2 text-xs text-slate-400">
                                Severity
                            </p>

                            <div className="flex items-center gap-2 font-semibold text-red-400">
                                <AlertTriangle size={17} />
                                {incident.severity}
                            </div>
                        </div>

                    </div>

                    <div>
                        <p className="mb-2 text-xs uppercase text-slate-400">
                            Timestamp
                        </p>

                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <Clock size={18} className="text-teal-400" />
                            {new Date(incident.timestamp).toLocaleString()}
                        </div>
                    </div>

                    <div>
                        <p className="mb-2 text-xs uppercase text-slate-400">
                            Current Status
                        </p>

                        <div className={`flex items-center gap-2 rounded-lg p-3 text-sm font-semibold ${
                            isResolved
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-red-500/10 text-red-400"
                        }`}>
                            {isResolved
                                ? <CheckCircle2 size={19} />
                                : <Activity size={19} />
                            }

                            {incident.status}
                        </div>
                    </div>

                </div>

                <div className="border-t border-slate-700 p-5">
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-teal-500 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}
