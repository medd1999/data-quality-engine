import { NavLink } from "react-router-dom";
import { Database, Upload, History, BarChart3, Bell } from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>SentinelDQ</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Database size={18} />
          <span>Datasets</span>
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Upload size={18} />
          <span>Upload</span>
        </NavLink>

        <NavLink
          to="/runs"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <History size={18} />
          <span>Run History</span>
        </NavLink>

        <NavLink
          to="/metrics"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <BarChart3 size={18} />
          <span>Metrics</span>
        </NavLink>

        <NavLink
          to="/alerts"
          className={({ isActive }) =>
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <Bell size={18} />
          <span>Alerts</span>
        </NavLink>
      </nav>
    </aside>
  );
}
