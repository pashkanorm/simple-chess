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

  const board = game.board();
  const isDraw = game.isDraw();
  const isCheck = game.inCheck();
  const isGameOver = game.isGameOver();

  const handleClick = (square: Square) => {
    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: "q" });
      if (move) {
        setGame(new Chess(game.fen())); // Update game state
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
      const isSelected = selectedSquare === square;
      const isLegal = legalMoves.includes(square);
      const isDark = (rowIndex + colIndex) % 2 === 1;

      const squareClass = `
        square
        ${isDark ? "dark" : "light"}
        ${isSelected ? "selected" : ""}
        ${isLegal ? "legal" : ""}
      `;

      return (
        <div key={square} className={squareClass} onClick={() => handleClick(square)}>
          <span className="piece">
            {piece && unicodeMap[piece.color === "w" ? piece.type.toUpperCase() : piece.type]}
          </span>
        </div>
      );
    })
  );

  return (
    <>
      <h2>2-Player Chess</h2>
      {isGameOver && <h3>Game Over — {isDraw ? "Draw" : game.turn() === "w" ? "Black" : "White"} wins</h3>}
      {isCheck && !isGameOver && <h3>Check!</h3>}
      <div className="board">{boardSquares.flat()}</div>
    </>
  );
};

export default ChessBoard;
