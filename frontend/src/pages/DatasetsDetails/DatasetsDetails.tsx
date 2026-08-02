import "./DatasetsDetails.css";
import { useParams } from "react-router-dom";
import { useSingleDataset } from "../../hooks/useSingleDataset";
import DetailsCard from "../../components/DetailsCard/DetailsCard";

export default function DatasetsDetails() {
    const { id } = useParams();
    const { dataset, loading } = useSingleDataset(id!);

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
        </div>
    );
}