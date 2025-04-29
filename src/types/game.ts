export type PieceColor = 'black' | 'white';

export interface Position {
  row: number;
  col: number;
  capturePosition?: Position | null;
}

export interface Piece {
  id: string;
  color: PieceColor;
  isKing: boolean;
  position: Position;
}

export interface Move {
  from: Position;
  to: Position;
  capturedPieces?: Position[];
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  selectedPiece: Piece | null;
  validMoves: Position[];
  capturedPieces: {
    black: number;
    white: number;
  };
  gameOver: boolean;
  winner: PieceColor | null;
  mustJump: boolean;
  jumpingPiece: Piece | null;
  isAIEnabled: boolean;
  capturePosition: Position | null;
  aiDifficulty: number;
  movesWithoutCapture: number;
  isDraw: boolean;
}