import express from "express";
import marketRoutes from "../src/routes/marketRoutes";
import userRoutes from "../src/routes/userRoutes";

export const createTestApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).send("Prophetize is online!");
  });

  app.use("/auth", userRoutes);
  app.use("/markets", marketRoutes);

  // Task 1 runs red before leaderboard routes exist.
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const leaderboardRoutes = require("../src/routes/leaderboardRoutes").default;
    app.use("/leaderboard", leaderboardRoutes);
  } catch {
    // Intentionally empty while endpoint is not yet implemented.
  }

  return app;
};
