import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { UserModel } from "./model/user";

export let io: Server;

export async function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    }
  });

  io.use((socket, next) => {
    const rawCookieHeader = socket.request.headers.cookie;
    if (!rawCookieHeader) return next(new Error("No cookies"));

    const cookies = Object.fromEntries(
      rawCookieHeader.split('; ').map((c) => {
        const [key, ...v] = c.split('=');
        return [key.trim(), v.join('=')];
      })
    );

    const token = cookies['accessToken'];
    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string);
      (socket as any).user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  const connectedUsers = new Map();

  io.on('connection', async (socket: any) => {
    const userId = socket.user.payload;
    const user = await UserModel.findById(userId);
    console.log(`✅ User connected: ${user?.username || userId}`);

    socket.on("join_room", (groupId: string) => {
      const previousRoom = connectedUsers.get(socket.id)?.room;
      if (previousRoom) {
        socket.leave(previousRoom);
      }
      
      socket.join(groupId);
      
      connectedUsers.set(socket.id, { 
        userId: user?._id, 
        username: user?.username,
        room: groupId 
      });

      const usersInRoom = Array.from(connectedUsers.values())
        .filter(u => u.room === groupId)
        .map(u => u.username);
        
      io.in(groupId).emit("user in room", usersInRoom);
      
      console.log(`${user?.username} joined room: ${groupId}`);
    });

    // FIXED: Proper send_message handler
    socket.on("send_message", (data: any) => {
      console.log("Message received from server:", data);
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(data.room).emit("receive_message", {
        ...data.message,
        _id: new mongoose.Types.ObjectId().toString(),
        createdAt: new Date().toISOString(),
      });
    });

    socket.on("typing", (groupId: string) => {
      socket.to(groupId).emit("typing_indicator", {
        userId: user?.username,
        isTyping: true
      });
      
      clearTimeout(socket.typingTimeout);
      socket.typingTimeout = setTimeout(() => {
        socket.to(groupId).emit("typing_indicator", {
          userId: user?.username,
          isTyping: false
        });
      }, 1000);
    });

    socket.on("stop_typing", (groupId: string) => {
      clearTimeout(socket.typingTimeout);
      socket.to(groupId).emit("typing_indicator", {
        userId: user?.username,
        isTyping: false
      });
    });

    socket.on("leave_room", (groupId: string) => {
      socket.leave(groupId);
      connectedUsers.delete(socket.id);
      
      const usersInRoom = Array.from(connectedUsers.values())
        .filter(u => u.room === groupId)
        .map(u => u.username);
      
      io.in(groupId).emit("user in room", usersInRoom);
      
      console.log(`${user?.username} left room: ${groupId}`);
    });

    socket.on('disconnect', () => {
      const userInfo = connectedUsers.get(socket.id);
      if (userInfo) {
        const { username, room } = userInfo;
        connectedUsers.delete(socket.id);
        
        const usersInRoom = Array.from(connectedUsers.values())
          .filter(u => u.room === room)
          .map(u => u.username);
        
        io.in(room).emit("user in room", usersInRoom);
        
        console.log(`❌ User disconnected: ${username}`);
      }
    });
  });
}