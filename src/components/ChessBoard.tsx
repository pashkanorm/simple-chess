import React, { useState, useEffect } from "react";
import { Chess, Square, Move } from "chess.js";
import "./ChessBoard.css";

const unicodeMap: Record<string, string> = {
  p: "♟",
  r: "♜",
  n: "♞",
  b: "♝",
  q: "♛",
  k: "♚",
  P: "♙",
  R: "♖",
  N: "♘",
  B: "♗",
  Q: "♕",
  K: "♔",
};

const ChessBoard: React.FC = () => {
  const [game] = useState(new Chess());
  const [, forceRender] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState<number | null>(null);

  const isViewingHistory = currentMoveIndex !== null;

  const handleClick = (square: Square) => {
    if (isViewingHistory) return;

    const piece = game.get(square);
    const isSquareEmpty = !piece;

    if (selectedSquare && legalMoves.some((m) => m.to === square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setLastMove(move);
        setMoveHistory([...moveHistory, move]);
        setCurrentMoveIndex(null);
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      forceRender((n) => n + 1);
    } else if (!isSquareEmpty) {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setLegalMoves(moves);
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const jumpToMove = (index: number | null) => {
    if (index === null) {
      game.reset();
      moveHistory.forEach((move) => game.move(move));
      setCurrentMoveIndex(null);
      setLastMove(moveHistory[moveHistory.length - 1] ?? null);
    } else if (index < 0) {
      game.reset();
      setCurrentMoveIndex(-1);
      setLastMove(null);
    } else if (index >= 0 && index < moveHistory.length) {
      game.reset();
      for (let i = 0; i <= index; i++) {
        game.move(moveHistory[i]);
      }
      setCurrentMoveIndex(index);
      setLastMove(moveHistory[index]);
    }
    forceRender((n) => n + 1);
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  const handleUndo = () => {
    if (isViewingHistory) {
      const newIndex = currentMoveIndex !== null ? currentMoveIndex - 1 : -1;
      jumpToMove(newIndex >= -1 ? newIndex : -1);
    } else {
      game.undo();
      const history = [...moveHistory];
      history.pop();
      setMoveHistory(history);
      setLastMove(history[history.length - 1] ?? null);
      forceRender((n) => n + 1);
    }
    setSelectedSquare(null);
    setLegalMoves([]);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        if (moveHistory.length === 0) return;
        if (currentMoveIndex === -1) return;
        if (currentMoveIndex === null) {
          jumpToMove(moveHistory.length - 1);
          return;
        }
        if (currentMoveIndex > -1) {
          jumpToMove(currentMoveIndex - 1);
        }
      } else if (e.key === "ArrowRight") {
        if (moveHistory.length === 0) return;
        if (currentMoveIndex === null) return;
        if (currentMoveIndex === -1) {
          jumpToMove(0);
          return;
        }
        if (currentMoveIndex < moveHistory.length - 1) {
          jumpToMove(currentMoveIndex + 1);
          return;
        }
        if (currentMoveIndex === moveHistory.length - 1) {
          jumpToMove(null);
          return;
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [currentMoveIndex, moveHistory]);

  const board = game.board();
  const isDraw = game.isDraw();
  const isCheck = game.inCheck();
  const isGameOver = game.isGameOver();

  const boardSquares = board.map((row, rowIndex) =>
    row.map((piece, colIndex) => {
      const square = ("abcdefgh"[colIndex] + (8 - rowIndex)) as Square;
      const isDark = (rowIndex + colIndex) % 2 === 1;

      const isSelected = selectedSquare === square && game.get(square);
      const legalMoveForSquare = legalMoves.find((m) => m.to === square);
      const isLegal = Boolean(legalMoveForSquare);

      const isLastMoveFrom = lastMove?.from === square;
      const isLastMoveTo = lastMove?.to === square;

      const isKingInCheckSquare = isCheck && piece?.type === "k" && piece.color === game.turn();

      const squareClass = [
        "square",
        isDark ? "dark" : "light",
        isSelected ? `selected ${isDark ? "dark" : "light"}` : "",
        isLastMoveFrom || isLastMoveTo ? (isDark ? "last-move-dark" : "last-move-light") : "",
        isKingInCheckSquare ? "check-king" : "",
      ]
        .filter(Boolean)
        .join(" ");

      return (
        <div key={square} className={squareClass} onClick={() => handleClick(square)}>
          <span className={`piece ${piece?.color === "w" ? "white" : "black"}`}>
            {piece ? unicodeMap[piece.color === "w" ? piece.type.toUpperCase() : piece.type] : ""}
          </span>

          {!isViewingHistory && isLegal && !legalMoveForSquare?.flags.includes("c") && (
            <div className="legal-dot" />
          )}
          {!isViewingHistory && isLegal && legalMoveForSquare?.flags.includes("c") && piece && (
            <div className="legal-ring" />
          )}
        </div>
      );
    })
  );

  return (
    <>
      <div className="status">
        {isGameOver ? (
          <>Checkmate — {isDraw ? "Draw" : game.turn() === "w" ? "Black" : "White"} wins</>
        ) : isCheck ? (
          <>Check!</>
        ) : (
          <>&nbsp;</>
        )}
      </div>

      <div className="board-and-history">
        <div className="move-history-panel">
          {moveHistory.length === 0 ? (
            <p style={{ minHeight: "1.5em" }}>No moves made yet.</p>
          ) : (
            <ol>
              {moveHistory.map((move, i) => {
                const moveNumber = Math.floor(i / 2) + 1;
                const isWhiteMove = i % 2 === 0;
                return (
                  <li
                    key={i}
                    className={i === currentMoveIndex ? "current-move" : ""}
                    onClick={() => jumpToMove(i)}
                    style={{ cursor: "pointer", userSelect: "none" }}>
                    {isWhiteMove && `${moveNumber}. `}
                    {move.from} → {move.to}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="board-and-button">
          <div className="board">{boardSquares.flat()}</div>
          <button
            className="undo-button"
            onClick={handleUndo}
            disabled={moveHistory.length === 0 && currentMoveIndex === null}>
            Undo
          </button>
        </div>
      </div>
    </>
  );
};

export default ChessBoard;
