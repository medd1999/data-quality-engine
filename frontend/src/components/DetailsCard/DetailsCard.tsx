import "./DetailsCard.css";

export default function DetailsCard({ dataset }) {

    function formatDate(dateString: string) {
        const d = new Date(dateString);
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const year = d.getFullYear();
        const hours = d.getHours();
        const minutes = d.getMinutes().toString().padStart(2, "0");

        return `${month}/${day}/${year} at ${hours}:${minutes}`;
    }

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
                <span>{formatDate(dataset.created_at)}</span>
            </div>

            <div className="details-row">
                <span className="details-label"><strong>Object Key: </strong></span>
                <span>{dataset.object_key}</span>
            </div>
            <br />
        </div>
    );
}

