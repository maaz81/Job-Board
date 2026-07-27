export function formatSalary(min?: number | null, max?: number | null, currency = "USD") {
    if (!min && !max) return "Not disclosed";
    const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    return fmt((min ?? max) as number);
}

export function formatRelativeTime(dateString: string) {
    const diffDays = Math.floor((Date.now() - new Date(dateString).getTime()) / 86_400_000);
    if (diffDays <= 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getInitials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}