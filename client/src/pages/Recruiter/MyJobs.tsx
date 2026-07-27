import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyJobs, setJobStatus } from "@/api/jobs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export default function MyJobs() {
    const queryClient = useQueryClient();
    const { data: jobs, isLoading } = useQuery({ queryKey: ["my-jobs"], queryFn: fetchMyJobs });
    const statusMutation = useMutation({
        mutationFn: ({ jobId, isActive }: { jobId: string; isActive: boolean }) => setJobStatus(jobId, isActive),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-jobs"] }),
    });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-[#F9FAFB]">Your job posts</h1>
                <Button asChild><Link to="/recruiter/post-job">Post a job</Link></Button>
            </div>
            {jobs?.length ? (
                <div className="space-y-4">
                    {jobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6">
                            <div>
                                <Link to={`/jobs/${job.slug}`} className="font-medium text-[#F9FAFB] hover:underline">{job.title}</Link>
                                <p className="mt-1 text-sm text-zinc-400">{job._count?.applications ?? 0} applicant{job._count?.applications === 1 ? "" : "s"} · {job.views} views</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={job.isActive ? "bg-emerald-500/20 text-emerald-400 border-0" : "bg-zinc-700/40 text-zinc-400 border-0"}>{job.isActive ? "Active" : "Closed"}</Badge>
                                <Button variant="outline" size="sm" onClick={() => statusMutation.mutate({ jobId: job.id, isActive: !job.isActive })}>{job.isActive ? "Close" : "Reopen"}</Button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : <p className="py-20 text-center text-zinc-400">You haven't posted any jobs yet.</p>}
        </div>
    );
}