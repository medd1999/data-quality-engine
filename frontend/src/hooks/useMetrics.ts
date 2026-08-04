import { useEffect, useState } from "react";

export interface Metric {
    missing_values: Record<string, number>;
    duplicate_rows: number;
    schema_mismatches: string[];
    outliers: Record<string, number>;
    distributions: Record<string, any>;
}

export function useMetrics(runId: string) {
    const [metrics, setMetrics] = useState<Metric | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/runs/${runId}/metrics`);
                if (!response.ok) {
                    throw new Error("Failed to fetch metrics");
                }
                const data = await response.json();
                setMetrics(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, [runId]);

   return { metrics, loading, error };
}