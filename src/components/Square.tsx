import React from 'react';
import { Position, Piece } from '../types/game';

interface SquareProps {
  position: Position;
  isBlack: boolean;
  isValidMove: boolean;
  onSquareSelect: (position: Position, draggedPiece?: Piece) => void;
  children?: React.ReactNode;
}

const Square: React.FC<SquareProps> = ({ 
  position, 
  isBlack, 
  isValidMove, 
  onSquareSelect,
  children 
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    if (isValidMove) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isValidMove) {
      try {
        const data = e.dataTransfer.getData('application/json');
        if (!data) {
          console.error('No data received during drag and drop');
          return;
        }
        const piece = JSON.parse(data) as Piece;
        if (!piece || !piece.position) {
          console.error('Invalid piece data received:', piece);
          return;
        }
        onSquareSelect(position, piece);
      } catch (error) {
        console.error('Error processing drag data:', error);
      }
    }
  };

  return (
    <div 
      className={`
        relative w-full aspect-square 
        ${isBlack ? 'bg-amber-800' : 'bg-amber-200'} 
        ${isValidMove ? 'after:absolute after:inset-0 after:bg-green-500 after:bg-opacity-50 after:rounded-full after:m-auto after:w-1/3 after:h-1/3' : ''}
        transition-all duration-200
      `}
      onClick={() => onSquareSelect(position)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      data-row={position.row}
      data-col={position.col}
    >
      {children}
    </div>
  );
};

export default Square;