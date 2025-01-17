const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-room", (room) => {
    console.log(`${socket.id} joined room ${room}`);
    socket.join(room);
  });

  socket.on("send-guess-text", (room, guess) => {
    io.to(room).emit("receive-guess-text", guess);
  });
});
