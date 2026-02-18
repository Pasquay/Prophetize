// === IMPORTING LIBRARIES ===
import express, { Request, Response } from 'express'; // Added types Request/Response
import http from 'http';
import { Server, Socket } from 'socket.io'; // Added Socket type
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';

// === DEFINING TYPES (The "Schema" of your app) ===

// 1. What does a "Bet" look like?
interface BetData {
    team: string;
    amount: number;
}

// 2. Define the shape of your Socket events (Optional but recommended for autocomplete)
interface ServerToClientEvents {
    new_bet_alert: (data: { message: string }) => void;
}

interface ClientToServerEvents {
    place_bet: (data: BetData) => void;
}

// === INITIALIZING TOOLS ===
dotenv.config();
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with our custom event types
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PATCH"]
    }
});

// Safety Check: Ensure keys exist before crashing the app later
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in .env file');
}

// Logs into the DB
const supabase = createClient(supabaseUrl, supabaseKey);

app.use(cors());
app.use(express.json());


// === INDEX ROUTES ===
// Added types to req and res
app.get('/', (req: Request, res: Response) => {
    res.send('Prophetize Backend is Online!');
});


// === EVENT LISTENERS ===
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // TypeScript now knows 'data' must be of type 'BetData'
    socket.on('place_bet', async (data: BetData) => {
        console.log(`Received Bet:`, data);

        // Insert into Supabase
        const { error } = await supabase
            .from('bets')
            .insert([
                {
                    team: data.team,
                    amount: data.amount
                }
            ]);

        if (error) {
            console.error('Supabase Error:', error.message);
            return;
        }

        // Success! Alert everyone
        io.emit('new_bet_alert', {
            message: `User just bet ${data.amount} on ${data.team}!`
        });
    });

    socket.on('disconnect', () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});


// === LAUNCHING ===
const PORT = process.env.PORT || 3000;

// Type assertion for the IP address
server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`SERVER RUNNING on port ${PORT}`);
});