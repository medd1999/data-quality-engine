import "./DatasetsTable.css";

interface Dataset {
  id: number;
  name: string;
  file_name: string;
  object_key: string;
  created_at: string;
}

export default function DatasetTable({ datasets }: { datasets: Dataset[] }) {
  function downloadDataset(objectKey: string) {
    const url = `${import.meta.env.VITE_MINIO_URL}/${objectKey}`;
    window.open(url, "_blank");
  }

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
              <button onClick={() => downloadDataset(ds.object_key)}>
                Download
              </button>

              <button onClick={() => window.location.href = `/datasets/${ds.id}`}>
                Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
