import { Router } from "express";
import { createTask, completeTask } from "../controllers/tasks.controller.js";

const router = Router();

router.post("/", createTask);
router.patch("/:id/complete", completeTask);

export default router;
