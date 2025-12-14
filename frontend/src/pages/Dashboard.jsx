import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { getUserCoupons, updateCoupon, deleteCoupon } from "../api/coupons";

export default function Dashboard() {
    const [coupons, setCoupons] = useState([]);
    const [places, setPlaces] = useState([]);
    const [selectedPlaceId, setSelectedPlaceId] = useState("all");
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        discountType: "percent",
        discountValue: "",
        expiresAt: "",
        description: "",
    });

    const loadData = async () => {
        const [cRes, pRes] = await Promise.all([
            getUserCoupons(),
            api.get("/places/with-coupons"),
        ]);
        setCoupons(cRes.data || []);
        setPlaces(pRes.data || []);
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredCoupons = useMemo(() => {
        if (selectedPlaceId === "all") return coupons;
        return coupons.filter((c) => c.placeId === selectedPlaceId);
    }, [coupons, selectedPlaceId]);

    const startEdit = (c) => {
        setEditingId(c._id);
        setForm({
            discountType: c.discountType,
            discountValue: c.discountValue,
            expiresAt: (c.expiresAt || "").slice(0, 10),
            description: c.description || "",
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setForm({
            discountType: "percent",
            discountValue: "",
            expiresAt: "",
            description: "",
        });
    };

    const saveEdit = async (id) => {
        await updateCoupon(id, {
            discountType: form.discountType,
            discountValue: Number(form.discountValue),
            expiresAt: form.expiresAt,
            description: form.description,
        });
        await loadData();
        cancelEdit();
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Delete this coupon?");
        if (!ok) return;
        await deleteCoupon(id);
        await loadData();
    };

    return (
        <div className="manage-coupons">
            <h2>Manage coupons</h2>

            <div className="filter-bar">
                <select
                    value={selectedPlaceId}
                    onChange={(e) => setSelectedPlaceId(e.target.value)}
                >
                    <option value="all">All locations</option>
                    {places.map((p) => (
                        <option key={p.placeId} value={p.placeId}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {filteredCoupons.length === 0 && <p>No coupons found.</p>}

            {filteredCoupons.map((c) => {
                const isEditing = editingId === c._id;

                return (
                    <div key={c._id} className="coupon-item">
                        <div className="info">
                            <h4>{c.placeName}</h4>
                            <p>
                                {c.discountType === "percent"
                                    ? `${c.discountValue}% off`
                                    : `${c.discountValue} lei off`}{" "}
                                · Expires: {new Date(c.expiresAt).toLocaleDateString()}
                            </p>
                            {c.description ? <p>{c.description}</p> : null}
                        </div>

                        <div className="actions">
                            {!isEditing ? (
                                <>
                                    <button className="edit-btn" onClick={() => startEdit(c)}>
                                        Edit
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(c._id)}>
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="edit-btn" onClick={() => saveEdit(c._id)}>
                                        Save
                                    </button>
                                    <button className="delete-btn" onClick={cancelEdit}>
                                        Cancel
                                    </button>
                                </>
                            )}
                        </div>

                        {isEditing ? (
                            <div style={{ width: "100%", marginTop: "12px" }}>
                                <div style={{ display: "grid", gap: "10px" }}>
                                    <select
                                        value={form.discountType}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, discountType: e.target.value }))
                                        }
                                    >
                                        <option value="percent">Percent</option>
                                        <option value="fixed">Fixed</option>
                                    </select>

                                    <input
                                        type="number"
                                        value={form.discountValue}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, discountValue: e.target.value }))
                                        }
                                        placeholder="Discount value"
                                        required
                                    />

                                    <input
                                        type="date"
                                        value={form.expiresAt}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, expiresAt: e.target.value }))
                                        }
                                        required
                                    />

                                    <textarea
                                        value={form.description}
                                        onChange={(e) =>
                                            setForm((prev) => ({ ...prev, description: e.target.value }))
                                        }
                                        placeholder="Description (optional)"
                                    />
                                </div>
                            </div>
                        ) : null}
                    </div>
                );
            })}
        </div>
    );
}
