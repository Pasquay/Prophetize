// Imports
import http from "http";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";
import userRoutes from "../src/routes/userRoutes";
import marketRoutes from "../src/routes/marketRoutes";
import transactionRoutes from "../src/routes/transactionRoutes";
import portfolioRoutes from '../src/routes/portfolioRoutes';
import leaderboardRoutes from '../src/routes/leaderboardRoutes';
import { initializeRealtimeEmitter } from "../src/services/realtimeService";

// Server
const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    socket.on('subscribe', (channels: unknown) => {
        if (!Array.isArray(channels)) {
            return;
        }

        for (const channel of channels) {
            if (typeof channel === 'string' && channel.trim()) {
                socket.join(channel);
            }
        }
    });

    socket.on('unsubscribe', (channels: unknown) => {
        if (!Array.isArray(channels)) {
            return;
        }

        for (const channel of channels) {
            if (typeof channel === 'string' && channel.trim()) {
                socket.leave(channel);
            }
        }
    });
});

initializeRealtimeEmitter((event, payload) => {
    io.emit(event, payload);
});

// Root Route
app.get("/", (req, res) => {
    res.send("Prophetize is online!");
});

// Routes - connect routes to server
app.use("/auth", userRoutes);
app.use("/markets", marketRoutes);
app.use("/transaction", transactionRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/leaderboard', leaderboardRoutes);

// Starting server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});