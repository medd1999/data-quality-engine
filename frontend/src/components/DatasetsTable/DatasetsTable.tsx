import { Download } from "lucide-react";
import "./DatasetsTable.css";

interface Dataset {
  id: number;
  name: string;
  file_name: string;
  object_key: string;
  created_at: string;
}

export default function DatasetsTable({ datasets }: { datasets: Dataset[] }) {
  return (
    <table className="dataset-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>File</th>
          <th>Timestamp</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {datasets.map(ds => (
          <tr key={ds.id}>
            <td>{ds.name}</td>
            <td>{ds.file_name}</td>
            <td>{new Date(ds.created_at).toLocaleString()}</td>
            <td className="dataset-actions">
              <a href={`${import.meta.env.VITE_MINIO_URL}/${ds.object_key}`}
                download className="download-link">
                <Download size={16} />
                Download
              </a>

              <button onClick={() => window.location.href = `/datasets/${ds.id}`}>
                Details
              </button>
              <br />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
