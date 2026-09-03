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
              <p><strong>Missing: </strong> {item.metrics.missing_values?.summary?.total_missing ?? 0}</p>
              <p><strong>Duplicates: </strong>{item.metrics.duplicate_rows?.summary?.duplicate_rows ?? 0}</p>
              <p><strong>Schema Issues: </strong>
                {(item.metrics.schema_validation?.summary?.missing_values ?? 0) +
                  (item.metrics.schema_validation?.summary?.unexpected_values ?? 0) +
                  (item.metrics.schema_validation?.summary?.type_mismatches ?? 0) +
                  (item.metrics.schema_validation?.summary?.nullability_violations ?? 0)}
              </p>
              <p><strong>Outliers: </strong>{item.metrics.outliers?.summary?.total_outliers ?? 0}</p>
              <p><strong>Last Updated: </strong>{new Date(item.updated_at).toLocaleString()}</p>
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