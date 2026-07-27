import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJobs } from "@/api/jobs";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFilters } from "@/components/jobs/JobFilters";
import type { JobFiltersState } from "@/components/jobs/JobFilters";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Jobs() {
  const [filters, setFilters] = useState<JobFiltersState>({ search: "", type: "", experience: "" });
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", filters, page],
    queryFn: () => fetchJobs({ ...filters, page, limit: 10 }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-[#F9FAFB]">Find your next role</h1>
      <JobFilters value={filters} onChange={(v) => { setFilters(v); setPage(1); }} />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
      ) : data?.jobs.length ? (
        <div className="space-y-4">{data.jobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
      ) : (
        <p className="py-20 text-center text-zinc-400">No jobs match your filters yet — try widening your search.</p>
      )}

      {data && data.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-zinc-400">Page {data.page} of {data.totalPages}</span>
          <Button variant="outline" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}