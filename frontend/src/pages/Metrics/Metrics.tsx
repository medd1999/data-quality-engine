import "./Metrics.css";
import { useParams } from "react-router-dom";
import { useMetrics } from "../../hooks/useMetrics";

export default function Metrics() {
  const { runId } = useParams<{ runId: string }>();
  const { metrics, loading, error } = useMetrics(runId!);

  if (loading) {
    return <p>Loading metrics...</p>;
  }

  if (error) {
    return <p className="error-text">Uh oh, we've got an error: {error}</p>;
  }

  if (!metrics) {
    return <p>Yikes! No metrics found for this run.</p>;
  }

  return (
    <div className="metrics-page">
      <h1 className="metrics-title">Metrics</h1>

      <div className="metrics-card">
        <h2>Missing Values</h2>
        <ul>
          {Object.entries(metrics.missing_values).map(([column, count]) => (
            <li key={column}>
              <strong>{column}:</strong> {count}
            </li>
          ))}
        </ul>
    </div>
    
    <div className="metrics-card">
      <h2>Duplicate Rows</h2>
      <p>{metrics.duplicate_rows}</p>
    </div>

    <div className="metrics-card">
      <h2>Schema Mismatches</h2>
        {metrics.schema_mismatches.length === 0 ? (
          <p>No schema mismatches found.</p>
        ) : (
          <ul>
            {metrics.schema_mismatches.map((mismatch, index) => (
            <li key={index}>{mismatch}</li>
        ))}
      </ul>
        )}
    </div>

    <div className="metrics-card">
      <h2>Outliers</h2>
      <ul>
        {Object.entries(metrics.outliers).map(([column, count]) => (
          <li key={column}>
            <strong>{column}:</strong> {count}
          </li>
        ))}
      </ul>
    </div>

    <div className="metrics-card">
      <h2>Distributions</h2>
      <pre className="distribution-json">
        {JSON.stringify(metrics.distributions, null, 2)}
      </pre>
    </div>
  </div>
  );
}

