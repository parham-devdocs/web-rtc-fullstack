// websocketServer.ts - Simplified version
import { WebSocketServer } from "ws";

const PORT = 2000;
const wss = new WebSocketServer({ port: PORT });
const connections = new Map(); // Store connections by userId

wss.on("connection", (ws) => {
    console.log("🔌 New client connected to signaling server");
    
    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data.toString());
            console.log(`📨 Received:`, message);
            
            // Broadcast to all connected clients
            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === 1) {
                    client.send(JSON.stringify({
                        type: "broadcast",
                        message: message,
                        timestamp: Date.now()
                    }));
                }
            });
        } catch (error) {
            console.error("Error:", error);
        }
    });
    
    ws.on("close", () => {
        console.log("🔌 Client disconnected");
        // Remove from connections
        for (const [userId, client] of connections.entries()) {
            if (client === ws) {
                connections.delete(userId);
                break;
            }
        }
    });
});

console.log(`✨ WebSocket signaling server running on ws://localhost:${PORT}`);
console.log("⏳ Waiting for connections...");

export default wss;