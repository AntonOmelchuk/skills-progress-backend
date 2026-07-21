import type { Request, Response } from "express";
import prisma from "../../prisma/index.js";
import { generateDailyPlanWithAI } from "../services/ai.service.js";

export const generateTodayPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const avatar = await prisma.avatar.findUnique({
      where: { userId },
      include: { skills: true },
    });

    if (!avatar) {
      res.status(404).json({ error: "Avatar not found" });
      return;
    }

    if (!avatar.skills || avatar.skills.length === 0) {
      res
        .status(400)
        .json({ error: "Avatar has no skills. Add at least one skill first!" });
      return;
    }

    const now = new Date();
    const skillsData = avatar.skills.map((skill) => {
      const lastTrained = skill.lastTrainedAt
        ? new Date(skill.lastTrainedAt)
        : null;
      const daysInactive = lastTrained
        ? Math.floor(
            (now.getTime() - lastTrained.getTime()) / (1000 * 60 * 60 * 24),
          )
        : 999;

      return {
        skillId: skill.id,
        name: skill.name,
        category: skill.category,
        level: skill.level,
        exp: skill.exp,
        neededExpForLevelUp: 100 - skill.exp,
        daysInactive,
        status:
          daysInactive > 3
            ? "NEGLECTED"
            : daysInactive === 0
              ? "TRAINED_TODAY"
              : "STABLE",
      };
    });

    const aiPlan = await generateDailyPlanWithAI(avatar.name, skillsData);

    const createdPlan = await prisma.dailyPlan.create({
      data: {
        avatarId: avatar.id,
        summary: aiPlan.summary,
        tasks: {
          create: aiPlan.tasks.map((task) => ({
            skillId: task.skillId,
            title: task.title,
            description: task.description,
            durationMinutes: task.durationMinutes,
            expReward: task.expReward,
          })),
        },
      },
      include: {
        tasks: {
          include: { skill: true },
        },
      },
    });

    res.status(201).json(createdPlan);
  } catch (error) {
    console.error("[ERROR] Failed to generate daily plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getTodayPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req;

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const avatar = await prisma.avatar.findUnique({
      where: { userId },
    });

    if (!avatar) {
      res.status(404).json({ error: "Avatar not found" });
      return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const plan = await prisma.dailyPlan.findFirst({
      where: {
        avatarId: avatar.id,
        date: { gte: startOfDay },
      },
      include: {
        tasks: {
          include: { skill: true },
        },
      },
      orderBy: { date: "desc" },
    });

    res.json(plan || null);
  } catch (error) {
    console.error("[ERROR] Failed to fetch today plan:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
