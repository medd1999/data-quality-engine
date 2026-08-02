import "./Datasets.css";
import { useDatasets } from "../../hooks/useDatasets";
import DatasetsTable from "../../components/DatasetsTable/DatasetsTable";

export default function Datasets({ search }: { search: string }) {
  const { datasets, loading } = useDatasets();

  const filteredDatasets = datasets.filter((dataset) =>
    dataset.name.toLowerCase().includes(search.toLowerCase()) ||
    dataset.file_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="datasets-loading">Loading datasets...</div>;
  }

  return (
    <div className="datasets-page">
      <h1 className="datasets-title">Datasets</h1>

      <DatasetsTable datasets={filteredDatasets} />
    </div>
  );
}
