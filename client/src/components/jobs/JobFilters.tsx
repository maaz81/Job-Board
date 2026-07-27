import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface JobFiltersState { search: string; type: string; experience: string; }
const JOB_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "REMOTE"];
const EXPERIENCE_LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"];

export function JobFilters({ value, onChange }: { value: JobFiltersState; onChange: (v: JobFiltersState) => void }) {
    return (
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] mb-8">
            <Input placeholder="Search by title or skill..." value={value.search} onChange={(e) => onChange({ ...value, search: e.target.value })} />
            <Select value={value.type || "ALL"} onValueChange={(v) => onChange({ ...value, type: (v === "ALL" || !v) ? "" : v })}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Job type" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All types</SelectItem>
                    {JOB_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={value.experience || "ALL"} onValueChange={(v) => onChange({ ...value, experience: (v === "ALL" || !v) ? "" : v })}>
                <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="Experience" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All levels</SelectItem>
                    {EXPERIENCE_LEVELS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
    );
}