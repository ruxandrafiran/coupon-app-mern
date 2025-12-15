import React, { useState } from "react";

export default function AddCouponForm({ placeId, placeName, placeAddress, onSubmit }) {
    const [discountType, setDiscountType] = useState("percent");
    const [discountValue, setDiscountValue] = useState("");
    const [expiresAt, setExpiresAt] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            placeId,
            placeName,
            placeAddress,
            discountType,
            discountValue,
            expiresAt,
            description,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="add-coupon-form">
            <select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
            </select>

            <input
                type="number"
                placeholder="Discount value"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
            />

            <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                required
            />

            <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            <button type="submit">Save Coupon</button>
        </form>
    );
}
