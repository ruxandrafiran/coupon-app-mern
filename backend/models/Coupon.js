import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        place: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Place",
            required: true,
        },
        placeId: {
            type: String,
            required: true,
        },
        placeName: {
            type: String,
            required: true,
        },
        placeAddress: {
            type: String,
        },
        discountType: {
            type: String,
            enum: ["percent", "fixed"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
