import { useEffect, useState } from "react";

export function useRunStream(runId: string) {
    const [logs, setLogs] = useState<string[]>([]);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<string>("starting");

    
    useEffect(() => {
        if (!runId) return;

        const evtSource = new EventSource(
            `${import.meta.env.VITE_API_URL}/runs/stream/${runId}`
        );

        evtSource.onmessage = (e) => {
            try {
                const event = JSON.parse(e.data);

                if (event.type == "phase") {
                    setPhase(event.value)
                }

                // LOGS
                if (event.type === "log") {
                    setLogs((prev) => [...prev, event.message]);
                }

                // PROGRESS
                if (event.type === "progress") {
                    setProgress(event.value);
                }

                // You can add metrics + alerts here later:
                // if (event.type === "metric") { ... }
                // if (event.type === "alert") { ... }

            } catch {
                // Ignore non-JSON messages (status strings, etc.)
            }
        };

        evtSource.onerror = () => {
            evtSource.close();
        };

        return () => evtSource.close();
    }, [runId]);

    useEffect(() => {
        const el = document.querySelector(".logs-container");
        if (el) el.scrollTop = el.scrollHeight;
    }, [logs]);
    
    return { logs, progress, phase };
}
