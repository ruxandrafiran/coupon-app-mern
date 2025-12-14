import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AddCouponForm from "../components/AddCouponForm";
import { getCouponsByPlace, createCoupon } from "../api/coupons";

export default function LocationPage() {
    const { placeId } = useParams();
    const [location, setLocation] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!placeId || !window.google) return;

        const service = new window.google.maps.places.PlacesService(
            document.createElement("div")
        );

        service.getDetails(
            {
                placeId,
                fields: [
                    "name",
                    "formatted_address",
                    "formatted_phone_number",
                    "website",
                    "rating",
                    "opening_hours",
                    "geometry",
                    "types",
                ],
            },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setLocation(place);
                }
            }
        );
    }, [placeId]);

    useEffect(() => {
        if (!placeId) return;
        getCouponsByPlace(placeId).then((res) => {
            setCoupons(res.data);
        });
    }, [placeId]);

    const handleCreateCoupon = (data) => {
        createCoupon({
            ...data,
            placeTypes: location?.types || []
        }).then(() => {
            setShowForm(false);
            getCouponsByPlace(placeId).then((res) => setCoupons(res.data));
        });
    };

    if (!location) return <div>Loading...</div>;

    return (
        <div className="location-page">
            <h2>{location.name}</h2>
            <p>{location.formatted_address}</p>

            <button onClick={() => setShowForm(!showForm)}>
                {showForm ? "Cancel" : "Add coupon"}
            </button>

            {showForm && (
                <AddCouponForm
                    placeId={placeId}
                    placeName={location.name}
                    placeAddress={location.formatted_address}
                    onSubmit={handleCreateCoupon}
                />
            )}

            <h3>Coupons</h3>

            {coupons.length === 0 && <p>No coupons yet for this place.</p>}

            <div className="coupon-list">
                {coupons.map((c) => (
                    <div key={c._id} className="coupon-card">
                        <h4>
                            {c.discountType === "percent"
                                ? `${c.discountValue}% off`
                                : `${c.discountValue} lei off`}
                        </h4>
                        <p>Expires: {new Date(c.expiresAt).toLocaleDateString()}</p>
                        {c.description && <p>{c.description}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
}
