import type { Run } from "../../hooks/useRuns";
import "./RunsTable.css";
import { Link } from "react-router-dom";

interface RunsTableProps {
    runs: Run[];
}

export default function RunsTable({ runs }: RunsTableProps) {

    function formatDate(dateString: string) {
        const d = new Date(dateString);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, "0");

        return `${month}/${day}/${year} at ${hours}:${minutes}`;
    }

    return (
        <div className="runs-table-container">
            <table className="runs-table">
                <thead>
                    <tr>
                        <th>Run ID</th>
                        <th>Dataset ID</th>
                        <th>Status</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {runs.map((run) => (
                        <tr key={run.id}>
                            <td>{run.id}</td>
                            <td>{run.dataset_id}</td>
                            <td className={`status ${run.status}`}>{run.status}</td>
                            <td>{formatDate(run.created_at)}</td>
                            <td>{run.updated_at ? new Date(run.updated_at).toLocaleString() : "N/A"}</td>
                            <td><Link to={`/runs/${run.id}`}>View Details</Link></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}