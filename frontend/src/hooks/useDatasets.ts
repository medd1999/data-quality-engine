import { useEffect, useState } from "react";

export function useDatasets(id: string | number) {
    const [datasets, setDatasets] = useState(null);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/datasets/${id}`);
                const data = await res.json();
                setDatasets(data);
            } catch (error) {
                console.error("Error fetching datasets:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    return { datasets, loading };
}