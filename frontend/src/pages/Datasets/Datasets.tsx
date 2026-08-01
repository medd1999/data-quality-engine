import "./Datasets.css";
import { useDatasets } from "../../hooks/useDatasets";
import DatasetsTable from "../../components/DatasetsTable/DatasetsTable";

export default function Datasets() {
  const { datasets, loading } = useDatasets();

  if (loading) {
    return <div className="datasets-loading">Loading datasets...</div>;
  }

  return (
    <div className="datasets-page">
      <h1 className="datasets-title">Datasets</h1>

      <DatasetsTable datasets={datasets} />
    </div>
  );
}
