import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Datasets from "./pages/Datasets";
import Upload from "./pages/Upload";
import RunHistory from "./pages/RunHistory";
import Metrics from "./pages/Metrics";
import Alerts from "./pages/Alerts";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main>
          <Navbar />
          <Routes>
            <Route path="/" element={<Datasets />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/runs" element={<RunHistory />} />
            <Route path="/metrics" element={<Metrics />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
