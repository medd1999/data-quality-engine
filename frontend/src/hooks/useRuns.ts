import { useEffect, useState } from "react";

export interface Run {
    id: string;
    dataset_id: string;
    status: string;
    created_at: string;
    updated_at: string | null;
}

export function useRuns(datasetId: string) {
    const [runs, setRuns] = useState<Run[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRuns() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/runs`);
                if (!response.ok) {
                    throw new Error("Failed to fetch runs");
                }
                const data = await response.json();
                setRuns(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchRuns();
    }, [datasetId]);

    return { runs, loading, error };
}