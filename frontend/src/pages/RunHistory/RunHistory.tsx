import RunsTable from "../../components/RunsTable/RunsTable";
import { useRuns } from "../../hooks/useRuns";
import "./RunHistory.css";

export default function Runs() {
  const { runs, loading, error } = useRuns();

  if (loading) {
    return <p>Loading runs...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error loading runs: {error}</p>;
  }
  return (
    <div className="run-history-page">
      <h1 className="run-history-title">Run History</h1>
      <RunsTable runs={runs} />
    </div>
  );
}
