import { useRunDetails } from "../../hooks/useRunDetails";
import { useRunStream } from "../../hooks/useRunStream";
import "./RunDetails.css";
import { useParams, Link } from "react-router-dom";


export default function RunDetails() {
    const { id } = useParams();
    const { runDetails, loading, error } = useRunDetails(id!);
    const { logs, progress, phase } = useRunStream(id!);

    const phase_animate = [
        "starting",
        "loading_dataset",
        "schema_validation",
        "missing_values",
        "duplicate_rows",
        "outliers",
        "completed"
    ];

    if (loading) {
        return <p>Loading up the run details...</p>;
    }

    if (error) {
        return <p>Uhhhh...we've got a problem: {error}</p>;
    }

    if (!runDetails) {
        return <p>Hmmm...there's no run to be found.</p>;
    }

    function formatDate(dateString: string) {
        const d = new Date(dateString);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();
        let hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, "0");

        const ampm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12 || 12;

        return `${month}/${day}/${year} at ${hours}:${minutes} ${ampm}`;
    }

    return (
        <div className="run-details-page">
            <h1 className="run-details-title">Run #{runDetails.id}</h1>
            <div className="run-details-card">
                <div className="run-details-row">
                    <span className="label">Dataset Name:</span>
                    <span className="value">{runDetails.dataset_name}</span>
                </div>
                <div className="run-details-row">
                    <span className="label">Run ID:</span>
                    <span className="value">{runDetails.id}</span>
                </div>
                <div className="run-details-row">
                    <span className="label">Dataset ID:</span>
                    <span className="value">{runDetails.dataset_id}</span>
                </div>
                <div className="run-details-row">
                    <span className="label">Status:</span>
                    <span className="value">{runDetails.status}</span>
                </div>
                <div className="run-details-row">
                    <span className="label">Created At:</span>
                    <span className="value">{formatDate(runDetails.created_at)}</span>
                </div>
                <div className="run-details-row">
                    <span className="label">Updated At:</span>
                    <span className="value">{runDetails.updated_at ? new Date(runDetails.updated_at).toLocaleString() : "N/A"}</span>
                </div>
            </div>

            <div className="phase-card">
                <h2>Phase</h2>

                <div className="phase-indicator">
                    <div className={`phase-dot ${phase ? "active" : ""}`}></div>
                    <span className="phase-text">{phase}</span>
                </div>

                <div className="phase-timeline">
                    {phase_animate.map((p) => {
                        const isActive = phase === p;

                        const icons: Record<string, string> = {
                            starting: "🚀",
                            loading_dataset: "📥",
                            schema_validation: "📊",
                            missing_values: "❓",
                            duplicate_rows: "📑",
                            outliers: "📈",
                            completed: "✅"
                        };

                        return (
                            <div
                                key={p}
                                className={`phase-step ${isActive ? "active" : ""}`}
                            >
                                <span className="phase-icon">{icons[p]}</span>
                                {p}
                            </div>
                        );
                    })}
                </div>
            </div>
            <br></br>
            <div className="run-logs-card">
                <h2>Live Logs</h2>
                <div className="logs-container">
                    {logs.length === 0 && <p>No logs yet...</p>}

                    {logs.map((line, i) => (
                        <div key={i} className="log-entry">
                            <span className="log-timestamp">
                                {new Date().toLocaleTimeString()}
                            </span>
                            <span className="log-text">{line}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="progress-card">
                <h2>Progress Meter</h2>
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p>{progress}%</p>
            </div>
            <Link to="/runs" className="back-link">Back to Run History</Link>
        </div>
    );
}
