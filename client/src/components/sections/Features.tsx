import { motion } from "framer-motion";
import { Sparkles, Search, Zap } from "lucide-react";

const FEATURES = [
    { icon: Sparkles, title: "AI Resume Match Score", desc: "Instantly see how well your resume matches a role, with actionable feedback." },
    { icon: Search, title: "Smart Job Search", desc: "Filter by type, experience level, and location to find roles that fit." },
    { icon: Zap, title: "One-Click Apply", desc: "Apply to roles in seconds and track every application's status in one place." },
];

export function Features() {
    return (
        <section className="px-6 py-20">
            <div className="mx-auto max-w-5xl">
                <h2 className="text-center text-2xl font-semibold text-[#F9FAFB]">Everything you need to hire, faster</h2>
                <div className="mt-12 grid gap-6 sm:grid-cols-3">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="rounded-2xl border border-[#27272A] bg-[#111827]/60 p-6"
                        >
                            <f.icon className="h-6 w-6 text-[#8B5CF6]" />
                            <h3 className="mt-4 font-medium text-[#F9FAFB]">{f.title}</h3>
                            <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}