import { Router } from "express";
import {
  createAvatar,
  getDashboard,
} from "../controllers/avatar.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createAvatar);

// Protected route
router.get("/me/dashboard", protect, getDashboard);

export default router;
