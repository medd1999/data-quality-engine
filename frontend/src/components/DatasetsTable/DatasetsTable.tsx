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

  function formatDate(dateString: string) {
    const d = new Date(dateString);
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${month}/${day}/${year} at ${hours}:${minutes} ${ampm}`;
  }

  return (
    <div className="dataset-table-container">
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
              <td>{formatDate(ds.created_at)}</td>
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
    </div>
  );
}
