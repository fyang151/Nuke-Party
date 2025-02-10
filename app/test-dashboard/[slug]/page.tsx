"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { io } from "socket.io-client";

import { CurrentTurn, Player } from "@/app/server/server";
import css from "./page.module.css";

const socket = io("http://localhost:8080"); // change this

const Page = () => {
  const params = useParams();
  const room = params.slug as string;

  const [guessInputValue, setGuessInputValue] = useState<string>("");
  const [guess, setGuess] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentTurn, setCurrentTurn] = useState<CurrentTurn>();
  const [myId, setMyId] = useState<string>();

  useEffect(() => {
    if (room) {
      socket.emit("join-room", room);

      socket.on("receive-guess-text", handleReceiveGuess);
      socket.on("receive-players", handleReceivePlayers);
      socket.on("receive-current-turn", handleReceiveCurrentTurn);
      setMyId(socket.id);

      return () => {
        socket.off("receive-guess-text", handleReceiveGuess);
        socket.off("receive-players", handleReceivePlayers);
        socket.off("receive-current-turn", handleReceiveCurrentTurn);
      };
    }
  }, [room]);

  const sendGuessText = (guessText: string) => {
    socket.emit("send-guess-text", room, guessText);
  };

  const handleReceiveGuess = (receivedGuess: string) => {
    setGuess(receivedGuess);
  };

  const handleGuessInputChange = (guessInput: string) => {
    setGuessInputValue(guessInput);
    sendGuessText(guessInput);
  };

  const handleReceivePlayers = (players: Player[]) => {
    setPlayers(players);
  };

  const testNextPlayer = () => {
    socket.emit("next-player", room);
  };

  const handleReceiveCurrentTurn = (currentTurn: CurrentTurn) => {
    console.info(currentTurn);
    setCurrentTurn(currentTurn);
  };

  return (
    <div>
      <button onClick={testNextPlayer}>Test Next Player</button>
      {myId === currentTurn?.playerId && (
        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            value={guessInputValue}
            onChange={(e) => handleGuessInputChange(e.target.value)}
          />
        </form>
      )}
      {guess}

      {players.map((player) => {
        const isCurrentTurn = player.id === currentTurn?.playerId;
        return (
          <div
            key={player.id}
            className={isCurrentTurn ? css.playerWithTurn : ""}
          >
            {player.name}
            <ul>
              <li>Score: {player.score}</li>
              <li>Lives: {player.lives}</li>
              <li>Id: {player.id}</li>
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
