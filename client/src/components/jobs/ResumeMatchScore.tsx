import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getMatchScore } from "@/api/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";

export function ResumeMatchScore({ jobId }: { jobId: string }) {
    const [resumeText, setResumeText] = useState("");
    const [open, setOpen] = useState(false);
    const mutation = useMutation({ mutationFn: () => getMatchScore(jobId, resumeText) });

    return (
        <div className="mt-8 rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6">
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 text-sm font-medium text-[#8B5CF6]">
                <Sparkles className="h-4 w-4" /> Check your AI resume match score
            </button>
            {open && (
                <div className="mt-4 space-y-3">
                    <Textarea rows={6} placeholder="Paste your resume text here..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
                    <Button onClick={() => mutation.mutate()} disabled={resumeText.trim().length < 50 || mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Get my match score"}
                    </Button>
                    {mutation.data && (
                        <div className="rounded-xl border border-[#27272A] bg-black/20 p-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-[#8B5CF6]">{mutation.data.score}</span>
                                <span className="text-sm text-zinc-400">/ 100 match</span>
                            </div>
                            <p className="mt-2 text-sm text-zinc-300">{mutation.data.feedback}</p>
                        </div>
                    )}
                    {mutation.isError && <p className="text-sm text-red-400">Couldn't analyze resume — try again.</p>}
                </div>
            )}
        </div>
    );
}