export function formatSalary(min?: number | null, max?: number | null, currency = "USD") {
    if (!min && !max) return "Not disclosed";
    const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
    if (min && max) return `${fmt(min)} - ${fmt(max)}`;
    return fmt((min ?? max) as number);
}