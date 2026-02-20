// Imports
import express from "express";
import userRoutes from "../src/routes/userRoutes";
import marketRoutes from "../src/routes/marketRoutes";

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

// Starting server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});