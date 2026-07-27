import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchMyApplications } from "@/api/jobs";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getInitials } from "@/lib/format";
import { ArrowLeft, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_ORDER = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"] as const;

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
    APPLIED: { badge: "bg-zinc-700/40 text-zinc-300", dot: "bg-zinc-400" },
    SCREENING: { badge: "bg-blue-500/20 text-blue-400", dot: "bg-blue-400" },
    INTERVIEW: { badge: "bg-amber-500/20 text-amber-400", dot: "bg-amber-400" },
    OFFER: { badge: "bg-purple-500/20 text-purple-400", dot: "bg-purple-400" },
    HIRED: { badge: "bg-emerald-500/20 text-emerald-400", dot: "bg-emerald-400" },
    REJECTED: { badge: "bg-red-500/20 text-red-400", dot: "bg-red-400" },
};

function ApplicationSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6">
            <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-[#27272A]" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 rounded bg-[#27272A]" />
                    <div className="h-3 w-1/4 rounded bg-[#27272A]" />
                </div>
                <div className="h-6 w-20 rounded-full bg-[#27272A]" />
            </div>
        </div>
    );
}

export default function MyApplications() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const { data: applications, isLoading } = useQuery({ queryKey: ["my-applications"], queryFn: fetchMyApplications });

    const counts = useMemo(() => {
        const map: Record<string, number> = {};
        applications?.forEach((a) => { map[a.status] = (map[a.status] ?? 0) + 1; });
        return map;
    }, [applications]);

    const visible = statusFilter ? applications?.filter((a) => a.status === statusFilter) : applications;

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <button
                onClick={() => navigate('/jobs')}
                className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-[#F9FAFB]"
            >
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="mb-6 flex items-end justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">Your applications</h1>
                    <p className="mt-1 text-sm text-zinc-400">
                        {isLoading ? "Loading…" : `${applications?.length ?? 0} application${applications?.length === 1 ? "" : "s"} total`}
                    </p>
                </div>
            </div>

            {!isLoading && applications && applications.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    <button
                        onClick={() => setStatusFilter(null)}
                        className={cn(
                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                            statusFilter === null ? "border-[#4F46E5] bg-[#4F46E5]/20 text-[#8B5CF6]" : "border-[#27272A] text-zinc-400 hover:text-zinc-200"
                        )}
                    >
                        All ({applications.length})
                    </button>
                    {STATUS_ORDER.filter((s) => counts[s]).map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                statusFilter === status ? "border-[#4F46E5] bg-[#4F46E5]/20 text-[#8B5CF6]" : "border-[#27272A] text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLES[status].dot)} />
                            {status} ({counts[status]})
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => <ApplicationSkeleton key={i} />)}
                </div>
            ) : visible?.length ? (
                <div className="space-y-4">
                    {visible.map((app, i) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            <Link
                                to={`/jobs/${app.job.slug}`}
                                className="flex items-center gap-4 rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6 transition-colors hover:border-[#4F46E5]/50"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5]/30 to-[#8B5CF6]/30 text-sm font-semibold text-[#F9FAFB]">
                                    {getInitials(app.job.company.name)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium text-[#F9FAFB]">{app.job.title}</p>
                                    <p className="mt-1 text-sm text-zinc-400">
                                        {app.job.company.name} · Applied {formatRelativeTime(app.createdAt)}
                                    </p>
                                </div>
                                <Badge className={cn(STATUS_STYLES[app.status].badge, "border-0 shrink-0")}>{app.status}</Badge>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            ) : statusFilter ? (
                <p className="py-20 text-center text-zinc-400">No applications with this status.</p>
            ) : (
                <div className="flex flex-col items-center py-20 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#27272A] bg-[#111827]/60">
                        <Inbox className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400">You haven't applied to anything yet.</p>
                    <Link to="/jobs" className="mt-2 text-sm text-[#8B5CF6] hover:underline">Browse open roles →</Link>
                </div>
            )}
        </div>
    );
}