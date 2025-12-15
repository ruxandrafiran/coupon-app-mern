import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import AddCouponForm from "../components/AddCouponForm";
import { getCouponsByPlace, createCoupon } from "../api/coupons";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

export default function LocationPage() {
    const { placeId } = useParams();
    const [location, setLocation] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loadingPlace, setLoadingPlace] = useState(true);

    useEffect(() => {
        if (!placeId) return;

        let cancelled = false;
        setLoadingPlace(true);

        loadGoogleMaps()
            .then((g) => {
                if (cancelled) return;

                const service = new g.maps.places.PlacesService(
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
                        if (cancelled) return;

                        if (status === g.maps.places.PlacesServiceStatus.OK) {
                            setLocation(place);
                        } else {
                            setLocation(null);
                        }
                        setLoadingPlace(false);
                    }
                );
            })
            .catch(() => {
                if (!cancelled) {
                    setLocation(null);
                    setLoadingPlace(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [placeId]);

    useEffect(() => {
        if (!placeId) return;
        getCouponsByPlace(placeId).then((res) => setCoupons(res.data || []));
    }, [placeId]);

    const handleCreateCoupon = (data) => {
        createCoupon({
            ...data,
            placeTypes: location?.types || [],
        }).then(() => {
            setShowForm(false);
            getCouponsByPlace(placeId).then((res) => setCoupons(res.data || []));
        });
    };

    const ratingStars = useMemo(() => {
        const r = location?.rating;
        if (!r || typeof r !== "number") return null;
        const full = Math.round(r);
        return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
    }, [location]);

    if (loadingPlace) return <div className="loading">Loading...</div>;
    if (!location) return <div className="loading">Location not found.</div>;

    return (
        <div className="location-page">
            <h2 className="location-name">{location.name}</h2>
            <p className="location-address">{location.formatted_address}</p>

            {location.formatted_phone_number && (
                <p className="location-phone">
                    <strong>Phone:</strong> {location.formatted_phone_number}
                </p>
            )}

            {location.website && (
                <p className="location-website">
                    <strong>Website:</strong>{" "}
                    <a href={location.website} target="_blank" rel="noopener noreferrer">
                        {location.website}
                    </a>
                </p>
            )}

            {location.rating && (
                <p className="location-rating">
                    <strong>Rating:</strong> {location.rating}{" "}
                    {ratingStars ? <span className="stars">({ratingStars})</span> : null}
                </p>
            )}

            {location.opening_hours?.weekday_text?.length > 0 && (
                <div className="location-hours">
                    <h4>Hours</h4>
                    <ul>
                        {location.opening_hours.weekday_text.map((day, i) => (
                            <li key={i}>{day}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button className="add-coupon-btn" onClick={() => setShowForm((v) => !v)}>
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
