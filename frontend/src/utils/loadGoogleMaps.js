let googleMapsPromise = null;

export function loadGoogleMaps() {
    if (window.google && window.google.maps && window.google.maps.places) {
        return Promise.resolve(window.google);
    }

    if (googleMapsPromise) return googleMapsPromise;

    const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    if (!key) {
        return Promise.reject(new Error("Missing REACT_APP_GOOGLE_MAPS_API_KEY"));
    }

    googleMapsPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[data-google-maps="true"]');
        if (existing) {
            existing.addEventListener("load", () => resolve(window.google));
            existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps")));
            return;
        }

        const script = document.createElement("script");
        script.dataset.googleMaps = "true";
        script.async = true;
        script.defer = true;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
            key
        )}&libraries=places`;

        script.onload = () => resolve(window.google);
        script.onerror = () => reject(new Error("Failed to load Google Maps"));

        document.head.appendChild(script);
    });

    return googleMapsPromise;
}
