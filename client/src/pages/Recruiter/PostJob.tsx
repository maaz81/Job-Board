import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { fetchMyCompany, createCompany, createJob } from "@/api/jobs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
            <div>
                <h2 className="text-lg font-semibold text-[#F9FAFB]">Set up your company profile</h2>
                <p className="mt-1 text-sm text-zinc-400">Candidates see this before applying — takes 30 seconds.</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="name">Company name</Label>
                <Input id="name" {...register("name")} />
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
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Continue"}</Button>
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
    salaryMin: z.coerce.number().int().positive().optional().or(z.literal("")),
    salaryMax: z.coerce.number().int().positive().optional().or(z.literal("")),
});
type JobForm = z.infer<typeof jobSchema>;

function JobPostForm() {
    const navigate = useNavigate();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<JobForm>({
        resolver: zodResolver(jobSchema),
        defaultValues: { type: "FULL_TIME", experience: "MID", isRemote: false },
    });
    const isRemote = watch("isRemote");

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
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5 rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8">
            <h2 className="text-lg font-semibold text-[#F9FAFB]">Post a new job</h2>

            <div className="space-y-2">
                <Label htmlFor="title">Job title</Label>
                <Input id="title" placeholder="e.g. Senior Frontend Engineer" {...register("title")} />
                {errors.title && <p className="text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label>Job type</Label>
                    <Select defaultValue="FULL_TIME" onValueChange={(v) => setValue("type", v as JobForm["type"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE", "REMOTE"].map((t) => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Experience level</Label>
                    <Select defaultValue="MID" onValueChange={(v) => setValue("experience", v as JobForm["experience"])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Remote / New York, NY" {...register("location")} />
                    {errors.location && <p className="text-sm text-red-400">{errors.location.message}</p>}
                </div>
                <label className="flex items-center gap-2 pt-7 text-sm text-zinc-300">
                    <input type="checkbox" checked={isRemote} onChange={(e) => setValue("isRemote", e.target.checked)} className="rounded border-[#27272A]" />
                    This role is fully remote
                </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="salaryMin">Salary min (optional)</Label><Input id="salaryMin" type="number" placeholder="80000" {...register("salaryMin")} /></div>
                <div className="space-y-2"><Label htmlFor="salaryMax">Salary max (optional)</Label><Input id="salaryMax" type="number" placeholder="120000" {...register("salaryMax")} /></div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={5} placeholder="What's the role about?" {...register("description")} />
                {errors.description && <p className="text-sm text-red-400">{errors.description.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
                <Textarea id="responsibilities" rows={4} {...register("responsibilities")} />
                {errors.responsibilities && <p className="text-sm text-red-400">{errors.responsibilities.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="requirements">Requirements (one per line)</Label>
                <Textarea id="requirements" rows={4} {...register("requirements")} />
                {errors.requirements && <p className="text-sm text-red-400">{errors.requirements.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma separated)</Label>
                <Input id="skills" placeholder="React, TypeScript, Node.js" {...register("skills")} />
                {errors.skills && <p className="text-sm text-red-400">{errors.skills.message}</p>}
            </div>

            {mutation.isError && <p className="text-sm text-red-400">Couldn't post the job — check the fields and try again.</p>}
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish job"}</Button>
        </form>
    );
}

export default function PostJob() {
    const queryClient = useQueryClient();
    const { data: company, isLoading } = useQuery({ queryKey: ["my-company"], queryFn: fetchMyCompany });

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-zinc-500" /></div>;

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            {company ? <JobPostForm /> : <CompanySetupForm onDone={() => queryClient.invalidateQueries({ queryKey: ["my-company"] })} />}
        </div>
    );
}