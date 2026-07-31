import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { loginRequest } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ user }) => {
      login(user);

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

      navigate(
        from ??
        (user.role === "RECRUITER"
          ? "/recruiter/jobs"
          : "/candidate/applications"),
        { replace: true }
      );
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
          <h1 className="text-2xl font-semibold text-[#F9FAFB]">Welcome back</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to continue to JobSphere AI</p>
        </div>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
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
          {mutation.isError && <p className="text-sm text-red-400 text-center">Invalid email or password</p>}
          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account? <Link to="/register" className="text-[#8B5CF6] hover:underline">Create one</Link>
        </p>
      </motion.div>
    </div>
  );
}