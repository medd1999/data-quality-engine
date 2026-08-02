import { Download } from "lucide-react";
import "./DownloadButton.css";

export default function DownloadButton({ objectKey, label = "Download" }: { objectKey: string; label?: string }) {
  function handleDownload() {
    const url = `${import.meta.env.VITE_API_URL}/${objectKey}`;

    const link = document.createElement("a");
    link.href = url;
    link.download = objectKey.split("/").pop() || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button className="download-btn" onClick={handleDownload}>
      <Download size={16} />
      {label}
    </button>
  );
}
