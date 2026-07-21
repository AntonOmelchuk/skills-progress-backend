import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is missing from environment variables");
}

const ai = new GoogleGenAI({ apiKey });

export interface GeneratedTask {
  skillId: string;
  title: string;
  description: string;
  durationMinutes: number;
  expReward: number;
}

export interface GeneratedDailyPlan {
  summary: string;
  tasks: GeneratedTask[];
}

export const generateDailyPlanWithAI = async (
  avatarName: string,
  skillsData: any[],
): Promise<GeneratedDailyPlan> => {
  const prompt = `
  You are the AI System Director of a Cyberpunk RPG self-improvement app called "Skills Level".
  Your job is to analyze the avatar "${avatarName}" and their skill progress, then output a personalized Daily Quest Routine.

  === AVATAR SKILLS & STATUS ===
  ${JSON.stringify(skillsData, null, 2)}

  === INSTRUCTIONS & STRATEGY ===
  1. Analyze daysInactive: Prioritize skills marked as "NEGLECTED" (inactive > 3 days) to prevent skill degradation.
  2. Level-Up Opportunities: Give extra attention or quick tasks to skills close to leveling up (exp close to 100).
  3. Balance: Ensure a healthy mix across INTELLECTUAL and PHYSICAL categories if available.
  4. Output 3 to 5 realistic, high-impact tasks for today, strictly matching the skillIds provided in the input.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description:
              "Short cyberpunk game-master tactical advice/motto for the day based on skill analysis",
          },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skillId: {
                  type: Type.STRING,
                  description: "The exact skillId matching the input skill",
                },
                title: {
                  type: Type.STRING,
                  description: "Action-oriented quest title",
                },
                description: {
                  type: Type.STRING,
                  description: "Brief steps/instructions to complete the task",
                },
                durationMinutes: {
                  type: Type.NUMBER,
                  description:
                    "Estimated duration in minutes (e.g. 15, 30, 45)",
                },
                expReward: {
                  type: Type.NUMBER,
                  description:
                    "XP reward proportional to duration and difficulty",
                },
              },
              required: [
                "skillId",
                "title",
                "description",
                "durationMinutes",
                "expReward",
              ],
            },
          },
        },
        required: ["summary", "tasks"],
      },
    },
  });

  if (!response.text) {
    throw new Error("Gemini API returned an empty response");
  }

  return JSON.parse(response.text) as GeneratedDailyPlan;
};
