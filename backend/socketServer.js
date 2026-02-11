const { Server: SocketIOServer } = require("socket.io");

let ioInstance = null;
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
  "http://localhost:3000",
  "https://adroythub.com",
  "https://www.adroythub.com"
];

// Maps to track user/socket relationships
const userSocketMap = new Map();  // userId => socket.id
const socketUserMap = new Map();  // socket.id => userId

const initSocketServer = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow no origin (like from Postman or mobile apps)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Socket.IO CORS: Not allowed by CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);

    socket.on("joinRoom", ({ roomId, userId }) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);

      if (userId) {
        userSocketMap.set(userId, socket.id);
        socketUserMap.set(socket.id, userId);
      }

      socket.emit("joinedRoom", { roomId });
    });

    // Broadcast to ALL
    socket.on("sendToAll", ({ message }) => {
      console.log("Broadcasting to all:", message);
      io.emit("publicMessage", { message });
    });

    // Room message
    socket.on("sendToRoom", ({ roomId, message }) => {
      console.log(`Sending to room ${roomId}: ${message}`);
      io.to(roomId).emit("roomMessage", { roomId, message });
    });

    // Private message
    socket.on("sendToUser", ({ toUserId, message }) => {
      const toSocketId = userSocketMap.get(toUserId);
      if (toSocketId) {
        io.to(toSocketId).emit("privateMessage", {
          from: socketUserMap.get(socket.id),
          message,
        });
      } else {
        console.log(`❌ User ${toUserId} not connected.`);
      }
    });

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      const userId = socketUserMap.get(socket.id);
      console.log(`🔌 Disconnected: ${socket.id} (user: ${userId}, reason: ${reason})`);

      if (userId) {
        userSocketMap.delete(userId);
      }

      socketUserMap.delete(socket.id);
    });

    // Listen for 'notification' event from frontend
    socket.on("notification", (data) => {
      // Broadcast notification data to all connected clients
      io.emit("newNotification", data);
    });
  });

  return io;
};

// Optional server-side trigger functions
const emitToAll = (message) => ioInstance?.emit("publicMessage", { message });

const emitToRoom = (roomId, message) =>
  ioInstance?.to(roomId).emit("roomMessage", { roomId, message });

const emitToUser = (userId, message) => {
  if (!ioInstance) {
    console.error("❌ Socket.IO instance not available");
    return false;
  }

  try {
    // Send to user's room (all their devices will receive it)
    const roomId = `user-${userId}`;
    const room = ioInstance.sockets.adapter.rooms.get(roomId);

    if (room && room.size > 0) {
      ioInstance.to(roomId).emit("notification", message);
      console.log(`✅ Notification sent via Socket.IO to user ${userId} (room: ${roomId}, ${room.size} socket(s))`);
      return true;
    } else {
      console.log(`⚠️ No socket found for user ${userId} in room ${roomId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error emitting to user ${userId}:`, error);
    return false;
  }
};

const disconnectUser = (userId) => {
  if (!ioInstance) return;
  const socketId = userSocketMap.get(userId);
  if (socketId) {
    const socket = ioInstance.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
      console.log(`🔌 Manually disconnected user ${userId} via logout`);
    }
    userSocketMap.delete(userId);
    socketUserMap.delete(socketId);
  }
};

module.exports = {
  initSocketServer,
  emitToAll,
  emitToRoom,
  emitToUser,
  disconnectUser,
};
