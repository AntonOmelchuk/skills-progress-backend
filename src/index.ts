import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import avatarRoutes from "./routes/avatar.routes.js"; // <-- Add this import

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use("/api/avatars", avatarRoutes); // <-- Connect the router here

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "System Online. Welcome to Night City.",
    status: "Operational",
  });
});

app.listen(PORT, () => {
  console.log(
    `[SERVER] Skills Progress Backend running on http://localhost:${PORT}`,
  );
});
