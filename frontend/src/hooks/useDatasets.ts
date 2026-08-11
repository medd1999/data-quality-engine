import { useEffect, useState } from "react";

export function useDatasets() {
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/datasets/`);
                const data = await res.json();
                setDatasets(data);
            } catch (error) {
                console.error("Error fetching datasets:", error);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return { datasets, loading };
}