import { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Link,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
    CheckCircle2,
    Loader2,
    XCircle,
} from "lucide-react";

import { verifyEmailRequest } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const mutation = useMutation({
        mutationFn: (verificationToken: string) =>
            verifyEmailRequest(verificationToken),

        onSuccess: async () => {
            await refreshUser();
        },
    });

    useEffect(() => {
        if (!token) {
            return;
        }

        mutation.mutate(token);
        // We intentionally only want to verify this URL token once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    if (!token) {
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
                    className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 backdrop-blur-xl p-8 text-center shadow-2xl"
                >
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                        <XCircle className="h-7 w-7 text-red-400" />
                    </div>

                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Invalid verification link
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        This verification link is missing or
                        invalid.
                    </p>

                    <Link to="/login">
                        <Button className="mt-8 w-full">
                            Back to login
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (mutation.isPending) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8 text-center shadow-2xl backdrop-blur-xl"
                >
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#4F46E5]/10">
                        <Loader2 className="h-7 w-7 animate-spin text-[#8B5CF6]" />
                    </div>

                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Verifying your email
                    </h1>

                    <p className="mt-3 text-sm text-zinc-400">
                        Please wait while we verify your email
                        address.
                    </p>
                </motion.div>
            </div>
        );
    }

    if (mutation.isSuccess) {
        return (
            <div className="relative min-h-screen flex items-center justify-center bg-[#09090B] px-4">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8 text-center shadow-2xl backdrop-blur-xl"
                >
                    <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
                        <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>

                    <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                        Email verified
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        Your email address has been successfully
                        verified.
                    </p>

                    <p className="mt-3 text-sm text-zinc-500">
                        You can now use email verification
                        protected features on JobSphere AI.
                    </p>

                    <Button
                        className="mt-8 w-full"
                        onClick={() => navigate("/")}
                    >
                        Continue to JobSphere AI
                    </Button>
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
                className="relative w-full max-w-md rounded-2xl border border-[#27272A] bg-[#111827]/60 p-8 text-center shadow-2xl backdrop-blur-xl"
            >
                <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                    <XCircle className="h-7 w-7 text-red-400" />
                </div>

                <h1 className="text-2xl font-semibold text-[#F9FAFB]">
                    Verification failed
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                    This verification link is invalid or has
                    expired.
                </p>

                <div className="mt-8 space-y-3">
                    <Link to="/verification-pending">
                        <Button className="w-full">
                            Get a new verification link
                        </Button>
                    </Link>

                    <Link
                        to="/"
                        className="block text-sm text-zinc-400 hover:text-zinc-200"
                    >
                        Back to JobSphere AI
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}