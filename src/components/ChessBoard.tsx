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
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);

  const board = game.board();
  const isDraw = game.isDraw();
  const isCheck = game.inCheck();
  const isGameOver = game.isGameOver();

  const handleClick = (square: Square) => {
    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setGame(new Chess(game.fen()));
        setLastMove({ from: move.from as Square, to: move.to as Square });
      }
      setSelectedSquare(null);
      setLegalMoves([]);
    } else {
      const moves = game.moves({ square, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves.map((m) => m.to as Square));
    }
  };

  const boardSquares = board.map((row, rowIndex) =>
    row.map((piece, colIndex) => {
      const square = ("abcdefgh"[colIndex] + (8 - rowIndex)) as Square;
      const isDark = (rowIndex + colIndex) % 2 === 1;

      const isLastMoveFrom = lastMove?.from === square;
      const isLastMoveTo = lastMove?.to === square;

      const lastMoveClass = isLastMoveFrom || isLastMoveTo ? (isDark ? "last-move-dark" : "last-move-light") : "";

      const isKingInCheckSquare = isCheck && piece?.type === "k" && piece.color === game.turn();

      const isLegal = legalMoves.includes(square);
      const isSelected = selectedSquare === square && game.get(square); // only if a piece exists

      const squareClass = `
        square
        ${isDark ? "dark" : "light"}
        ${isSelected ? "selected" : ""}
        ${isLegal ? "legal" : ""}
        ${lastMoveClass}
        ${isKingInCheckSquare ? "check-king" : ""}
      `;

      return (
        <div key={square} className={squareClass} onClick={() => handleClick(square)}>
          <span className={`piece ${piece?.color === "w" ? "white" : "black"}`}>
            {piece && unicodeMap[piece.color === "w" ? piece.type.toUpperCase() : piece.type]}
          </span>
        </div>
      );
    })
  );

  return (
    <>
      <div className="status">
        {isGameOver ? (
          <>Checkmate — {isDraw ? "Draw" : game.turn() === "w" ? "Black" : "White"} wins!</>
        ) : isCheck ? (
          <>Check!</>
        ) : (
          <>&nbsp;</> // keeps layout height
        )}
      </div>
      <div className="board">{boardSquares.flat()}</div>
    </>
  );
};

export default ChessBoard;
