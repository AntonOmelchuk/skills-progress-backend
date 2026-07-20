import type { Request, Response } from "express";
import prisma from "../../prisma/index.js";

export const startSession = async (req: Request, res: Response) => {
  try {
    const { skillId } = req.body;

    if (!skillId || typeof skillId !== "string") {
      res
        .status(400)
        .json({ error: "Valid skillId is required to start a session" });
      return;
    }

    // Prisma automatically sets startTime to now()
    const session = await prisma.studySession.create({
      data: { skillId },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("[ERROR] Failed to start session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const endSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // The ID of the StudySession

    if (!id || typeof id !== "string") {
      res.status(400).json({ error: "Valid session ID is required" });
      return;
    }

    // 1. Fetch the session and verify it hasn't already been ended
    const session = await prisma.studySession.findUnique({ where: { id } });

    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }
    if (session.endTime) {
      res
        .status(400)
        .json({ error: "This session has already been completed" });
      return;
    }

    // 2. Fetch the associated Skill
    const skill = await prisma.skill.findUnique({
      where: { id: session.skillId },
    });
    if (!skill) {
      res.status(404).json({ error: "Associated skill not found" });
      return;
    }

    // 3. Calculate Time and XP
    const endTime = new Date();
    const durationMs = endTime.getTime() - session.startTime.getTime();
    const durationMinutes = Math.floor(durationMs / 1000 / 60);

    // 10 XP per minute. If less than a minute (for testing), grant 1 XP.
    const earnedExp = durationMinutes > 0 ? durationMinutes * 10 : 1;

    // 4. Level-up Math
    let newExp = skill.exp + earnedExp;
    let newLevel = skill.level;

    while (newExp >= 100) {
      newLevel += 1;
      newExp -= 100;
    }

    // 5. The Transaction: Stamp the end time AND update the skill
    const [updatedSession, updatedSkill] = await prisma.$transaction([
      prisma.studySession.update({
        where: { id },
        data: { endTime, earnedExp },
      }),
      prisma.skill.update({
        where: { id: skill.id },
        data: { exp: newExp, level: newLevel },
      }),
    ]);

    res.status(200).json({ session: updatedSession, skill: updatedSkill });
  } catch (error) {
    console.error("[ERROR] Failed to end session:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
