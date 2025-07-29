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

/**
 * Determines the winner of the given tic tac toe board.
 * @param {Array} squares Board array of 9 cells.
 */
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

/**
 * Get available move indexes of empty cells.
 */
function emptyCells(squares) {
  return squares.map((v, idx) => v ? null : idx).filter(v => v !== null);
}

/**
 * Try to find a move that lets `symbol` win/block, else returns null.
 * Used for both blocking and instant win checks.
 */
function findLineMove(squares, symbol) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    const lineVals = [squares[a], squares[b], squares[c]];
    const symbolCount = lineVals.filter(v => v === symbol).length;
    const emptyIdx = line.find(idx => squares[idx] === null);
    if (symbolCount === 2 && emptyIdx !== undefined && squares[emptyIdx] === null) {
      // Two are filled with symbol, empty cell found.
      return emptyIdx;
    }
  }
  return null;
}

/**
 * Simple AI player logic:
 *   Win if possible, block opponent win, else random move.
 */
function aiMove(squares, aiSymbol) {
  const opponent = aiSymbol === "X" ? "O" : "X";
  // 1. Can AI win?
  const winIdx = findLineMove(squares, aiSymbol);
  if (winIdx !== null) return winIdx;
  // 2. Can AI block opponent win?
  const blockIdx = findLineMove(squares, opponent);
  if (blockIdx !== null) return blockIdx;
  // 3. Otherwise, pick random empty cell.
  const empties = emptyCells(squares);
  if (empties.length > 0) {
    return empties[Math.floor(Math.random() * empties.length)];
  }
  return null;
}

/**
 * PUBLIC_INTERFACE
 * Main Tic Tac Toe App component: renders UI, handles state, enables two-player and AI mode.
 */
function App() {
  // Game state
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);

  // AI Mode state
  // "human": Player X vs Player O (human vs human), "ai": Player X (human) vs Player O (AI)
  const [gameMode, setGameMode] = useState("human"); // 'human' or 'ai'
  // For minimalism: X is always the human, O is AI (in AI mode)

  // Mark if last move was made by AI (for UI indicator if wanted)
  const [lastAI, setLastAI] = useState(false);

  // Set document theme for minimalistic light look
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
  }, []);

  // Set accent colors (one-time)
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', '#1565c0');
    root.style.setProperty('--secondary', '#90caf9');
    root.style.setProperty('--accent', '#ffd600');
    root.style.setProperty('--border-color', '#e0e0e0');
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

  // AI action effect: after human moves in AI mode, let AI play (not first move)
  useEffect(() => {
    if (
      gameMode === "ai" &&
      !gameOver &&
      !winner &&
      !isXNext // AI always plays O, so if isXNext is false, AI's turn
    ) {
      // Add a short delay for realism/visibility
      const aiTimeout = setTimeout(() => {
        const move = aiMove(squares, "O");
        if (move != null) {
          const newSquares = squares.slice();
          newSquares[move] = "O";
          setSquares(newSquares);
          setIsXNext(true);
          setLastAI(true);
        }
      }, 420); // 420ms for visible AI move

      return () => clearTimeout(aiTimeout);
    }
    setLastAI(false);
  }, [squares, isXNext, gameOver, winner, gameMode]);

  // PUBLIC_INTERFACE
  function handleRestart() {
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
    setLastAI(false);
  }

  // PUBLIC_INTERFACE
  function handleCellClick(i) {
    if (squares[i] || gameOver) return; // No action if already filled or finished
    if (gameMode === "ai" && !isXNext) return; // Human can't play O in AI mode!
    const nextSquares = squares.slice();
    nextSquares[i] = isXNext ? "X" : "O";
    setSquares(nextSquares);
    setIsXNext(!isXNext);
    setLastAI(false);
  }

  // Function: Handle mode switch (restart game for mode change)
  // PUBLIC_INTERFACE
  function handleModeChange(newMode) {
    setGameMode(newMode);
    // Restart (AI should never resume in the middle of board swap)
    setSquares(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
    setWinner(null);
    setLastAI(false);
  }

  // Status message
  let status;
  if (winner) {
    status = `Winner: ${winner}${gameMode === "ai" && winner === "O" ? " (AI)" : winner === "X" && gameMode === "ai" ? " (You)" : ""}`;
  } else if (gameOver) {
    status = "It's a draw!";
  } else {
    if (gameMode === "ai") {
      status =
        isXNext ?
          "Your turn (X)" :
          "AI (O) is thinking...";
    } else {
      status = `Next turn: ${isXNext ? "X" : "O"}`;
    }
  }

  const modeLabel = gameMode === "ai" ? "AI" : "2-Player";

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

  // Mode Selector component
  function ModeSwitcher() {
    return (
      <div style={{
        marginBottom: 22,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "1rem"
      }}>
        <span style={{ marginRight: 9, fontWeight: 500, color: "var(--primary)" }}>
          Mode:
        </span>
        <button
          style={{
            background: gameMode === "human" ? "var(--primary)" : "#fff",
            color: gameMode === "human" ? "#fff" : "var(--primary)",
            border: "1.5px solid var(--primary)",
            borderRadius: 7,
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px 17px",
            transition: "background 0.18s, color 0.18s",
            boxShadow: gameMode === "human" ? "0 0 5px #1565c055" : "none"
          }}
          aria-pressed={gameMode === "human"}
          onClick={() => handleModeChange("human")}
        >
          2-Player
        </button>
        <button
          style={{
            background: gameMode === "ai" ? "var(--secondary)" : "#fff",
            color: gameMode === "ai" ? "#fff" : "var(--secondary)",
            border: "1.5px solid var(--secondary)",
            borderRadius: 7,
            fontWeight: 600,
            cursor: "pointer",
            padding: "6px 17px",
            marginLeft: 6,
            transition: "background 0.18s, color 0.18s",
            boxShadow: gameMode === "ai" ? "0 0 5px #90caf955" : "none"
          }}
          aria-pressed={gameMode === "ai"}
          onClick={() => handleModeChange("ai")}
        >
          Play vs AI
        </button>
      </div>
    );
  }

  // Player info bar
  function PlayerInfo() {
    if (gameMode === "ai") {
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
            You (X)
          </span>
          <span style={{ color: "#ccc" }}>|</span>
          <span style={{
            color: !isXNext ? "var(--accent)" : "var(--secondary)", fontWeight: !isXNext ? 700 : 400
          }}>
            AI (O){lastAI && !winner && !gameOver ? " ●" : ""}
          </span>
        </div>
      );
    }
    // Human vs human
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
          cursor: squares[i] || gameOver ||
            (gameMode === "ai" && !isXNext) ? "not-allowed" : "pointer",
          background: squares[i] ? "#f8f9fa" : "#fff",
          borderColor: gameOver && winner && winner === squares[i] ? "var(--accent)" : "var(--border-color, #e9ecef)"
        }}
        className="ttt-square"
        onClick={() => handleCellClick(i)}
        aria-label={`Cell ${i}, ${squares[i] ? squares[i] : "empty"}`}
        disabled={!!squares[i] || gameOver || (gameMode === "ai" && !isXNext)}
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
        <div style={{marginTop: 19, fontSize: "0.97rem", color: "var(--secondary)", fontWeight: 500}}>
          {gameMode === "ai" ? "You vs AI! X = You, O = AI" : "Two-Player mode enabled."}
        </div>
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
        <ModeSwitcher />
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
