import express from "express";
import marketRoutes from "../src/routes/marketRoutes";
import userRoutes from "../src/routes/userRoutes";
import leaderboardRoutes from "../src/routes/leaderboardRoutes";
import transactionRoutes from "../src/routes/transactionRoutes";

export const createTestApp = () => {
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.status(200).send("Prophetize is online!");
  });

  app.use("/auth", userRoutes);
  app.use("/markets", marketRoutes);
  app.use("/leaderboard", leaderboardRoutes);
  app.use("/transaction", transactionRoutes);

  return app;
};
