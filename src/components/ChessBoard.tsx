import React, { useState } from "react";
import { Chess, Square } from "chess.js";
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
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [moveHistory, setMoveHistory] = useState<{ from: Square; to: Square }[]>([]);

  const board = game.board();
  const isDraw = game.isDraw();
  const isCheck = game.inCheck();
  const isGameOver = game.isGameOver();

  const handleClick = (square: Square) => {
    const piece = game.get(square);
    const isSquareEmpty = !piece;

    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        const newMove = { from: move.from as Square, to: move.to as Square };
        setLastMove(newMove);
        setMoveHistory([...moveHistory, newMove]);
      }
      setSelectedSquare(null);
      setLegalMoves([]);
      forceRender((n) => n + 1);
    } else if (!isSquareEmpty) {
      const moves = game.moves({ square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to as Square));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleUndo = () => {
    game.undo();
    const history = [...moveHistory];
    history.pop();
    setMoveHistory(history);
    setLastMove(history[history.length - 1] ?? null);
    setSelectedSquare(null);
    setLegalMoves([]);
    forceRender((n) => n + 1);
  };

  const boardSquares = board.map((row, rowIndex) =>
    row.map((piece, colIndex) => {
      const square = ("abcdefgh"[colIndex] + (8 - rowIndex)) as Square;
      const isDark = (rowIndex + colIndex) % 2 === 1;

      const isSelected = selectedSquare === square && game.get(square);
      const isLegal = legalMoves.includes(square);

      const isLastMoveFrom = lastMove?.from === square;
      const isLastMoveTo = lastMove?.to === square;

      const isKingInCheckSquare = isCheck && piece?.type === "k" && piece.color === game.turn();

      const squareClass = [
        "square",
        isDark ? "dark" : "light",
        isSelected ? `selected ${isDark ? "dark" : "light"}` : "",
        isLegal ? "legal" : "",
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
        </div>
      );
    })
  );

  return (
    <>
      <div className="status">
        {isGameOver ? (
          <>Game Over — {isDraw ? "Draw" : game.turn() === "w" ? "Black" : "White"} wins</>
        ) : isCheck ? (
          <>Check!</>
        ) : (
          <>&nbsp;</>
        )}
      </div>

      <div className="board-container">
        <div className="board">{boardSquares.flat()}</div>
        <button className="undo-button" onClick={handleUndo}>
          Undo
        </button>
      </div>
    </>
  );
};

export default ChessBoard;
