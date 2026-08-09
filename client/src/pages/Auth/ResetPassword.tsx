import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Loader2,
} from "lucide-react";

import { resetPasswordRequest } from "@/api/auth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
    .object({
        password: z
            .string()
            .min(
                8,
                "Password must be at least 8 characters"
            ),

        confirmPassword: z
            .string()
            .min(
                8,
                "Please confirm your password"
            ),
    })
    .refine(
        (data) =>
            data.password === data.confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
    });

    const mutation = useMutation({
        mutationFn: ({
            password,
        }: FormValues) => {
            if (!token) {
                throw new Error(
                    "Reset token is missing"
                );
            }

            return resetPasswordRequest(
                token,
                password
            );
        },

        onSuccess: () => {
            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                });
            }, 1800);
        },
    });

    const onSubmit = (values: FormValues) => {
        mutation.mutate(values);
    };

    /*
     * No token in URL.
     */
    if (!token) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 16,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                    }}
                    className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl text-center"
                >
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                        <KeyRound className="h-7 w-7 text-red-400" />
                    </div>

                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Invalid reset link
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        This password reset link is missing
                        or invalid.
                    </p>

                    <Link to="/forgot-password">
                        <Button className="mt-8 w-full">
                            Request a new reset link
                        </Button>
                    </Link>

                    <Link
                        to="/login"
                        className="mt-4 inline-block text-sm text-zinc-400 hover:text-zinc-200"
                    >
                        Back to login
                    </Link>
                </motion.div>
            </div>
        );
    }

    /*
     * Successful password reset.
     */
    if (mutation.isSuccess) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 16,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        duration: 0.4,
                        ease: "easeOut",
                    }}
                    className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl text-center"
                >
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                        <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>

                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Password reset successfully
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Your password has been changed.
                        You can now sign in with your new
                        password.
                    </p>

                    <p className="mt-4 text-xs text-zinc-500">
                        Redirecting you to login...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

            <motion.div
                initial={{
                    opacity: 0,
                    y: 16,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeOut",
                }}
                className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#4F46E5]/10">
                        <KeyRound className="h-7 w-7 text-[#8B5CF6]" />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Create a new password
                    </h1>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Choose a strong password for your
                        JobSphere AI account.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-5"
                >
                    {/* Password */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            New password
                        </Label>

                        <div className="relative">
                            <Input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="pr-10"
                                {...register(
                                    "password"
                                )}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(
                                        (value) =>
                                            !value
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-sm text-red-400">
                                {
                                    errors.password
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                            Confirm new password
                        </Label>

                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="••••••••"
                                autoComplete="new-password"
                                className="pr-10"
                                {...register(
                                    "confirmPassword"
                                )}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (value) =>
                                            !value
                                    )
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {errors.confirmPassword && (
                            <p className="text-sm text-red-400">
                                {
                                    errors
                                        .confirmPassword
                                        .message
                                }
                            </p>
                        )}
                    </div>

                    {mutation.isError && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-center">
                            <p className="text-sm text-red-400">
                                The reset link is invalid
                                or has expired.
                            </p>

                            <Link
                                to="/forgot-password"
                                className="mt-1 inline-block text-sm text-red-300 hover:underline"
                            >
                                Request a new reset
                                link
                            </Link>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating password...
                            </>
                        ) : (
                            "Reset password"
                        )}
                    </Button>
                </form>

                <Link
                    to="/login"
                    className="mt-6 block text-center text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                    Back to login
                </Link>
            </motion.div>
        </div>
    );
}