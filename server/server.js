import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { connectDB, getDB, closeDB, health } from "./db.js";

import { route as AUTH } from "./routes/api-auth.js";
import { route as GROUP } from "./routes/api-groups.js";
import { route as CHANNEL } from "./routes/api-channels.js";
import { route as USER } from "./routes/api-users.js";

import { connect as SOCKET } from "./socket.js";
import { listen as LISTEN } from "./listen.js";

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config({ quiet: true });

await connectDB();

const PORT = process.env.http_port || 3000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// routes
AUTH(app);
GROUP(app);
CHANNEL(app);
USER(app);

// socket + listen
SOCKET(io, PORT);
LISTEN(server, PORT);

// when server is stopped, close mongodb
process.on("SIGINT", async () => {
  await closeDB();
  process.exit(0);
});