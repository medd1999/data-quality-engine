import { Link } from "react-router-dom";
import { useAllMetrics } from "../../hooks/useAllMetrics";
import "./MetricsHome.css";

export default function MetricsHome() {
  const { metricsList, loading, error } = useAllMetrics();

  if (loading) {
    return <p>Loading metrics...</p>;
  }

  if (error) {
    return <p className="error-text">Uh oh, we've got an error: {error}</p>;
  }

  return (
    <div className="metrics-home">
      <h1 className="metrics-home-title">Metrics Dashboard</h1>

      <div className="metrics-grid">
        {metricsList.map((item) => (
          <div key={item.run_id} className="metrics-card">
            <div className="metrics-card-header">
              <h2>Run #{item.run_id}</h2>
              <span className={`status-badge status-${item.status}`}>
                {item.status}
              </span>
            </div>

            <div className="metrics-card-body">
              <p><strong>Dataset: </strong> {item.dataset_name}</p>
              <p><strong>Missing: </strong> {Object.keys(item.metrics.missing_values).length}</p>
              <p><strong>Duplicates: </strong> {item.metrics.duplicate_rows}</p>
              <p><strong>Schema Mismatches: </strong> {item.metrics.schema_mismatches.length}</p>
              <p><strong>Outliers: </strong> {Object.keys(item.metrics.outliers).length}</p>
              <p><strong>Last Updated: </strong> {new Date(item.updated_at).toLocaleString()}</p>
            </div>

            <div className="metrics-card-footer">
              <Link
                to={`/runs/${item.run_id}/metrics`}
                className="view-metrics-btn"
              >
                View Full Metrics →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}