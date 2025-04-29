import React, { useEffect, useState } from 'react';
import { Piece as PieceType, Position } from '../types/game';
import { Swords, Crown } from 'lucide-react';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  onPieceSelect: (piece: PieceType) => void;
  validMoves: Position[];
  isMoving?: boolean;
  mustJump?: boolean;
}

const Piece: React.FC<PieceProps> = ({ 
  piece, 
  isSelected, 
  onPieceSelect, 
  validMoves, 
  isMoving,
  mustJump 
}) => {
  const { color, isKing } = piece;
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [prevPosition, setPrevPosition] = useState(piece.position);
  
  useEffect(() => {
    if (prevPosition.row !== piece.position.row || prevPosition.col !== piece.position.col) {
      const dx = (piece.position.col - prevPosition.col) * 100;
      const dy = (piece.position.row - prevPosition.row) * 100;
      
      setPosition({ x: -dx, y: -dy });
      requestAnimationFrame(() => {
        setPosition({ x: 0, y: 0 });
      });
      
      setPrevPosition(piece.position);
    }
  }, [piece.position, prevPosition]);

  const handleDragStart = (e: React.DragEvent) => {
    const pieceData = {
      ...piece,
      position: { ...piece.position }
    };
    e.dataTransfer.setData('application/json', JSON.stringify(pieceData));
    e.dataTransfer.effectAllowed = 'move';
    onPieceSelect(piece);
  };

  return (
    <div 
      className={`
        absolute inset-2 rounded-full cursor-grab
        piece-transition
        ${color === 'black' ? 'bg-gray-900' : 'bg-gray-100'} 
        ${isSelected ? 'ring-4 ring-blue-500 scale-110 z-10' : ''}
        ${isMoving ? 'scale-110 ring-2 ring-yellow-400 z-20 animate-[float_1s_ease-in-out_infinite]' : ''}
        ${mustJump ? 'ring-2 ring-red-500' : ''}
        flex items-center justify-center
        shadow-lg hover:shadow-xl
        active:cursor-grabbing
        hover:scale-105
        group
      `}
      style={{
        transform: `translate(${position.x}%, ${position.y}%)`,
      }}
      draggable="true"
      onDragStart={handleDragStart}
      onClick={(e) => {
        e.stopPropagation();
        onPieceSelect(piece);
      }}
    >
      {mustJump && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-bounce z-30 group-hover:scale-110">
          <Swords className="w-4 h-4 text-white" />
        </div>
      )}
      {isKing && (
        <div className={`
          w-3/4 h-3/4
          flex items-center justify-center
          ${color === 'black' ? 'text-yellow-400' : 'text-yellow-600'}
          animate-[float_1.5s_ease-in-out_infinite]
        `}>
          <Crown className="w-full h-full drop-shadow-lg" />
        </div>
      )}
    </div>
  );
};

export default Piece;