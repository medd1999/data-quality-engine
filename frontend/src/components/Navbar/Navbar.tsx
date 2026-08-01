import { Sun, Moon, User } from "lucide-react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h3 className="navbar-title">Dashboard</h3>
      </div>

      <div className="navbar-right">
        <button className="icon-btn">
          <Sun size={18} />
        </button>

        <button className="icon-btn">
          <User size={18} />
        </button>
      </div>
    </header>
  );
}
