import express from "express";
import {
    createOrGetPlace,
    getUserPlacesWithCoupons,
} from "../controllers/placeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrGetPlace);

router.get("/with-coupons", protect, getUserPlacesWithCoupons);

export default router;
