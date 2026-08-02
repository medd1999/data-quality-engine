import { useState, useEffect } from "react";

export function useSingleDataset(id: string | number) {
    const [dataset, setDataset] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/datasets/${id}`);
                const data = await res.json();
                setDataset(data);
            } catch (error) {
                console.error("Error fetching dataset:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [id]);

    return { dataset, loading };
}