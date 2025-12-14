import express from "express";
import {
    createCoupon,
    getCouponsByPlace,
    getUserCoupons,
    updateCoupon,
    deleteCoupon,
} from "../controllers/couponController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createCoupon);
router.get("/my", protect, getUserCoupons);
router.get("/place/:placeId", protect, getCouponsByPlace);
router.put("/:id", protect, updateCoupon);
router.delete("/:id", protect, deleteCoupon);

export default router;
