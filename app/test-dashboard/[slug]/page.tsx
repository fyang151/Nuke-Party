"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { io } from "socket.io-client";

const socket = io("http://localhost:8080"); // change this

const Page = () => {
  const params = useParams();
  const room = params.slug as string;

  const [guessInputValue, setGuessInputValue] = useState<string>("");
  const [guess, setGuess] = useState<string>("");

  useEffect(() => {
    if (room) {
      socket.emit("join-room", room);

      const handleReceiveGuess = (receivedGuess: string) => {
        setGuess(receivedGuess);
      };

      socket.on("receive-guess-text", handleReceiveGuess);

      return () => {
        socket.off("receive-guess-text", handleReceiveGuess); // Clean up listener
      };
    }
  }, [room]);

  const sendGuessText = (guessText: string) => {
    socket.emit("send-guess-text", room, guessText);
  };

  const handleGuessInputChange = (guessInput: string) => {
    setGuessInputValue(guessInput);
    sendGuessText(guessInput);
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          value={guessInputValue}
          onChange={(e) => handleGuessInputChange(e.target.value)}
        />
      </form>
      {guess}
    </div>
  );
};

export default Page;
