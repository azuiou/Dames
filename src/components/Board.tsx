import React from 'react';
import Square from './Square';
import PieceComponent from './Piece';
import { Piece, Position } from '../types/game';
import { Skull } from 'lucide-react';

interface BoardProps {
  board: (Piece | null)[][];
  selectedPiece: Piece | null;
  validMoves: Position[];
  onPieceSelect: (piece: Piece) => void;
  onSquareSelect: (position: Position, draggedPiece?: Piece) => void;
  movingPiece: Piece | null;
  captureAnimation: Position | null;
  mustJumpPieces: Piece[];
  movementPath: { points: Position[]; active: boolean };
}

const Board: React.FC<BoardProps> = ({
  board,
  selectedPiece,
  validMoves,
  onPieceSelect,
  onSquareSelect,
  movingPiece,
  captureAnimation,
  mustJumpPieces,
  movementPath
}) => {
  const getValidMovesForPiece = (piece: Piece): Position[] => {
    if (piece.color !== selectedPiece?.color) return [];
    return validMoves;
  };

  const getPathPoints = () => {
    if (!movementPath.active || movementPath.points.length < 2) return '';
    
    const points = movementPath.points.map(pos => {
      const x = (pos.col + 0.5) * (100 / 8);
      const y = (pos.row + 0.5) * (100 / 8);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  return (
    <div className="relative w-full aspect-square border-4 border-amber-900 shadow-xl rounded-sm overflow-hidden">
      <div className="grid grid-cols-8 grid-rows-8 h-full w-full">
        {board.map((row, rowIndex) =>
          row.map((piece, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const isBlack = (rowIndex + colIndex) % 2 === 1;
            const isCapturing = captureAnimation?.row === rowIndex && captureAnimation?.col === colIndex;
            const pieceValidMoves = piece ? getValidMovesForPiece(piece) : [];
            const mustJump = piece && mustJumpPieces.some(p => p.id === piece.id);
            
            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                position={position}
                isBlack={isBlack}
                isValidMove={validMoves.some(move => move.row === rowIndex && move.col === colIndex)}
                onSquareSelect={onSquareSelect}
              >
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center z-30 animate-bounce">
                    <Skull className="w-8 h-8 text-red-500" />
                  </div>
                )}
                {piece && (
                  <PieceComponent
                    piece={piece}
                    isSelected={selectedPiece?.id === piece.id}
                    onPieceSelect={onPieceSelect}
                    validMoves={pieceValidMoves}
                    isMoving={movingPiece?.id === piece.id}
                    mustJump={mustJump}
                  />
                )}
              </Square>
            );
          })
        )}
      </div>
      
      {/* Movement path SVG overlay */}
      <svg
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          movementPath.active ? 'opacity-100' : 'opacity-0'
        }`}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={getPathPoints()}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="6,6"
          className="animate-dash"
          filter="drop-shadow(0 1px 2px rgb(0 0 0 / 0.1)) drop-shadow(0 1px 1px rgb(0 0 0 / 0.06))"
        />
        {movementPath.points.map((point, index) => (
          <circle
            key={index}
            cx={(point.col + 0.5) * (100 / 8)}
            cy={(point.row + 0.5) * (100 / 8)}
            r="2"
            fill="#3b82f6"
            className="animate-pulse"
          />
        ))}
      </svg>
    </div>
  );
};

export default Board;