import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden px-6 py-28 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#4F46E5]/10 via-transparent to-[#8B5CF6]/10 pointer-events-none" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mx-auto max-w-3xl"
            >
                <span className="inline-block rounded-full border border-[#27272A] bg-[#111827]/60 px-4 py-1 text-xs text-[#8B5CF6]">
                    AI-Powered Hiring Platform
                </span>
                <h1 className="mt-6 text-4xl font-semibold text-[#F9FAFB] sm:text-5xl">
                    Hiring, matched by AI. <br /> Built for modern teams.
                </h1>
                <p className="mt-5 text-lg text-zinc-400">
                    Post roles, find candidates, and get instant AI resume match scores — all in one place.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                    <Button size="lg" onClick={() => window.location.href = "/register"}>
                        Get Started <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>

                    <Button
                        size="lg"
                        variant="outline"
                        onClick={() => window.location.href = "/jobs"}
                    >
                        Browse Jobs
                    </Button>
                </div>
            </motion.div>
        </section>
    );
}