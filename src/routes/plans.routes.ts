import { Router } from "express";
import {
  generateTodayPlan,
  getTodayPlan,
} from "../controllers/plans.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/today", getTodayPlan);
router.post("/generate-today", generateTodayPlan);

export default router;
