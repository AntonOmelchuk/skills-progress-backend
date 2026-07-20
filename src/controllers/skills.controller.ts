import type { Request, Response } from "express";
import prisma from "../../prisma/index.js";
import { SkillCategory } from "@prisma/client"; // Import the generated enum

export const createSkill = async (req: Request, res: Response) => {
  try {
    const { avatarId, name, description, category } = req.body;

    if (!avatarId) {
      res.status(400).json({ error: "avatarId is required" });
      return;
    }
    if (!name || typeof name !== "string") {
      res.status(400).json({ error: "Valid skill name is required" });
      return;
    }

    // Strict Enum Validation
    // This checks if the provided string exists inside the SkillCategory enum
    if (!category || !Object.values(SkillCategory).includes(category)) {
      res.status(400).json({
        error: `Invalid category. Allowed values: ${Object.values(SkillCategory).join(", ")}`,
      });
      return;
    }

    const newSkill = await prisma.skill.create({
      data: {
        avatarId,
        name,
        description: description || "",
        category,
      },
    });

    res.status(201).json(newSkill);
  } catch (error) {
    console.error("[ERROR] Failed to create skill:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSkillsByAvatarId = async (req: Request, res: Response) => {
  try {
    const { avatarId } = req.params;

    if (!avatarId || typeof avatarId !== "string") {
      res.status(400).json({ error: "Valid avatarId parameter is required" });
      return;
    }

    // Ask Prisma to find ALL skills that belong to this specific Avatar
    const skills = await prisma.skill.findMany({
      where: { avatarId },
    });

    // Even if the array is empty (character has no skills yet), we return a 200 OK
    res.status(200).json(skills);
  } catch (error) {
    console.error("[ERROR] Failed to fetch skills:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addExpToSkill = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The specific Skill ID
    const { expToAdd } = req.body;

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Valid skill ID parameter is required" });
      return;
    }

    // Strict validation: XP must be a positive number
    if (typeof expToAdd !== "number" || expToAdd <= 0) {
      res.status(400).json({ error: "expToAdd must be a positive number" });
      return;
    }

    // 1. Fetch the current skill stats from the database
    const currentSkill = await prisma.skill.findUnique({ where: { id } });

    if (!currentSkill) {
      res.status(404).json({ error: "Skill not found" });
      return;
    }

    // 2. Calculate the new values
    let newExp = currentSkill.exp + expToAdd;
    let newLevel = currentSkill.level;

    // 3. Level-up mechanic: 100 XP threshold
    while (newExp >= 100) {
      newLevel += 1;
      newExp -= 100; // Subtract the consumed XP
    }

    // 4. Save the updated stats back to the database
    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: {
        exp: newExp,
        level: newLevel,
      },
    });

    res.status(200).json(updatedSkill);
  } catch (error) {
    console.error("[ERROR] Failed to add EXP:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
