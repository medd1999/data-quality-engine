import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import RunDetails from "./components/RunDetails/RunDetails";

import Datasets from "./pages/Datasets/Datasets";
import Upload from "./pages/Upload/Upload";
import RunHistory from "./pages/RunHistory/RunHistory";
import Metrics from "./pages/Metrics/Metrics";
import MetricsHome from "./pages/Metrics/MetricsHome";
import Alerts from "./pages/Alerts/Alerts";
import DatasetsDetails from "./pages/DatasetsDetails/DatasetsDetails";
import { useState } from "react";

export default function App() {
  const [search, setQuery] = useState("");
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main>
          <Navbar onSearch={setQuery} />
          <Routes>
            <Route path="/" element={<Datasets search={search} />} />
            <Route path="/datasets/:id" element={<DatasetsDetails />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/runs" element={<RunHistory />} />
            <Route path="/runs/:id" element={<RunDetails />} />
            <Route path="/runs/:id/metrics" element={<Metrics />} />
            <Route path="/metrics" element={<MetricsHome />} />
            <Route path="/runs/:id/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
