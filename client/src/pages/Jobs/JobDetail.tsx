import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchJobBySlug, applyToJob, fetchMyApplications } from "@/api/jobs";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatSalary } from "@/lib/format";
import { Loader2, MapPin, Briefcase, CheckCircle2 } from "lucide-react";
import { ResumeMatchScore } from "@/components/jobs/ResumeMatchScore";

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplyForm, setShowApplyForm] = useState(false);

  const { data: job, isLoading } = useQuery({ queryKey: ["job", slug], queryFn: () => fetchJobBySlug(slug!), enabled: !!slug });
  const { data: myApplications } = useQuery({ queryKey: ["my-applications"], queryFn: fetchMyApplications, enabled: user?.role === "CANDIDATE" });
  const alreadyApplied = myApplications?.some((a) => a.job.id === job?.id);

  const applyMutation = useMutation({
    mutationFn: () => applyToJob(job!.id, coverLetter || undefined),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["my-applications"] }); setShowApplyForm(false); },
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;
  if (!job) return <p className="py-20 text-center text-zinc-400">Job not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8">
        <h1 className="text-2xl font-semibold text-[#F9FAFB]">{job.title}</h1>
        <p className="mt-1 text-zinc-400">{job.company.name}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.isRemote ? "Remote" : job.location}</span>
          <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> {job.type.replace("_", " ")}</span>
          <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {job.skills.map((s) => <Badge key={s} variant="outline" className="border-[#27272A] text-zinc-300">{s}</Badge>)}
        </div>

        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">About the role</h2>
          <p className="whitespace-pre-line text-zinc-300">{job.description}</p>
        </section>
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Responsibilities</h2>
          <ul className="list-disc space-y-1 pl-5 text-zinc-300">{job.responsibilities.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </section>
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Requirements</h2>
          <ul className="list-disc space-y-1 pl-5 text-zinc-300">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </section>

        {user?.role === "CANDIDATE" && (
          <div className="mt-8">
            <ResumeMatchScore jobId={job.id} />
          </div>
        )}

        {user?.role === "CANDIDATE" && (
          <div className="mt-8 border-t border-[#27272A] pt-6">
            {alreadyApplied ? (
              <p className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 className="h-4 w-4" /> You've already applied to this job</p>
            ) : showApplyForm ? (
              <div className="space-y-3">
                <Textarea placeholder="Add a short note to the recruiter (optional)" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} />
                <div className="flex gap-3">
                  <Button onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
                    {applyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit application"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowApplyForm(false)}>Cancel</Button>
                </div>
                {applyMutation.isError && <p className="text-sm text-red-400">Something went wrong — try again.</p>}
              </div>
            ) : (
              <Button onClick={() => setShowApplyForm(true)}>Apply now</Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}