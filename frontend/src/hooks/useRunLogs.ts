import { useEffect, useState } from "react";

export function useRunLogs(runId: string) {
    const [logs, setLogs] = useState<string[]>([]);

    useEffect(() => {
        if (!runId) return;

        const evtSource = new EventSource(`${import.meta.env.VITE_API_URL}/runs/stream/${runId}`)

        evtSource.onmessage = (e) => {
            setLogs((prev) => [...prev, e.data]);
        }

        evtSource.onerror = () => {
            console.log("Oh no! The SSE connection failed :(");
            evtSource.close();
        }

        return () => evtSource.close();
    }, [runId]);

    return { logs };
}