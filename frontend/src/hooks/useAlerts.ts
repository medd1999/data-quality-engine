import { useEffect, useState } from "react";

export interface Alert {
  id: number;
  run_id: number;
  message: string;
  severity: "info" | "warning" | "error";
  timestamp: string;
}

export function useAlerts(runId: string) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/runs/${runId}/alerts`);
        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }
        const data = await response.json();
        setAlerts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAlerts();
  }, [runId]);

  return { alerts, loading, error };
}

