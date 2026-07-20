import { Router } from "express";
// Update this line to import both functions:
import {
  createAvatar,
  getAvatarByUid,
} from "../controllers/avatar.controller.js";

const router = Router();

router.post("/", createAvatar);

// Add this line. The :authUid acts as a dynamic variable in the URL.
router.get("/:authUid", getAvatarByUid);

export default router;
