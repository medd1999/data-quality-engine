import "./DetailsCard.css";

export default function DetailsCard({ dataset }) {
    function downloadDataset() {
        const url = `${import.meta.env.VITE_MINIO_URL}/${dataset.object_key}`;
        window.open(url, "_blank");
    }

    return (
        <div className="details-card">
            <div className="details-row">
                <span className="details-label">Name: </span>
                <span>{dataset.name}</span>
            </div>

            <div className="details-row">
                <span className="details-label">File: </span>
                <span>{dataset.file_name}</span>
            </div>

            <div className="details-row">
                <span className="details-label">Uploaded: </span>
                <span>{new Date(dataset.created_at).toLocaleString()}</span>
            </div>

            <div className="details-row">
                <span className="details-label">Object Key: </span>
                <span>{dataset.object_key}</span>
            </div>
            <br />

            <button className="details-download" onClick={downloadDataset}>
                Download File
            </button>
        </div>
    );
}

