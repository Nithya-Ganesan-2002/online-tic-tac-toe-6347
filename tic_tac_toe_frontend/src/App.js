import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * PUBLIC_INTERFACE
 * A minimalistic, modern Tic Tac Toe game UI in React for two players.
 * Features:
 * - Interactive 3x3 board (centered layout)
 * - Player info above board
 * - Game status (win, draw, whose turn)
 * - Restart game functionality
 * - Light, minimalistic theme
 * Color palette used via CSS variables and inline styles when needed.
 */

// Utility: Get winner of a given board state (array of 9 cells)
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],     // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],     // columns
    [0, 4, 8], [2, 4, 6],                // diagonals
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return squares[a];
    }
  }
  return null;
}

// PUBLIC_INTERFACE
function App() {
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // Set document theme for minimalistic light look
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  // Check for winner or draw whenever squares change
  useEffect(() => {
    const win = calculateWinner(squares);
    if (win) {
      setWinner(win);
      setGameOver(true);
    } else if (squares.every((v) => v)) {
      setWinner(null);
      setGameOver(true);
    }
  }, [squares]);

  // Restart the game
  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
  }

  // PUBLIC_INTERFACE
  function handleCellClick(i) {
    if (squares[i] || gameOver) return; // No action if already filled or finished
    const nextSquares = squares.slice();
    nextSquares[i] = isXNext ? "X" : "O";
    setSquares(nextSquares);
    setIsXNext(!isXNext);
  }

  // Status message
  let status;
  if (winner) {
    status = `Winner: ${winner}`;
  } else if (gameOver) {
    status = "It's a draw!";
  } else {
    status = `Next turn: ${isXNext ? "X" : "O"}`;
  }

  // Styling helpers for minimalistic board using theme colors
  const boardBorder = `2.5px solid var(--border-color, #e9ecef)`;
  const squareStyle = {
    width: 72,
    height: 72,
    boxSizing: "border-box",
    border: `1.7px solid var(--border-color, #e9ecef)`,
    background: "#fff",
    color: "var(--primary, #1565c0)",
    fontSize: "2.6rem",
    fontWeight: 700,
    outline: "none",
    cursor: "pointer",
    lineHeight: "1",
    transition: "background 0.2s",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };

  // Color CSS variables for accent/primary/secondary
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', '#1565c0');
    root.style.setProperty('--secondary', '#90caf9');
    root.style.setProperty('--accent', '#ffd600');
    root.style.setProperty('--border-color', '#e0e0e0');
  }, []);

  // Player info bar
  function PlayerInfo() {
    return (
      <div style={{
        marginBottom: 32,
        display: "flex",
        justifyContent: "center",
        gap: "40px",
        alignItems: "center",
        fontSize: "1.15rem"
      }}>
        <span style={{
          color: isXNext ? "var(--accent)" : "var(--primary)", fontWeight: isXNext ? 700 : 400
        }}>
          Player X
        </span>
        <span style={{ color: "#ccc" }}>|</span>
        <span style={{
          color: !isXNext ? "var(--accent)" : "var(--primary)", fontWeight: !isXNext ? 700 : 400
        }}>
          Player O
        </span>
      </div>
    );
  }

  // Board rendering
  function renderSquare(i) {
    let color = squares[i] === "X"
      ? "var(--primary, #1565c0)"
      : squares[i] === "O"
        ? "var(--secondary, #90caf9)"
        : "#333";
    return (
      <button
        key={i}
        style={{
          ...squareStyle,
          color: color,
          cursor: squares[i] || gameOver ? "not-allowed" : "pointer",
          background: squares[i] ? "#f8f9fa" : "#fff",
          borderColor: gameOver && winner && winner === squares[i] ? "var(--accent)" : "var(--border-color, #e9ecef)"
        }}
        className="ttt-square"
        onClick={() => handleCellClick(i)}
        aria-label={`Cell ${i}, ${squares[i] ? squares[i] : "empty"}`}
        disabled={!!squares[i] || gameOver}
        tabIndex={0}
      >
        {squares[i]}
      </button>
    );
  }

  function BoardGrid() {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 72px)",
          gridTemplateRows: "repeat(3, 72px)",
          gap: "0",
          margin: "0 auto",
          background: "var(--bg-secondary, #f8f9fa)",
          border: boardBorder,
          borderRadius: "18px",
          boxShadow: "0 3px 18px 0 rgba(21,101,192,0.09)",
        }}
      >
        {Array(9).fill(0).map((_, i) => renderSquare(i))}
      </div>
    );
  }

  // Status/restart bar
  function StatusBar() {
    return (
      <div style={{
        marginTop: 32,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <div
          style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            letterSpacing: "0.03em",
            margin: "10px 0",
            color:
              winner
                ? "var(--accent)"
                : gameOver
                ? "#9e9e9e"
                : "var(--primary)"
          }}
          data-testid="game-status"
        >
          {status}
        </div>
        <button
          className="ttt-restart-btn"
          style={{
            marginTop: 10,
            background: "var(--primary, #1565c0)",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            padding: "9px 26px",
            fontSize: "1rem",
            letterSpacing: "0.03em",
            boxShadow: "0 2px 8px 0 rgba(21,101,192,0.03)",
            cursor: "pointer",
            transition: "background 0.17s"
          }}
          onClick={handleRestart}
          aria-label="Restart game"
        >
          Restart
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "var(--bg-primary, #fff)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <main
        style={{
          background: "var(--bg-secondary, #fafbfd)",
          boxShadow: "0 6px 36px rgba(21,101,192,0.10)",
          borderRadius: "20px",
          padding: "44px 36px 34px 36px",
          margin: "44px 0 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minWidth: "304px"
        }}
      >
        <h1
          style={{
            margin: 0,
            marginBottom: "5px",
            color: "var(--primary)",
            fontSize: "2.1rem",
            letterSpacing: "0.03em",
            fontWeight: 900
          }}
        >
          Tic Tac Toe
        </h1>
        <PlayerInfo />
        <BoardGrid />
        <StatusBar />
      </main>
      <footer style={{marginTop: 26, color: "#adb5bd", fontSize: "0.99rem"}}>
        <span>
          <span style={{ color: "var(--accent)" }}>●</span> Modern minimalist design — KAVIA codegen template
        </span>
      </footer>
    </div>
  );
}

export default App;
