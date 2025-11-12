import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/main.scss";

const LocationPage = () => {
    const { placeId } = useParams();
    const [location, setLocation] = useState(null);

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
                    "types"
                ],
            },
            (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    setLocation(place);
                } else {
                    console.error("Error fetching place details:", status);
                }
            }
        );
    }, [placeId]);

    if (!location) return <p className="loading">Loading...</p>;

    return (
        <div className="location-page">
            <h2 className="location-name">{location.name}</h2>
            <p className="location-address">Address: {location.formatted_address}</p>

            {location.formatted_phone_number && (
                <p className="location-phone">
                    Phone: {location.formatted_phone_number}
                </p>
            )}

            {location.website && (
                <p className="location-website">
                    Website:{" "}
                    <a
                        href={location.website}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {location.website}
                    </a>
                </p>
            )}

            {location.rating && (
                <p className="location-rating">Rating: {location.rating}</p>
            )}

            {location.opening_hours && location.opening_hours.weekday_text && (
                <div className="location-hours">
                    <h4>Hours:</h4>
                    <ul>
                        {location.opening_hours.weekday_text.map((day, i) => (
                            <li key={i}>{day}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button className="add-coupon-btn">Add Coupon</button>
        </div>
    );
};

export default LocationPage;
