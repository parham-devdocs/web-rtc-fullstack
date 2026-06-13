import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import db from "./db";
import dotenv from "dotenv";
import routes from "./routes";
import cookieParser from "cookie-parser";
import cors from "cors";

// Import your WebSocket server (but don't run it twice!)
// import "./websocketServer"; // This runs on port 2000

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ If you want WebSocket on port 5000 (same as HTTP)
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);

// WebSocket handling on port 5000
wss.on("connection", (ws, req) => {
  console.log("✅ WebSocket client connected on port 5000");
  
  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log("📨 Received:", message);
      
      // Broadcast to all connected clients except sender
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === 1) {
          client.send(data);
        }
      });
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });
  
  ws.on("close", () => {
    console.log("❌ WebSocket client disconnected");
  });
  
  ws.send(JSON.stringify({
    type: "system",
    message: "Connected to chat server",
    timestamp: Date.now()
  }));
});

// Start server
server.listen(5000, () => {
  db(process.env.MONGOOSE_CONNECTION_URI as string)
    .then(() => console.log("✅ Connected to DB"))
    .catch(() => console.log("❌ Unable to connect to DB"));
  console.log(`🚀 HTTP + WebSocket server running on port 5000`);
  console.log(`🔌 WebSocket available at ws://localhost:5000`);
});