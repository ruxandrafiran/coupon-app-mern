import Coupon from "../models/Coupon.js";
import Place from "../models/Place.js";


const findOrCreatePlace = async ({ placeId, name, address, types }) => {
    let place = await Place.findOne({ placeId });
    if (!place) {
        place = await Place.create({
            placeId,
            name,
            address,
            types,
        });
    }
    return place;
};


export const createCoupon = async (req, res) => {
    try {
        const {
            placeId,
            placeName,
            placeAddress,
            placeTypes,
            discountType,
            discountValue,
            description,
            expiresAt,
        } = req.body;

        if (!placeId || !placeName || !discountType || !discountValue || !expiresAt) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const place = await findOrCreatePlace({
            placeId,
            name: placeName,
            address: placeAddress,
            types: placeTypes,
        });

        const coupon = await Coupon.create({
            user: req.user._id,
            place: place._id,
            placeId,
            placeName,
            placeAddress,
            discountType,
            discountValue,
            description: description || "",
            expiresAt,
        });

        return res.status(201).json(coupon);
    } catch (err) {
        console.error("createCoupon error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};


export const getCouponsByPlace = async (req, res) => {
    try {
        const { placeId } = req.params;

        const coupons = await Coupon.find({
            user: req.user._id,
            placeId,
            isActive: true,
        }).sort({ expiresAt: 1 });

        return res.json(coupons);
    } catch (err) {
        console.error("getCouponsByPlace error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};


export const getUserCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({ user: req.user._id }).sort({
            expiresAt: 1,
        });
        return res.json(coupons);
    } catch (err) {
        console.error("getUserCoupons error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};


export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        if (coupon.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this coupon" });
        }

        const allowedFields = [
            "discountType",
            "discountValue",
            "description",
            "expiresAt",
            "isActive",
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                coupon[field] = req.body[field];
            }
        });

        const updated = await coupon.save();
        return res.json(updated);
    } catch (err) {
        console.error("updateCoupon error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};


export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        if (coupon.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this coupon" });
        }

        await coupon.deleteOne();
        return res.json({ message: "Coupon deleted" });
    } catch (err) {
        console.error("deleteCoupon error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
};
