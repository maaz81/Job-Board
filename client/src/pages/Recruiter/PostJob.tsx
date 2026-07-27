import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Building2 } from "lucide-react";
import { fetchMyCompany, createCompany, createJob } from "@/api/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const companySchema = z.object({
    name: z.string().trim().min(2, "Company name is required"),
    industry: z.string().trim().optional(),
    location: z.string().trim().optional(),
    website: z.string().trim().url("Enter a valid URL").optional().or(z.literal("")),
});
type CompanyForm = z.infer<typeof companySchema>;

function CompanySetupForm({ onDone }: { onDone: () => void }) {
    const { register, handleSubmit, formState: { errors } } = useForm<CompanyForm>({ resolver: zodResolver(companySchema) });
    const mutation = useMutation({ mutationFn: createCompany, onSuccess: onDone });

    return (
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5 rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4F46E5]/20">
                    <Building2 className="h-5 w-5 text-[#8B5CF6]" />
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-[#F9FAFB]">Set up your company profile</h2>
                    <p className="mt-0.5 text-sm text-zinc-400">Candidates see this before applying — takes 30 seconds.</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="name">Company name</Label>
                <Input id="name" placeholder="e.g. Acme Technologies" {...register("name")} />
                {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="industry">Industry</Label><Input id="industry" placeholder="e.g. Fintech" {...register("industry")} /></div>
                <div className="space-y-2"><Label htmlFor="location">Location</Label><Input id="location" placeholder="e.g. San Francisco, CA" {...register("location")} /></div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://yourcompany.com" {...register("website")} />
                {errors.website && <p className="text-sm text-red-400">{errors.website.message}</p>}
            </div>
            {mutation.isError && <p className="text-sm text-red-400">Couldn't create your company profile — try again.</p>}
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}
            </Button>
        </form>
    );
}

const jobSchema = z.object({
    title: z.string().trim().min(3, "Title is required"),
    description: z.string().trim().min(50, "Add at least 50 characters describing the role"),
    requirements: z.string().trim().min(1, "Add at least one requirement, one per line"),
    responsibilities: z.string().trim().min(1, "Add at least one responsibility, one per line"),
    skills: z.string().trim().min(1, "Add at least one skill, comma separated"),
    type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "REMOTE"]),
    experience: z.enum(["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"]),
    location: z.string().trim().min(2, "Location is required"),
    isRemote: z.boolean(),
    salaryMin: z.coerce.number().int().positive().optional(),
    salaryMax: z.coerce.number().int().positive().optional(),
});
type JobForm = z.infer<typeof jobSchema>;

const JOB_TYPES = [
    { value: "FULL_TIME", label: "Full-time" },
    { value: "PART_TIME", label: "Part-time" },
    { value: "CONTRACT", label: "Contract" },
    { value: "INTERNSHIP", label: "Internship" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "REMOTE", label: "Remote" },
] as const;

const EXPERIENCE_LEVELS = [
    { value: "ENTRY", label: "Entry" },
    { value: "MID", label: "Mid" },
    { value: "SENIOR", label: "Senior" },
    { value: "LEAD", label: "Lead" },
    { value: "EXECUTIVE", label: "Executive" },
] as const;

function PillToggle<T extends string>({ options, value, onChange }: {
    options: readonly { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
    return (
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                        value === opt.value
                            ? "border-[#4F46E5] bg-[#4F46E5]/20 text-[#8B5CF6]"
                            : "border-[#27272A] text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

function JobPostForm() {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<JobForm>({
        resolver: zodResolver(jobSchema) as any,
        defaultValues: { type: "FULL_TIME", experience: "MID", isRemote: false },
    });
    // eslint-disable-next-line react-hooks/incompatible-library
    const isRemote = watch("isRemote");
    const jobType = watch("type");
    const experience = watch("experience");
    const description = watch("description") ?? "";

    const mutation = useMutation({
        mutationFn: (values: JobForm) => createJob({
            ...values,
            requirements: values.requirements.split("\n").map((r) => r.trim()).filter(Boolean),
            responsibilities: values.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean),
            skills: values.skills.split(",").map((s) => s.trim()).filter(Boolean),
            salaryMin: values.salaryMin || undefined,
            salaryMax: values.salaryMax || undefined,
        }),
        onSuccess: (job) => navigate(`/jobs/${job.slug}`),
    });

    return (
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-8 rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8">
            <div>
                <h2 className="text-lg font-semibold text-[#F9FAFB]">Post a new job</h2>
                <p className="mt-1 text-sm text-zinc-400">Fill in the details below — this goes live immediately after publishing.</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Job title</Label>
                <Input id="title" placeholder="e.g. Senior Frontend Engineer" {...register("title")} />
                {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div className="space-y-3">
                <Label>Job type</Label>
                <PillToggle options={JOB_TYPES} value={jobType} onChange={(v) => setValue("type", v)} />
            </div>

            <div className="space-y-3">
                <Label>Experience level</Label>
                <PillToggle options={EXPERIENCE_LEVELS} value={experience} onChange={(v) => setValue("experience", v)} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. New York, NY" {...register("location")} />
                    {errors.location && <p className="text-sm text-red-400">{errors.location.message}</p>}
                </div>
                <div className="flex items-center justify-between rounded-lg border border-[#27272A] px-4 py-2.5 sm:mt-7">
                    <span className="text-sm text-zinc-300">Fully remote</span>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isRemote}
                        onClick={() => setValue("isRemote", !isRemote)}
                        className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", isRemote ? "bg-[#4F46E5]" : "bg-[#27272A]")}
                    >
                        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", isRemote ? "translate-x-5" : "translate-x-0.5")} />
                    </button>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="salaryMin">Salary min (optional)</Label><Input id="salaryMin" type="number" placeholder="80000" {...register("salaryMin")} /></div>
                <div className="space-y-2"><Label htmlFor="salaryMax">Salary max (optional)</Label><Input id="salaryMax" type="number" placeholder="120000" {...register("salaryMax")} /></div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="description">Description</Label>
                    <span className={cn("text-xs", description.length >= 50 ? "text-zinc-500" : "text-amber-500")}>{description.length}/50 min</span>
                </div>
                <Textarea id="description" rows={5} placeholder="What's the role about?" {...register("description")} />
                {errors.description && <p className="text-sm text-red-400">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                <Textarea id="responsibilities" rows={4} placeholder={"Own the roadmap for X\nCollaborate with design and product"} {...register("responsibilities")} />
                {errors.responsibilities && <p className="text-sm text-red-400">{errors.responsibilities.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea id="requirements" rows={4} placeholder={"5+ years of experience\nStrong communication skills"} {...register("requirements")} />
                {errors.requirements && <p className="text-sm text-red-400">{errors.requirements.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" placeholder="React, TypeScript, Node.js" {...register("skills")} />
                {errors.skills && <p className="text-sm text-red-400">{errors.skills.message}</p>}
            </div>

            {mutation.isError && <p className="text-sm text-red-400">Couldn't post the job — check the fields and try again.</p>}
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish job"}
            </Button>
        </form>
    );
}

export default function PostJob() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: company, isLoading } = useQuery({ queryKey: ["my-company"], queryFn: fetchMyCompany });

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-[#F9FAFB]">
                <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>
            ) : company ? (
                <JobPostForm />
            ) : (
                <CompanySetupForm onDone={() => queryClient.invalidateQueries({ queryKey: ["my-company"] })} />
            )}
        </div>
    );
}