import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchMyApplications } from "@/api/jobs";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
    APPLIED: "bg-zinc-700/40 text-zinc-300", SCREENING: "bg-blue-500/20 text-blue-400",
    INTERVIEW: "bg-amber-500/20 text-amber-400", OFFER: "bg-purple-500/20 text-purple-400",
    HIRED: "bg-emerald-500/20 text-emerald-400", REJECTED: "bg-red-500/20 text-red-400",
};

export default function MyApplications() {
    const { data: applications, isLoading } = useQuery({ queryKey: ["my-applications"], queryFn: fetchMyApplications });
    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="mb-6 text-2xl font-semibold text-[#F9FAFB]">Your applications</h1>
            {applications?.length ? (
                <div className="space-y-4">
                    {applications.map((app) => (
                        <Link key={app.id} to={`/jobs/${app.job.slug}`} className="flex items-center justify-between rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6 hover:border-[#4F46E5]/50">
                            <div>
                                <p className="font-medium text-[#F9FAFB]">{app.job.title}</p>
                                <p className="mt-1 text-sm text-zinc-400">{app.job.company.name}</p>
                            </div>
                            <Badge className={`${STATUS_STYLES[app.status]} border-0`}>{app.status}</Badge>
                        </Link>
                    ))}
                </div>
            ) : <p className="py-20 text-center text-zinc-400">You haven't applied to anything yet — <Link to="/jobs" className="text-[#8B5CF6] hover:underline">browse open roles</Link>.</p>}
        </div>
    );
}