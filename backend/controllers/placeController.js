import Place from "../models/Place.js";
import Coupon from "../models/Coupon.js";


export const createOrGetPlace = async (req, res) => {
    try {
        const { placeId, name, address, types } = req.body;

        if (!placeId || !name) {
            return res.status(400).json({ message: "placeId and name are required" });
        }

        let place = await Place.findOne({ placeId });
        if (!place) {
            place = await Place.create({
                placeId,
                name,
                address,
                types,
            });
        }

        return res.json(place);
    } catch (err) {
        console.error("createOrGetPlace error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};

export const getUserPlacesWithCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ user: req.user._id }).populate("place");
        const map = new Map();

        coupons.forEach((c) => {
            const key = c.placeId || (c.place && c.place.placeId);
            if (!key) return;

            if (!map.has(key)) {
                map.set(key, {
                    placeId: key,
                    name: c.placeName || c.place?.name,
                    address: c.placeAddress || c.place?.address || "",
                });
            }
        });

        return res.json(Array.from(map.values()));
    } catch (err) {
        console.error("getUserPlacesWithCoupons error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};
