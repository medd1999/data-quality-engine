import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Upload from "./pages/Upload";
import Datasets from "./pages/Datasets";
import RunHistory from "./pages/RunHistory";
import Metrics from "./pages/Metrics";
import Alerts from "./pages/Alerts";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main>
          <Routes>
            <Route path="/" element={<Datasets />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/runs" element={<RunHistory />} />
            <Route path="/metrics/:runId" element={<Metrics />} />
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
