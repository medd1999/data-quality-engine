import { Download } from "lucide-react";
import "./DownloadButton.css";

export default function DownloadButton({ objectKey, label = "Download" }: { objectKey: string; label?: string }) {
  function handleDownload() {
    // Implement download logic here
    const url = `${import.meta.env.VITE_API_URL}/download/${objectKey}`;
  };

  return (
    <button className="download-button" onClick={handleDownload}>
      <Download size={16} />
      {label}
    </button>
  );
}
