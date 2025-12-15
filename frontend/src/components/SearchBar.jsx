import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadGoogleMaps } from "../utils/loadGoogleMaps";

const allowedTypes = ["restaurant", "cafe", "store", "bar", "supermarket"];

const SearchBar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const autocompleteServiceRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setSearchTerm("");
        setSuggestions([]);
    }, [location.pathname]);

    const ensureService = async () => {
        if (autocompleteServiceRef.current) return;

        const g = await loadGoogleMaps();
        autocompleteServiceRef.current =
            new g.maps.places.AutocompleteService();
    };

    const handleInputChange = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (!value) {
            setSuggestions([]);
            return;
        }

        await ensureService();
        if (!autocompleteServiceRef.current) return;

        autocompleteServiceRef.current.getPlacePredictions(
            { input: value, types: ["establishment"] },
            (predictions, status) => {
                if (
                    status === window.google.maps.places.PlacesServiceStatus.OK &&
                    Array.isArray(predictions)
                ) {
                    const filtered = predictions.filter((p) =>
                        p.types?.some((t) => allowedTypes.includes(t))
                    );
                    setSuggestions(filtered);
                } else {
                    setSuggestions([]);
                }
            }
        );
    };

    const handleSelect = (placeId, description) => {
        setSearchTerm(description);
        setSuggestions([]);
        navigate(`/location/${placeId}`);
    };

    return (
        <div className="autocomplete-container">
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder="Search for locations..."
                className="autocomplete-input"
            />

            {suggestions.length > 0 && (
                <ul className="autocomplete-suggestions">
                    {suggestions.map((s) => (
                        <li
                            key={s.place_id}
                            onClick={() => handleSelect(s.place_id, s.description)}
                        >
                            {s.description}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchBar;
