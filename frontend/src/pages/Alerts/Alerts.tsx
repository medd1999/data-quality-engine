import "./Alerts.css";
import { useParams } from "react-router-dom";
import { useAlerts } from "../../hooks/useAlerts";

export default function Alerts() {
  const { runId } = useParams<{ runId: string }>();
  const { alerts, loading, error } = useAlerts(runId!);

  if (loading) {
    return <p>Loading up alerts...</p>;
  }

  if (error) {
    return <p className="error-text">Uh oh, we've got an error: {error}</p>;
  }

  const errorCount = alerts.filter(alert => alert.severity === "error").length;
  const warningCount = alerts.filter(alert => alert.severity === "warning").length;
  const infoCount = alerts.filter(alert => alert.severity === "info").length;

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

        {alerts.length === 0 ? (
          <p className="no-alerts">No alerts found for this run.</p>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`alert-item ${alert.severity}`}>
              <span className="alert-message">{alert.message}</span>
              <span className="alert-severity">{alert.severity.toUpperCase()}</span>
              <span className="alert-timestamp">{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

