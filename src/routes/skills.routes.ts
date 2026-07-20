import { Router } from "express";
import {
  createSkill,
  getSkillsByAvatarId,
  addExpToSkill,
} from "../controllers/skills.controller.js";

const router = Router();

router.post("/", createSkill);
router.get("/:avatarId", getSkillsByAvatarId);
router.patch("/:id/exp", addExpToSkill);

export default router;
