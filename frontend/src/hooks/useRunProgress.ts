import { useEffect, useState } from "react";

export function useRunProgress(runId: string) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!runId) return;

        const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/runs/stream/${runId}`);

        evtSource.onmessage = (e) => {
            try {
                const event = JSON.parse(e.data);

                if (event.type === "progress") {
                    setProgress(event.value);
                }
            } catch {
                // ignore non-JSON logs
            }
        };

        evtSource.onerror = () => {
            evtSource.close();
        };

        return () => evtSource.close();
    }, [runId]);

    return { progress };
}