const io = require("socket.io")(process.env.PORT || 10000, {
  cors: {
    origin: "*", // Allow all origins, update for production
    methods: ["GET", "POST"]
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Add new user
  socket.on("add-user", (userId) => {
    if (!activeUsers.some((user) => user.userId === userId)) {
      activeUsers.push({ userId, socketId: socket.id });
      console.log("New User Connected:", activeUsers);
    }
    io.emit("get-users", activeUsers);
  });

  // Send Message to a specific user
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });
});
