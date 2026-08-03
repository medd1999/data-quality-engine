import { useRunDetails } from "../../hooks/useRunDetails";
import "./RunDetails.css";
import { useParams, Link } from "react-router-dom";

export default function RunDetails() {
    const { id } = useParams();
    const { runDetails, loading, error } = useRunDetails(id!);

    if (loading) {
        return <p>Loading up the run details...</p>;
    }

    if (error) {
        return <p>Uhhhh...we've got a problem: {error}</p>;
    }

    if (!runDetails) {
        return <p>Uhhh...there's no run to be found.</p>;
    }

    return (
        <div className="run-details-page">
            <h1 className="run-details-title">Run #{runDetails.id}</h1>
            <div className="run-details-card">
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
                    <span className="value">{new Date(runDetails.created_at).toLocaleString()}</span>
                </div>
                <div className="run-details-row">
                    <span className="label">Updated At:</span> 
                    <span className="value">{runDetails.updated_at ? new Date(runDetails.updated_at).toLocaleString() : "N/A"}</span>
                </div>
            </div>
            <Link to="/runs" className="back-link">Back to Run History</Link>
        </div>
    );
}
