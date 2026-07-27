import { useState } from "react";
import "./Upload.css";

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

      console.log("STATUS:", res.status);
      console.log("HEADERS:", res.headers);
      console.log("CONTENT-TYPE:", res.headers.get("content-type"));
      console.log("CONTENT-LENGTH:", res.headers.get("content-length"));
      console.log("ACCESS-CONTROL:", res.headers.get("access-control-allow-origin"));

      const raw = await res.text();
      console.log("RAW RESPONSE:", raw);

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      setStatus("success");
      setFile(null);
      setDatasetName("");

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setStatus("error");
    }
  }

  return (
    <div className="upload-container">
      <h2 className="upload-title">Upload Dataset</h2>

      <div className="upload-card">
        <label>Dataset Name</label>
        <input
          type="text"
          placeholder="e.g. customer_churn"
          value={datasetName}
          onChange={(e) => setDatasetName(e.target.value)}
        />
        <br></br><br></br>
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
