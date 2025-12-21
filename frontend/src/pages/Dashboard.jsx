import React, { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import { deleteCoupon, getUserCoupons, updateCoupon } from "../api/coupons";

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

  const isExpired = (coupon) => {
    if (!coupon?.expiresAt) return false;
    const exp = new Date(coupon.expiresAt);
    exp.setHours(23, 59, 59, 999);
    return exp < new Date();
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

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({
      discountType: c.discountType || "percent",
      discountValue: c.discountValue ?? "",
      expiresAt: c.expiresAt ? String(c.expiresAt).slice(0, 10) : "",
      description: c.description || "",
    });
  };

  const handleSave = async (id) => {
    await updateCoupon(id, {
      discountType: form.discountType,
      discountValue: form.discountValue,
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

  const handleToggleUsed = async (coupon) => {
    await updateCoupon(coupon._id, { isActive: !coupon.isActive });
    await loadData();
  };

  const placesById = useMemo(() => {
    const map = new Map();
    (places || []).forEach((p) => map.set(p.placeId, p));
    return map;
  }, [places]);

  const filteredCoupons = useMemo(() => {
    let list = [...(coupons || [])];


    if (selectedPlaceId !== "all") {
      list = list.filter((c) => c.placeId === selectedPlaceId);
    }

    return list;
  }, [coupons, selectedPlaceId]);

  const sortByExpiryAsc = (list) =>
    [...list].sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));

  const sortByExpiryDesc = (list) =>
    [...list].sort((a, b) => new Date(b.expiresAt) - new Date(a.expiresAt));


  const activeGroupedByPlace = useMemo(() => {
    if (selectedPlaceId !== "all") return [];
    const map = new Map();
    const activeNonExpired = (coupons || []).filter((c) => c.isActive && !isExpired(c));

    activeNonExpired.forEach((c) => {
      const pid = c.placeId || "unknown";
      if (!map.has(pid)) {
        const p = placesById.get(pid);
        map.set(pid, {
          placeId: pid,
          name: c.placeName || p?.name || "Unknown location",
          address: c.placeAddress || p?.address || "",
          active: [],
        });
      }
      map.get(pid).active.push(c);
    });

    for (const bucket of map.values()) {
      bucket.active = sortByExpiryAsc(bucket.active);
    }

    return Array.from(map.values()).sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  }, [coupons, placesById, selectedPlaceId]);

  const usedCouponsBottom = useMemo(() => {
    const base = selectedPlaceId === "all" ? coupons || [] : filteredCoupons;
    const list = base.filter((c) => !c.isActive && !isExpired(c));
    return sortByExpiryAsc(list);
  }, [coupons, filteredCoupons, selectedPlaceId]);

  const expiredCouponsBottom = useMemo(() => {
    const base = selectedPlaceId === "all" ? coupons || [] : filteredCoupons;
    const list = base.filter((c) => isExpired(c));
    return sortByExpiryDesc(list);
  }, [coupons, filteredCoupons, selectedPlaceId]);

  const selectedPlaceMeta = useMemo(() => {
    if (selectedPlaceId === "all") return null;
    const p = placesById.get(selectedPlaceId);
    return {
      placeId: selectedPlaceId,
      name: p?.name || filteredCoupons?.[0]?.placeName || "Location",
      address: p?.address || filteredCoupons?.[0]?.placeAddress || "",
    };
  }, [selectedPlaceId, placesById, filteredCoupons]);

  const selectedBuckets = useMemo(() => {
    if (selectedPlaceId === "all") return null;
    const active = filteredCoupons.filter((c) => c.isActive && !isExpired(c));
    const used = filteredCoupons.filter((c) => !c.isActive && !isExpired(c));
    const expired = filteredCoupons.filter((c) => isExpired(c));
    return {
      active: sortByExpiryAsc(active),
      used: sortByExpiryAsc(used),
      expired: sortByExpiryDesc(expired),
    };
  }, [filteredCoupons, selectedPlaceId]);

  const formatDiscount = (c) => {
    if (c.discountType === "percent") return `${c.discountValue}% off`;
    return `${c.discountValue} lei off`;
  };

  const CouponCard = ({ c, variant }) => {
    const expired = isExpired(c);
    const used = !c.isActive;

    const cls = [
      "coupon-card",
      used ? "is-used" : "",
      expired ? "is-expired" : "",
      variant ? `variant-${variant}` : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cls}>
        <div className="coupon-main">
          <div className="coupon-title-row">
            <h4 className="coupon-title">{c.placeName}</h4>

            <div className="badges">
              {used && !expired ? <span className="badge badge-used">Used</span> : null}
              {expired ? <span className="badge badge-expired">Expired</span> : null}
            </div>
          </div>

          <p className="coupon-meta">
            <span className="pill">{formatDiscount(c)}</span>
            <span className="dot">•</span>
            <span>
              Expires: {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
            </span>
          </p>

          {c.description ? <p className="coupon-desc">{c.description}</p> : null}
        </div>

        <div className="coupon-actions">
          {editingId !== c._id ? (
            <>
              {!expired ? (
                <button
                  className={used ? "btn-secondary" : "btn-primary"}
                  onClick={() => handleToggleUsed(c)}
                  title={used ? "Mark as active" : "Mark as used"}
                >
                  {used ? "Mark as active" : "Mark as used"}
                </button>
              ) : null}

              <button className="btn-ghost" onClick={() => startEdit(c)}>
                Edit
              </button>
              <button className="btn-danger" onClick={() => handleDelete(c._id)}>
                Delete
              </button>
            </>
          ) : (
            <>
              <button className="btn-primary" onClick={() => handleSave(c._id)}>
                Save
              </button>
              <button className="btn-ghost" onClick={cancelEdit}>
                Cancel
              </button>
            </>
          )}
        </div>

        {editingId === c._id ? (
          <div className="coupon-edit">
            <div className="edit-grid">
              <select
                value={form.discountType}
                onChange={(e) => setForm((prev) => ({ ...prev, discountType: e.target.value }))}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed (lei)</option>
              </select>

              <input
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((prev) => ({ ...prev, discountValue: e.target.value }))}
                placeholder="Discount value"
                required
              />

              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((prev) => ({ ...prev, expiresAt: e.target.value }))}
                required
              />

              <input
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description (optional)"
              />
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="manage-coupons">
      <div className="manage-header">
        <div>
          <h2>Manage coupons</h2>
        </div>

        <div className="filter-bar">
          <select value={selectedPlaceId} onChange={(e) => setSelectedPlaceId(e.target.value)}>
            <option value="all">All locations</option>
            {(places || []).map((p) => (
              <option key={p.placeId} value={p.placeId}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPlaceId === "all" ? (
        <>
          {activeGroupedByPlace.length === 0 ? (
            <div className="empty-state">
              <p>No active coupons found.</p>
            </div>
          ) : (
            activeGroupedByPlace.map((bucket) => (
              <section key={bucket.placeId} className="place-section">
                <header className="place-header">
                  <div>
                    <h3 className="place-name">{bucket.name}</h3>
                    {bucket.address ? <p className="place-address">{bucket.address}</p> : null}
                  </div>
                </header>

                <div className="place-body">
                  <div className="bucket">
                    <h4 className="bucket-title">Active:</h4>
                    {bucket.active.length === 0 ? (
                      <p className="bucket-empty">No active coupons found.</p>
                    ) : (
                      <div className="coupon-grid">
                        {bucket.active.map((c) => (
                          <CouponCard key={c._id} c={c} variant="active" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            ))
          )}

          <section className="used-section">
            <header className="used-header">
              <h3>Used coupons</h3>
            </header>

            {usedCouponsBottom.length === 0 ? (
              <p className="bucket-empty">No used coupons found.</p>
            ) : (
              <div className="coupon-grid">
                {usedCouponsBottom.map((c) => (
                  <CouponCard key={c._id} c={c} variant="used" />
                ))}
              </div>
            )}
          </section>

          <section className="expired-section">
            <header className="expired-header">
              <h3>Expired coupons</h3>
            </header>

            {expiredCouponsBottom.length === 0 ? (
              <p className="bucket-empty">No expired coupons found.</p>
            ) : (
              <div className="coupon-grid">
                {expiredCouponsBottom.map((c) => (
                  <CouponCard key={c._id} c={c} variant="expired" />
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <section className="place-section">
          <header className="place-header">
            <div>
              <h3 className="place-name">{selectedPlaceMeta?.name}</h3>
              {selectedPlaceMeta?.address ? (
                <p className="place-address">{selectedPlaceMeta.address}</p>
              ) : null}
            </div>
          </header>

          <div className="place-body">
            <div className="bucket">
              <h4 className="bucket-title">Active:</h4>
              {selectedBuckets?.active?.length ? (
                <div className="coupon-grid">
                  {selectedBuckets.active.map((c) => (
                    <CouponCard key={c._id} c={c} variant="active" />
                  ))}
                </div>
              ) : (
                <p className="bucket-empty">No active coupons found.</p>
              )}
            </div>

            <div className="bucket">
              <h4 className="bucket-title">Used:</h4>
              {selectedBuckets?.used?.length ? (
                <div className="coupon-grid">
                  {selectedBuckets.used.map((c) => (
                    <CouponCard key={c._id} c={c} variant="used" />
                  ))}
                </div>
              ) : (
                <p className="bucket-empty">No used coupons found.</p>
              )}
            </div>

            <div className="bucket">
              <h4 className="bucket-title">Expired:</h4>
              {selectedBuckets?.expired?.length ? (
                <div className="coupon-grid">
                  {selectedBuckets.expired.map((c) => (
                    <CouponCard key={c._id} c={c} variant="expired" />
                  ))}
                </div>
              ) : (
                <p className="bucket-empty">No expired coupons found.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
