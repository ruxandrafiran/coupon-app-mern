import api from "./api";

export const getCouponsByPlace = (placeId) =>
  api.get(`/coupons/place/${placeId}`);

export const createCoupon = (data) =>
  api.post(`/coupons`, data);

export const getUserCoupons = () =>
  api.get(`/coupons/my`);

export const updateCoupon = (id, data) =>
  api.put(`/coupons/${id}`, data);

export const deleteCoupon = (id) =>
  api.delete(`/coupons/${id}`);
