import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { fetchJobApplicants, updateApplicationStatus } from "@/api/jobs";

import { Badge } from "@/components/ui/badge";
import { formatRelativeTime, getInitials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Sparkles, Globe, Link2, Loader2, Inbox, ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "@/types";

const STATUS_OPTIONS: ApplicationStatus[] = ["APPLIED", "SCREENING", "INTERVIEW", "OFFER", "HIRED", "REJECTED"];
const STATUS_STYLES: Record<string, string> = {
    APPLIED: "bg-zinc-700/40 text-zinc-300", SCREENING: "bg-blue-500/20 text-blue-400",
    INTERVIEW: "bg-amber-500/20 text-amber-400", OFFER: "bg-purple-500/20 text-purple-400",
    HIRED: "bg-emerald-500/20 text-emerald-400", REJECTED: "bg-red-500/20 text-red-400",
};

function StatusDropdown({ jobId, applicationId, status }: { jobId: string; applicationId: string; status: ApplicationStatus }) {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: (newStatus: ApplicationStatus) => updateApplicationStatus(jobId, applicationId, newStatus),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["job-applicants", jobId] }); setOpen(false); },
    });

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className={cn("flex items-center gap-1.5 rounded-full border-0 px-3 py-1 text-xs font-medium", STATUS_STYLES[status])}
            >
                {mutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : status}
                <ChevronDown className="h-3 w-3" />
            </button>
            {open && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-xl border border-[#27272A] bg-[#111827] p-1 shadow-xl">
                    {STATUS_OPTIONS.map((s) => (
                        <button
                            key={s}
                            onClick={() => mutation.mutate(s)}
                            className={cn("block w-full rounded-lg px-3 py-1.5 text-left text-xs hover:bg-white/5", s === status ? "text-[#8B5CF6]" : "text-zinc-300")}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function JobApplicants() {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const { data: applicants, isLoading } = useQuery({
        queryKey: ["job-applicants", jobId],
        queryFn: () => fetchJobApplicants(jobId!),
        enabled: !!jobId,
    });

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-[#F9FAFB]">
                <ArrowLeft className="h-4 w-4" /> Back
            </button>

            <h1 className="mb-1 text-2xl font-semibold text-[#F9FAFB]">Applicants</h1>
            <p className="mb-8 text-sm text-zinc-400">
                {isLoading ? "Loading…" : `${applicants?.length ?? 0} candidate${applicants?.length === 1 ? "" : "s"} applied`}
            </p>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
            ) : applicants?.length ? (
                <div className="space-y-4">
                    {applicants.map((app, i) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                            className="rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4F46E5]/30 to-[#8B5CF6]/30 text-sm font-semibold text-[#F9FAFB]">
                                        {getInitials(app.user.name)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#F9FAFB]">{app.user.name}</p>
                                        <p className="text-sm text-zinc-400">{app.user.email}</p>
                                        {app.user.profile?.headline && <p className="mt-0.5 text-sm text-zinc-500">{app.user.profile.headline}</p>}
                                    </div>
                                </div>
                                <StatusDropdown jobId={jobId!} applicationId={app.id} status={app.status} />
                            </div>

                            {app.user.profile?.skills && app.user.profile.skills.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {app.user.profile.skills.map((s) => <Badge key={s} variant="outline" className="border-[#27272A] text-zinc-300">{s}</Badge>)}
                                </div>
                            )}

                            {app.coverLetter && (
                                <p className="mt-4 rounded-lg bg-black/20 p-3 text-sm text-zinc-300">{app.coverLetter}</p>
                            )}

                            {app.aiScore !== null && (
                                <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#27272A] bg-black/20 p-3">
                                    <Sparkles className="h-4 w-4 shrink-0 text-[#8B5CF6]" />
                                    <span className="text-sm font-medium text-[#8B5CF6]">{app.aiScore}/100 match</span>
                                    {app.aiFeedback && <span className="text-sm text-zinc-400">— {app.aiFeedback}</span>}
                                </div>
                            )}

                            <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                                <span>Applied {formatRelativeTime(app.createdAt)}</span>
                                {app.user.profile?.website && <a href={app.user.profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-zinc-300"><Globe className="h-3.5 w-3.5" /> Portfolio</a>}
                                {app.user.profile?.linkedin && (
                                    <a href={app.user.profile.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-zinc-300">
                                        <Link2 className="h-3.5 w-3.5" /> LinkedIn
                                    </a>
                                )}
                                {app.user.profile?.github && (
                                    <a href={app.user.profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-zinc-300">
                                        <Link2 className="h-3.5 w-3.5" /> GitHub
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center py-20 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#27272A] bg-[#111827]/60">
                        <Inbox className="h-6 w-6 text-zinc-500" />
                    </div>
                    <p className="text-zinc-400">No applicants yet.</p>
                </div>
            )}
        </div>
    );
}