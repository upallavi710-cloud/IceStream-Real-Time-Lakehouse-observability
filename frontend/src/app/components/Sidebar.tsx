
import Link from "next/link";
import {
    LayoutDashboard,
    GitBranch,
    ChartNoAxesCombined,
    Bell,
    ClipboardList,
    Database,
    Clock,
    Waves,
    Settings,
} from "lucide-react";

const menuItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Pipeline Lineage", href: "/pipeline", icon: GitBranch },
    { name: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
    { name: "Live Alerts", href: "/alerts", icon: Bell },
    { name: "Incidents", href: "/incidents", icon: ClipboardList },
    { name: "Data Explorer", href: "/explorer", icon: Database },
    { name: "Time Travel", href: "/timetravel", icon: Clock },
];

export default function Sidebar() {
    return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#101D2B] text-white">

      {/* Logo */}

        <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="rounded-lg bg-teal-500 p-2">
            <Waves size={25} />
        </div>

        <div>
            <h1 className="text-xl font-bold tracking-wide">
            IceStream
            </h1>

            <p className="text-xs text-slate-400">
            Lakehouse Observability
            </p>
        </div>
        </div>

      {/* Navigation */}

        <div className="px-4 py-6">
        <p className="mb-4 px-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
            Main Menu
        </p>

        <nav className="space-y-2">
            {menuItems.map((item) => {
            const Icon = item.icon;

            return (
                <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
                >
                <Icon size={19} />
                {item.name}
                </Link>
            );
            })}
        </nav>
        </div>

      {/* Footer */}

        <div className="mt-auto border-t border-slate-800 p-5">
        <div className="flex items-center gap-3 text-sm text-slate-400">
            <Settings size={19} />
            Settings
        </div>

        <p className="mt-5 text-xs text-slate-500">
            IceStream v1.0.0
        </p>
        </div>

    </aside>
    );
}
