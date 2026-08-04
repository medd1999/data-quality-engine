import { useEffect, useState } from "react";

export function useAllAlerts() {
    const [alertsList, setAlertsList] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/runs/all-alerts`);
                if (!response.ok){
                    throw new Error("Failed to fetch alerts.");
                }
                const data = await response.json();
                setAlertsList(data);
            } catch (error) {
              setError((error as Error).message);
            } finally {
              setLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    return { alertsList, loading, error };
}