import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchMyJobs, setJobStatus } from "@/api/jobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Briefcase, Users, Eye } from "lucide-react";

function JobSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6">
            <div className="h-4 w-1/3 rounded bg-[#27272A]" />
            <div className="mt-2 h-3 w-1/4 rounded bg-[#27272A]" />
        </div>
    );
}

export default function MyJobs() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "CLOSED">("ALL");
    const { data: jobs, isLoading } = useQuery({ queryKey: ["my-jobs"], queryFn: fetchMyJobs });

    const statusMutation = useMutation({
        mutationFn: ({ jobId, isActive }: { jobId: string; isActive: boolean }) => setJobStatus(jobId, isActive),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-jobs"] }),
    });

    const stats = useMemo(() => ({
        active: jobs?.filter((j) => j.isActive).length ?? 0,
        applicants: jobs?.reduce((sum, j) => sum + (j._count?.applications ?? 0), 0) ?? 0,
        views: jobs?.reduce((sum, j) => sum + j.views, 0) ?? 0,
    }), [jobs]);

    const visible = jobs?.filter((j) => filter === "ALL" || (filter === "ACTIVE" ? j.isActive : !j.isActive));

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-[#F9FAFB]">
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-[#F9FAFB]">Your job posts</h1>
                <Button onClick={() => navigate("/recruiter/post-job")}>
                    <Plus className="mr-1 h-4 w-4" /> Post a job
                </Button>
            </div>

            {!isLoading && jobs && jobs.length > 0 && (
                <div className="mb-8 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-[#27272A] bg-[#111827]/60 p-4">
                        <div className="flex items-center gap-2 text-zinc-500"><Briefcase className="h-4 w-4" /><span className="text-xs">Active</span></div>
                        <p className="mt-1 text-xl font-semibold text-[#F9FAFB]">{stats.active}</p>
                    </div>
                    <div className="rounded-xl border border-[#27272A] bg-[#111827]/60 p-4">
                        <div className="flex items-center gap-2 text-zinc-500"><Users className="h-4 w-4" /><span className="text-xs">Applicants</span></div>
                        <p className="mt-1 text-xl font-semibold text-[#F9FAFB]">{stats.applicants}</p>
                    </div>
                    <div className="rounded-xl border border-[#27272A] bg-[#111827]/60 p-4">
                        <div className="flex items-center gap-2 text-zinc-500"><Eye className="h-4 w-4" /><span className="text-xs">Views</span></div>
                        <p className="mt-1 text-xl font-semibold text-[#F9FAFB]">{stats.views}</p>
                    </div>
                </div>
            )}

            {!isLoading && jobs && jobs.length > 0 && (
                <div className="mb-6 flex gap-2">
                    {(["ALL", "ACTIVE", "CLOSED"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                filter === f ? "border-[#4F46E5] bg-[#4F46E5]/20 text-[#8B5CF6]" : "border-[#27272A] text-zinc-400 hover:text-zinc-200"
                            )}
                        >
                            {f === "ALL" ? "All" : f === "ACTIVE" ? "Active" : "Closed"}
                        </button>
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <JobSkeleton key={i} />)}</div>
            ) : visible?.length ? (
                <div className="space-y-4">
                    {visible.map((job, i) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="flex items-center justify-between rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6"
                        >
                            <div className="min-w-0">
                                <Link to={`/jobs/${job.slug}`} className="font-medium text-[#F9FAFB] hover:underline">{job.title}</Link>
                                <Link to={`/recruiter/jobs/${job.id}/applicants`} className="mt-1 block text-sm text-zinc-400 hover:text-[#8B5CF6] hover:underline">
                                    {job._count?.applications ?? 0} applicant{job._count?.applications === 1 ? "" : "s"} · {job.views} views · Posted {formatRelativeTime(job.createdAt)}
                                </Link>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <Badge className={job.isActive ? "bg-emerald-500/20 text-emerald-400 border-0" : "bg-zinc-700/40 text-zinc-400 border-0"}>
                                    {job.isActive ? "Active" : "Closed"}
                                </Badge>
                                <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ jobId: job.id, isActive: !job.isActive })}>
                                    {job.isActive ? "Close" : "Reopen"}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : filter !== "ALL" ? (
                <p className="py-20 text-center text-zinc-400">No {filter.toLowerCase()} jobs.</p>
            ) : (
                <div className="flex flex-col items-center py-20 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#27272A] bg-[#111827]/60">
                        <Briefcase className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400">You haven't posted any jobs yet.</p>
                    <Link to="/recruiter/post-job" className="mt-2 text-sm text-[#8B5CF6] hover:underline">Post your first job →</Link>
                </div>
            )}
        </div>
    );
}