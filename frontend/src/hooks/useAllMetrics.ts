import { useEffect, useState } from "react";

export function useAllMetrics() {
  const [metricsList, setMetricsList] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllMetrics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/runs/all-metrics`);
        if (!response.ok) {
          throw new Error("Network response was not ok. Failed to fetch metrics.");
        }
        const data = await response.json();
        setMetricsList(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMetrics();
  }, []);

  return { metricsList, loading, error };
}
