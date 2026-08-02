import "./DatasetsDetails.css";
import { useParams } from "react-router-dom";
import { useDatasets } from "../../hooks/useDatasets";
import DetailsCard from "../../components/DetailsCard/DetailsCard";

export default function DatasetsDetails() {
    const { id } = useParams();
    const { datasets, loading } = useDatasets();

    if (loading) {
        return <div className="details-loading">Loading dataset...</div>
    }

    if (!datasets) {
        return <div className="details-error">Uh-oh, dataset not found!</div>
    }

    return (
        <div className="details-page">
            <h1 className="details-title">Dataset Details</h1>
            <DetailsCard dataset={datasets} />
        </div>
    );
}