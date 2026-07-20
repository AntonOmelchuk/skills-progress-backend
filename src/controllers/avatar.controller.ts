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

export const getAvatarByUid = async (req: Request, res: Response) => {
  try {
    // Extract the UID from the URL parameters
    const { authUid } = req.params;

    // 1. Strict Validation (Type Guard)
    // If it's missing, or if it's an array, reject the request immediately.
    if (!authUid || typeof authUid !== "string") {
      res.status(400).json({ error: "Valid authUid parameter is required" });
      return;
    }

    // Ask Prisma to find the unique record matching this UID
    // 2. TypeScript guarantees authUid is a pure string here
    const avatar = await prisma.avatar.findUnique({
      where: { authUid },
    });

    // If no avatar exists, return a 404 (this tells the frontend to show character creation)
    if (!avatar) {
      res.status(404).json({ message: "Avatar not found" });
      return;
    }

    // If found, send it back!
    res.status(200).json(avatar);
  } catch (error) {
    console.error("[ERROR] Failed to fetch avatar:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
