import { useState, useEffect } from "react";

export interface Run {
    dataset_name: string;
    id: string;
    dataset_id: string;
    status: string;
    created_at: string;
    updated_at: string | null;
}

export function useRunDetails(runId: string) {
    const [runDetails, setRunDetails] = useState<Run | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRunDetails() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/runs/${runId}`);
                if (!response.ok) {
                    throw new Error("Error! Failed to fetch run details!");
                }
                const data = await response.json();
                setRunDetails(data);
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        }

        fetchRunDetails();
    }, [runId]);

    return { runDetails, loading, error };
}