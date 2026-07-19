import { Router } from "express";
import { createAvatar } from "../controllers/avatar.controller.js"; // Note the .js extension

const router = Router();

// When a POST request hits this router, run the createAvatar function
router.post("/", createAvatar);

export default router;
