import "./Metrics.css";
import { useParams } from "react-router-dom";
import { useMetrics } from "../../hooks/useMetrics";

export default function Metrics() {
  const { id: runId } = useParams();
  const { metrics, loading, error } = useMetrics(runId!);

  if (loading) return <p>Loading metrics...</p>;
  if (error) return <p className="error-text">Uh oh, we've got an error: {error}</p>;
  if (!metrics) return <p>Hmmm, no metrics found for this run.</p>;

  const missingTotal = metrics.missing_values?.summary?.total_missing ?? 0;
  const duplicateCount = metrics.duplicate_rows?.summary?.duplicate_rows ?? 0;
  const schemaMissing = metrics.schema_validation?.summary?.missing_values ?? 0;
  const schemaUnexpected = metrics.schema_validation?.summary?.unexpected_values ?? 0;
  const schemaTypeMismatch = metrics.schema_validation?.summary?.type_mismatches ?? 0;
  const schemaNullability = metrics.schema_validation?.summary?.nullability_violations ?? 0;
  const outlierTotal = metrics.outliers?.summary?.total_outliers ?? 0;

  return (
    <div className="metrics-page">
      <h1 className="metrics-title">Metrics for Run #{runId}</h1>

      <div className="metrics-card">
        <h2>Missing Values</h2>
        <p><strong>Total Missing:</strong> {missingTotal}</p>

        <ul>
          {Object.entries(metrics.missing_values?.by_column ?? {}).map(([column, count]) => (       
              <p key={column}><strong>{column}:</strong> {String(count)}</p>
          ))}
        </ul>
      </div>

      <div className="metrics-card">
        <h2>Duplicate Rows</h2>
        <p>{duplicateCount}</p>
      </div>

      <div className="metrics-card">
        <h2>Schema Validation</h2>
        <ul>
          <p><strong>Missing Values:</strong> {schemaMissing}</p>
          <p><strong>Unexpected Values:</strong> {schemaUnexpected}</p>
          <p><strong>Type Mismatches:</strong> {schemaTypeMismatch}</p>
          <p><strong>Nullability Violations:</strong> {schemaNullability}</p>
        </ul>
      </div>

      <div className="metrics-card">
        <h2>Outliers</h2>
        <p><strong>Total Outliers:</strong> {outlierTotal}</p>

        <ul>
          {Object.entries(metrics.outliers?.by_column ?? {}).map(([column, count]) => (
            <p key={column}>
              <strong>{column}:</strong> {String(count)}
            </p>
          ))}
        </ul>
      </div>
    </div>
  );
}
