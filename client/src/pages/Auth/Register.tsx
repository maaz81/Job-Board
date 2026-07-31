import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { registerRequest } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const schema = z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["CANDIDATE", "RECRUITER"]),
});
type FormValues = z.infer<typeof schema>;

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { role: "CANDIDATE" },
    });
    // eslint-disable-next-line react-hooks/incompatible-library
    const role = watch("role");

    const mutation = useMutation({
        mutationFn: registerRequest,
        onSuccess: ({ user }) => {
            login(user);
            navigate(user.role === "RECRUITER" ? "/recruiter/jobs" : "/candidate/applications", { replace: true });
        },
    });

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl"
            >
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">Create your account</h1>
                    <p className="mt-2 text-sm text-zinc-400">Join JobSphere AI in seconds</p>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-2 rounded-xl border border-[#27272A] bg-black/20 p-1">
                    <button type="button" onClick={() => setValue("role", "CANDIDATE")}
                        className={cn("rounded-lg py-2 text-sm font-medium transition-colors", role === "CANDIDATE" ? "bg-[#4F46E5] text-white" : "text-zinc-400 hover:text-zinc-200")}>
                        I'm looking for a job
                    </button>
                    <button type="button" onClick={() => setValue("role", "RECRUITER")}
                        className={cn("rounded-lg py-2 text-sm font-medium transition-colors", role === "RECRUITER" ? "bg-[#4F46E5] text-white" : "text-zinc-400 hover:text-zinc-200")}>
                        I'm hiring talent
                    </button>
                </div>

                <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input id="name" placeholder="Jane Doe" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@company.com" {...register("email")} />
                        {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
                        {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                    </div>
                    {mutation.isError && <p className="text-sm text-red-400 text-center">Could not create account — try a different email</p>}
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
                    </Button>
                </form>

                <p className="mt-6 text-center text-sm text-zinc-400">
                    Already have an account? <Link to="/login" className="text-[#8B5CF6] hover:underline">Sign in</Link>
                </p>
            </motion.div>
        </div>
    );
}