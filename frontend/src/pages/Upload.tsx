import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetName, setDatasetName] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");

  async function handleUpload() {
    if (!file || !datasetName) return;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("dataset_name", datasetName);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/datasets`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setStatus("success");
      setFile(null);
      setDatasetName("");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div className="upload-container">
      <h2>Upload Dataset</h2>

      <div className="upload-card">
        <label>Dataset Name</label>
        <input
          type="text"
          placeholder="e.g. customer_churn"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
        />

        <label>File (CSV or JSON)</label>
        <input
          type="file"
          accept=".csv,.json"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          disabled={!file || !datasetName || status === "uploading"}
          onClick={handleUpload}
        >
          {status === "uploading" ? "Uploading..." : "Upload Dataset"}
        </button>

        {status === "success" && <p className="success">Upload successful!</p>}
        {status === "error" && <p className="error">Upload failed. Try again.</p>}
      </div>
    </div>
  );
}
