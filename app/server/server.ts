// what we need to send:
// players
// score of each player
// life of each player
// current player
// guess of current player

import { Socket } from "socket.io";

const io = require("socket.io")(8080, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

export type Player = {
  id: string;
  name: string;
  score: number;
  lives: number;
};

export type CurrentTurn = {
  playerId: string;
  guess: string;
};

const players: Player[] = [];

let currentTurnIndex = 0;

io.on("connection", (socket: Socket) => {
  socket.on("join-room", (room) => {
    socket.join(room);

    players.push({
      id: socket.id,
      name: String(Object.keys(players).length + 1),
      score: 0,
      lives: 3,
    });

    io.to(room).emit("receive-players", players);
  });

  socket.on("send-guess-text", (room, guess) => {
    io.to(room).emit("receive-guess-text", guess);
  });

  socket.on("send-players", (room) => {
    io.to(room).emit("receive-players", players);
  });

  socket.on("next-player", (room) => {
    if (currentTurnIndex < players.length - 1) {
      currentTurnIndex++;
    } else {
      currentTurnIndex = 0;
    }

    const currentTurn = {
      playerId: players[currentTurnIndex]?.id,
      guess: "example",
    };
    io.to(room).emit("receive-current-turn", currentTurn);
  });
});
