import { Sun, Moon, User, Search } from "lucide-react";
import "./Navbar.css";

export default function Navbar({onSearch}: {onSearch: (query: string) => void}) {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <h3 className="navbar-title">Dashboard</h3>
      </div>

      <div className="navbar-center">
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search datasets here..."
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
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
