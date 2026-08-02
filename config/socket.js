const { Server } = require("socket.io");

const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected to WebSocket [ID: ${socket.id}]`);

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected from WebSocket [ID: ${socket.id}]`);
    });
  });

  return io;
};

module.exports = { initSocket };
