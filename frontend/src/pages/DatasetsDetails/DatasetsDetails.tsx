import "./DatasetsDetails.css";
import { useParams } from "react-router-dom";
import { useSingleDataset } from "../../hooks/useSingleDataset";
import DetailsCard from "../../components/DetailsCard/DetailsCard";

export default function DatasetsDetails() {
    const { id } = useParams();
    const { dataset, loading } = useSingleDataset(id!);

    async function handleRunQualityCheck() {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/runs?dataset_id=${id}`, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to start quality check");
            }

            const data = await response.json();
            console.log("Commencing Quality Check:", data);
            alert("Quality check initiated successfully!");
        } catch (error) {
            console.error("Error commencing quality check:", error);
            alert("Error commencing quality check. Please try again.");
        }
    }

    if (loading) {
        return <div className="details-loading">Loading dataset...</div>
    }

    if (!dataset) {
        return <div className="details-error">Uh-oh, dataset not found!</div>
    }

    return (
        <div className="details-page">
            <h1 className="details-title">Dataset Details</h1>
            <DetailsCard dataset={dataset} />
            <button className="run-button" onClick={handleRunQualityCheck}>Run Quality Check</button>
        </div>
    );
}