import "./AlertsHome.css";
import { Link } from "react-router-dom";
import { useAllAlerts } from "../../hooks/useAllAlerts";

export default function AlertsHome() {
    const { alertsList, loading, error } = useAllAlerts();

    if (loading) return <p>Loading up alerts...</p>;
    if (error) return <p className="error-text">Uh-oh, we've got an error: {error}</p>;

    return (
        <div className="alerts-home">
            <h1 className="alerts-home-title">Alerts Dashboard</h1>

            <div className="alerts-grid">{alertsList.map((item) => (
                <div key={item.run_id} className="alerts-card">
                    <div className="alerts-card-header">
                        <h2>Run #{item.run_id}</h2>
                        <span className={`status-badge status-${item.status}`}>{item.status}</span>
                    </div>

                    <div className="alerts-card-body">
                        <p><strong>Dataset:</strong> {item.dataset_name}</p>
                        <p><strong>Total Alerts:</strong> {item.alerts.length}</p>

                        <div className="alerts-preview">
                            {item.alerts.slice(0, 3).map((alert, index) => (
                                <p key={index} className={`alert-line ${alert.severity}`}>
                                    {alert.severity.toUpperCase()}: {alert.message}
                                </p>
                            ))}
                        </div>
                    </div>

                    <div className="alerts-card-footer">
                        <Link to={`/runs/${item.run_id}/alerts`} className="view-alerts-btn">
                            View Alerts →
                        </Link>
                    </div>
                </div>
            ))}
            </div>
        </div>
    )
}