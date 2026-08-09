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

      <table className="alerts-table">
        <thead>
          <tr>
            <th>Severity</th>
            <th>Message</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(alert => (
            <tr key={alert.id ?? `${alert.severity}-${alert.timestamp}`} className={`alerts-row ${alert.severity}`}>
              <td className="alert-severity">{(alert.severity ?? "unknown").toUpperCase()}</td>
              <td className="alert-message">{alert.message ?? "No message"}</td>
              <td className="alert-timestamp">{alert.timestamp ? formatDate(alert.timestamp) : "Unknown"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

