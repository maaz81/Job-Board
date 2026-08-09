import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";

import { forgotPasswordRequest } from "@/api/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
    email: z
        .string()
        .trim()
        .email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
    const [submittedEmail, setSubmittedEmail] =
        useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: forgotPasswordRequest,

        onSuccess: (_, email) => {
            setSubmittedEmail(email);
        },
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values.email);
    };

    const handleTryAnotherEmail = () => {
        setSubmittedEmail("");
        mutation.reset();
    };

    if (submittedEmail) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                    }}
                    className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl"
                >
                    <div className="flex justify-center mb-6">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4F46E5]/10">
                            <CheckCircle2 className="h-7 w-7 text-[#8B5CF6]" />
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                            Check your email
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-zinc-400">
                            If an account exists with{" "}
                            <span className="font-medium text-zinc-200">
                                {submittedEmail}
                            </span>
                            , we've sent you a password reset
                            link.
                        </p>

                        <p className="mt-3 text-sm text-zinc-500">
                            The link will expire in 15 minutes.
                        </p>
                    </div>

                    <div className="mt-8 space-y-3">
                        <Button
                            type="button"
                            className="w-full"
                            onClick={handleTryAnotherEmail}
                        >
                            Try another email
                        </Button>

                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to login
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut",
                }}
                className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4F46E5]/10">
                        <Mail className="h-7 w-7 text-[#8B5CF6]" />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Forgot your password?
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Enter your email address and we'll send
                        you a link to reset your password.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <Label htmlFor="email">
                            Email
                        </Label>

                        <Input
                            id="email"
                            type="email"
                            placeholder="you@company.com"
                            autoComplete="email"
                            {...register("email")}
                        />

                        {errors.email && (
                            <p className="text-sm text-red-400">
                                {errors.email.message}
                            </p>
                        )}
                    </div>

                    {mutation.isError && (
                        <p className="text-sm text-red-400 text-center">
                            Something went wrong. Please try
                            again.
                        </p>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Sending reset link...
                            </>
                        ) : (
                            "Send reset link"
                        )}
                    </Button>
                </form>

                <Link
                    to="/login"
                    className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                </Link>
            </motion.div>
        </div>
    );
}