import { Router } from "express";
import {
  startSession,
  endSession,
} from "../controllers/sessions.controller.js";

const router = Router();

// Start a timer
router.post("/start", startSession);

// Stop the timer and calculate XP
router.patch("/:id/end", endSession);

export default router;
