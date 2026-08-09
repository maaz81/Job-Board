import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
    CheckCircle2,
    Loader2,
    Mail,
} from "lucide-react";

import { resendVerificationRequest } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";

export default function VerificationPending() {
    const { user } = useAuth();

    const [sent, setSent] = useState(false);

    const mutation = useMutation({
        mutationFn: resendVerificationRequest,

        onSuccess: () => {
            setSent(true);
        },
    });

    if (!user) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8 text-center shadow-2xl backdrop-blur-xl">
                    <Mail className="mx-auto h-10 w-10 text-[#8B5CF6]" />

                    <h1 className="mt-5 text-2xl font-semibold text-[#F9FAFB]">
                        Sign in required
                    </h1>

                    <p className="mt-3 text-sm text-zinc-400">
                        Please sign in before requesting a
                        verification email.
                    </p>

                    <Link to="/login">
                        <Button className="mt-8 w-full">
                            Sign in
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (user.isEmailVerified) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8 text-center shadow-2xl backdrop-blur-xl">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />

                    <h1 className="mt-5 text-2xl font-semibold text-[#F9FAFB]">
                        Email already verified
                    </h1>

                    <p className="mt-3 text-sm text-zinc-400">
                        Your JobSphere AI email address is
                        already verified.
                    </p>

                    <Link to="/">
                        <Button className="mt-8 w-full">
                            Continue
                        </Button>
                    </Link>
                </div>
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
                className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#4F46E5]/10">
                    <Mail className="h-7 w-7 text-[#8B5CF6]" />
                </div>

                <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                    Verify your email
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                    We haven't verified your email address yet.
                </p>

                <div className="mt-5 rounded-lg border border-[#27272A] bg-black/20 px-4 py-3">
                    <p className="text-sm font-medium text-zinc-200 break-all">
                        {user.email}
                    </p>
                </div>

                {sent ? (
                    <div className="mt-6 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                        <p className="text-sm text-emerald-400">
                            Verification email sent. Check
                            your inbox.
                        </p>
                    </div>
                ) : (
                    <>
                        {mutation.isError && (
                            <p className="mt-5 text-sm text-red-400">
                                Unable to send the verification
                                email. Please try again.
                            </p>
                        )}

                        <Button
                            className="mt-6 w-full"
                            onClick={() =>
                                mutation.mutate()
                            }
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                "Send verification email"
                            )}
                        </Button>
                    </>
                )}

                <Link
                    to="/"
                    className="mt-6 block text-sm text-zinc-400 hover:text-zinc-200"
                >
                    Back to JobSphere AI
                </Link>
            </motion.div>
        </div>
    );
}