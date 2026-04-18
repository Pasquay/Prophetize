import express from "express";
import marketRoutes from "../src/routes/marketRoutes";
import userRoutes from "../src/routes/userRoutes";
import leaderboardRoutes from "../src/routes/leaderboardRoutes";
import transactionRoutes from "../src/routes/transactionRoutes";
import notificationRoutes from "../src/routes/notificationRoutes";
import socialRoutes from "../src/routes/socialRoutes";
import adminRoutes from "../src/routes/adminRoutes";
import adminConflictRoutes from "../src/routes/adminConflictRoutes";
import adminAnalyticsRoutes from "../src/routes/adminAnalyticsRoutes";

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
  app.use("/notifications", notificationRoutes);
  app.use("/social", socialRoutes);
  app.use('/admin', adminRoutes);
  app.use('/admin', adminConflictRoutes);
  app.use('/admin', adminAnalyticsRoutes);

  return app;
};
