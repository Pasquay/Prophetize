// Imports
import express from "express";
import userRoutes from "../src/routes/userRoutes";
import marketRoutes from "../src/routes/marketRoutes";
import transactionRoutes from "../src/routes/transactionRoutes";

// Server
const app = express();
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
    res.send("Prophetize is online!");
});

// Routes - connect routes to server
app.use("/auth", userRoutes);
app.use("/markets", marketRoutes);
app.use("/transaction", transactionRoutes);

// Starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});