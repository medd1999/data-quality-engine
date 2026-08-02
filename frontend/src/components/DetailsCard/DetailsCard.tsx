import "./DetailsCard.css";

export default function DetailsCard({ dataset }) {
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
        </div>
    );
}

