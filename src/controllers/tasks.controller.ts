import type { Request, Response } from "express";
import prisma from "../../prisma/index.js";

export const createTask = async (req: Request, res: Response) => {
  console.log("start");
  try {
    const { skillId, title, expReward } = req.body;
    console.log("skillId", skillId);
    console.log("title", title);
    console.log("expReward", expReward);
    // Strict validation for relationships and types
    if (!skillId || typeof skillId !== "string") {
      res
        .status(400)
        .json({ error: "Valid skillId is required to assign a task" });
      return;
    }
    if (!title || typeof title !== "string") {
      res.status(400).json({ error: "Valid task title is required" });
      return;
    }
    if (typeof expReward !== "number" || expReward <= 0) {
      res.status(400).json({ error: "expReward must be a positive number" });
      return;
    }

    // Ask Prisma to create the mission
    const newTask = await prisma.task.create({
      data: {
        skillId,
        title,
        expReward,
        isCompleted: false,
      },
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("[ERROR] Failed to create task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const completeTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The ID of the Task

    // validation block:
    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Valid task ID parameter is required" });
      return;
    }

    // 1. Fetch the task to verify it exists and isn't already done
    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }
    if (task.isCompleted) {
      res.status(400).json({ error: "Task is already completed" });
      return;
    }

    // 2. Fetch the associated Skill to get current XP and Level
    const skill = await prisma.skill.findUnique({
      where: { id: task.skillId },
    });
    if (!skill) {
      res.status(404).json({ error: "Associated skill not found" });
      return;
    }

    // 3. Calculate new stats
    let newExp = skill.exp + task.expReward;
    let newLevel = skill.level;

    while (newExp >= 100) {
      newLevel += 1;
      newExp -= 100;
    }

    // 4. The Transaction: Mark task done AND update skill safely
    const [updatedTask, updatedSkill] = await prisma.$transaction([
      prisma.task.update({
        where: { id },
        data: { isCompleted: true },
      }),
      prisma.skill.update({
        where: { id: skill.id },
        data: { exp: newExp, level: newLevel, lastTrainedAt: new Date() }, // Reset decay timer
      }),
    ]);

    res.status(200).json({ task: updatedTask, skill: updatedSkill });
  } catch (error) {
    console.error("[ERROR] Failed to complete task:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
