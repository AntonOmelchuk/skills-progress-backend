import type { Request, Response } from "express";
import prisma from "../../prisma/index.js";

export const createAvatar = async (req: Request, res: Response) => {
  try {
    const { authUid, name, theme } = req.body;

    if (!authUid) {
      res.status(400).json({ error: "authUid is required" });
      return;
    }

    // 1. Ask Prisma to insert a new record into the Avatar table
    const newAvatar = await prisma.avatar.create({
      data: {
        authUid, // This will come from Firebase later
        name: name || "V",
        theme: theme || "cyberpunk-dark",
      },
    });

    // 2. Send the created Avatar back to the frontend
    res.status(201).json(newAvatar);
  } catch (error) {
    console.error("[ERROR] Failed to create avatar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
