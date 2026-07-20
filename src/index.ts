import express from "express";
import type { Request, Response } from "express";
import cors from "cors";

// 1. Initialize the Express application
const app = express();
const PORT = process.env.PORT || 3000;

// 2. Apply global middlewares
app.use(cors()); // Allows your React frontend to communicate with this API
app.use(express.json()); // Allows the server to understand JSON requests

// 3. Define a simple test route (Health Check)
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "System Online. Welcome to Night City.",
    status: "Operational",
  });
});

// 4. Start the server and listen for requests
app.listen(PORT, () => {
  console.log(`[SERVER] Skills Progress running on http://localhost:${PORT}`);
});
