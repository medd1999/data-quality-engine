import "./Alerts.css";
import { useParams } from "react-router-dom";
import { useAlerts } from "../../hooks/useAlerts";

export default function Alerts() {
  const { id: runId } = useParams();
  const { alerts, loading, error } = useAlerts(runId!);

  if (loading) {
    return <p>Loading up alerts...</p>;
  }

  if (error) {
    return <p className="error-text">Uh oh, we've got an error: {error}</p>;
  }

  if (!alerts.length) {
    return <p>Hmmm, no alerts are found for this run.</p>
  }

  const errorCount = alerts.filter(alert => alert.severity?.toLowerCase() === "error").length;
  const warningCount = alerts.filter(alert => alert.severity?.toLowerCase() === "warning").length;
  const infoCount = alerts.filter(alert => alert.severity?.toLowerCase() === "info").length;

  return (
    <div className="alerts-page">
      <h1 className="alerts-title">Alerts for Run #{runId}</h1>

      <div className="alerts-summary">
        <div className="summary-card error">
          <span className="summary-count">{errorCount}</span>
          <span className="summary-label">Errors</span>
        </div>

        <div className="summary-card warning">
          <span className="summary-count">{warningCount}</span>
          <span className="summary-label">Warnings</span>
        </div>

        <div className="summary-card info">
          <span className="summary-count">{infoCount}</span>
          <span className="summary-label">Info</span>
        </div>
      </div>

      <div className="alerts-table">
        <div className="alerts-header">
          <span>Severity</span>
          <span>Message</span>
          <span>Timestamp</span>
        </div>

        {alerts.map(alert => (
          <div key={alert.id ?? `${alert.severity}-${alert.timestamp}`} className={`alerts-row ${alert.severity}`}>
            <span className="alert-severity">{(alert.severity ?? "unknown").toUpperCase()}</span>
            <span className="alert-message">{alert.message ?? "No message"}</span>
            <span className="alert-timestamp">{alert.timestamp ? new Date(alert.timestamp).toLocaleString() : "Unknown"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

