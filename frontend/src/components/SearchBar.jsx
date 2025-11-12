import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const allowedTypes = ["restaurant", "cafe", "store", "bar", "supermarket"];

const SearchBar = ({ onPlaceSelected }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const autocompleteServiceRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation(); 

    const initService = () => {
        if (!autocompleteServiceRef.current && window.google) {
            autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        }
    };

    useEffect(() => {
        setSearchTerm("");
        setSuggestions([]);
    }, [location.pathname]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (!value || !autocompleteServiceRef.current) {
            setSuggestions([]);
            return;
        }

        autocompleteServiceRef.current.getPlacePredictions(
            { input: value, types: ["establishment"] },
            (predictions, status) => {
                if (
                    status === window.google.maps.places.PlacesServiceStatus.OK &&
                    predictions
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
                onFocus={initService}
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
