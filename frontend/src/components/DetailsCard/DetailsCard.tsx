import "./DetailsCard.css";

export default function DetailsCard({ dataset }) {
    return (
        <div className="details-card">
            <div className="details-row">
                <span className="details-label"><strong>Name: </strong></span>
                <span>{dataset.name}</span>
            </div>

            <div className="details-row">
                <span className="details-label"><strong>File: </strong></span>
                <span>{dataset.file_name}</span>
            </div>

            <div className="details-row">
                <span className="details-label"><strong>Uploaded: </strong></span>
                <span>{new Date(dataset.created_at).toLocaleString()}</span>
            </div>

            <div className="details-row">
                <span className="details-label"><strong>Object Key: </strong></span>
                <span>{dataset.object_key}</span>
            </div>
            <br />
        </div>
    );
}

