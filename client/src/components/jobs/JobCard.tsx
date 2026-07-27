import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase } from "lucide-react";
import type { Job } from "@/types";
import { formatSalary } from "@/lib/format";

export function JobCard({ job }: { job: Job }) {
    return (
        <Link to={`/jobs/${job.slug}`} className="block rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur p-6 transition-colors hover:border-[#4F46E5]/50">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="text-lg font-semibold text-[#F9FAFB]">{job.title}</h3>
                    <p className="mt-1 text-sm text-zinc-400">{job.company.name}</p>
                </div>
                {job.isFeatured && <Badge className="bg-[#4F46E5]/20 text-[#8B5CF6] border-0">Featured</Badge>}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.isRemote ? "Remote" : job.location}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type.replace("_", " ")}</span>
                <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.slice(0, 4).map((s) => <Badge key={s} variant="outline" className="border-[#27272A] text-zinc-300">{s}</Badge>)}
            </div>
        </Link>
    );
}