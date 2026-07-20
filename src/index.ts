import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import avatarRoutes from "./routes/avatar.routes.js";
import skillRoutes from "./routes/skills.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use("/api/avatars", avatarRoutes);
app.use("/api/skills", skillRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "System Online.",
    status: "Operational",
  });
});

app.listen(PORT, () => {
  console.log(
    `[SERVER] Skills Progress Backend running on http://localhost:${PORT}`,
  );
});
