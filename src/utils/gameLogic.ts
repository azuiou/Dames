import { GameState, Piece, PieceColor, Position, Move } from '../types/game';

export const initializeBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place white pieces
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          id: `white-${row}-${col}`,
          color: 'white',
          isKing: false,
          position: { row, col }
        };
      }
    }
  }
  
  // Place black pieces
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = {
          id: `black-${row}-${col}`,
          color: 'black',
          isKing: false,
          position: { row, col }
        };
      }
    }
  }
  
  return board;
};

export const initialGameState: GameState = {
  board: initializeBoard(),
  currentPlayer: 'black',
  selectedPiece: null,
  validMoves: [],
  capturedPieces: {
    black: 0,
    white: 0,
  },
  gameOver: false,
  winner: null,
  mustJump: false,
  jumpingPiece: null,
  isAIEnabled: false,
  capturePosition: null,
  aiDifficulty: 1,
  movesWithoutCapture: 0,
  isDraw: false
};

export const isValidPosition = (position: Position): boolean => {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
};

export const getValidMoves = (state: GameState, piece: Piece): Position[] => {
  if (!piece || piece.color !== state.currentPlayer) return [];
  
  const validMoves: Position[] = [];
  const jumpMoves: Position[] = [];
  const { row, col } = piece.position;
  
  const isAlreadyCaptured = (pos: Position): boolean => {
    if (!state.capturePosition) return false;
    return pos.row === state.capturePosition.row && pos.col === state.capturePosition.col;
  };
  
  if (piece.isKing) {
    const directions = [
      { rowDir: -1, colDir: -1 },
      { rowDir: -1, colDir: 1 },
      { rowDir: 1, colDir: -1 },
      { rowDir: 1, colDir: 1 }
    ];
    
    for (const dir of directions) {
      let currentRow = row + dir.rowDir;
      let currentCol = col + dir.colDir;
      let foundPiece = false;
      let capturePos: Position | null = null;
      
      while (isValidPosition({ row: currentRow, col: currentCol })) {
        const currentSquare = state.board[currentRow][currentCol];
        
        if (!currentSquare) {
          if (!foundPiece && !state.mustJump) {
            validMoves.push({ row: currentRow, col: currentCol });
          } else if (foundPiece && !isAlreadyCaptured(capturePos!)) {
            jumpMoves.push({
              row: currentRow,
              col: currentCol,
              capturePosition: capturePos
            });
          }
        } else if (!foundPiece && currentSquare.color !== piece.color) {
          foundPiece = true;
          capturePos = { row: currentRow, col: currentCol };
        } else {
          break;
        }
        
        currentRow += dir.rowDir;
        currentCol += dir.colDir;
      }
    }
  } else {
    const direction = piece.color === 'black' ? -1 : 1;
    
    if (!state.mustJump) {
      [-1, 1].forEach(colDir => {
        const newRow = row + direction;
        const newCol = col + colDir;
        if (isValidPosition({ row: newRow, col: newCol }) && !state.board[newRow][newCol]) {
          validMoves.push({ row: newRow, col: newCol });
        }
      });
    }
    
    [-2, 2].forEach(colDir => {
      const jumpRow = row + (direction * 2);
      const jumpCol = col + colDir;
      const captureRow = row + direction;
      const captureCol = col + (colDir / 2);
      
      if (isValidPosition({ row: jumpRow, col: jumpCol })) {
        const targetPiece = state.board[captureRow][captureCol];
        const capturePos = { row: captureRow, col: captureCol };
        
        if (targetPiece && 
            targetPiece.color !== piece.color && 
            !state.board[jumpRow][jumpCol] &&
            !isAlreadyCaptured(capturePos)) {
          jumpMoves.push({
            row: jumpRow,
            col: jumpCol,
            capturePosition: capturePos
          });
        }
      }
    });
    
    if (state.jumpingPiece?.id === piece.id) {
      [-2, 2].forEach(colDir => {
        const jumpRow = row + (direction * -2);
        const jumpCol = col + colDir;
        const captureRow = row + (direction * -1);
        const captureCol = col + (colDir / 2);
        
        if (isValidPosition({ row: jumpRow, col: jumpCol })) {
          const targetPiece = state.board[captureRow][captureCol];
          const capturePos = { row: captureRow, col: captureCol };
          
          if (targetPiece && 
              targetPiece.color !== piece.color && 
              !state.board[jumpRow][jumpCol] &&
              !isAlreadyCaptured(capturePos)) {
            jumpMoves.push({
              row: jumpRow,
              col: jumpCol,
              capturePosition: capturePos
            });
          }
        }
      });
    }
  }
  
  return jumpMoves.length > 0 ? jumpMoves : (state.mustJump ? [] : validMoves);
};

export const checkForJumps = (state: GameState): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === state.currentPlayer) {
        const moves = getValidMoves({ ...state, mustJump: true }, piece);
        if (moves.length > 0 && moves[0].capturePosition) {
          return true;
        }
      }
    }
  }
  return false;
};

export const findPiecesWithJumps = (state: GameState): Piece[] => {
  const pieces: Piece[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === state.currentPlayer) {
        const moves = getValidMoves({ ...state, mustJump: true }, piece);
        if (moves.length > 0 && moves[0].capturePosition) {
          pieces.push(piece);
        }
      }
    }
  }
  
  return pieces;
};

const countPieces = (board: (Piece | null)[][], color: PieceColor): number => {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.color === color) {
        count++;
      }
    }
  }
  return count;
};

export const checkGameOver = (state: GameState): { gameOver: boolean; winner: PieceColor | null; isDraw: boolean } => {
  if (state.movesWithoutCapture >= 30) {
    return { gameOver: true, winner: null, isDraw: true };
  }

  const blackPieces = countPieces(state.board, 'black');
  const whitePieces = countPieces(state.board, 'white');
  
  if (blackPieces === 0) return { gameOver: true, winner: 'white', isDraw: false };
  if (whitePieces === 0) return { gameOver: true, winner: 'black', isDraw: false };
  
  let canMove = false;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === state.currentPlayer) {
        const moves = getValidMoves({ ...state, mustJump: false }, piece);
        if (moves.length > 0) {
          canMove = true;
          break;
        }
      }
    }
    if (canMove) break;
  }
  
  if (!canMove) {
    return {
      gameOver: true,
      winner: state.currentPlayer === 'black' ? 'white' : 'black',
      isDraw: false
    };
  }
  
  return { gameOver: false, winner: null, isDraw: false };
};

export const movePiece = (state: GameState, from: Position, to: Position): GameState => {
  if (!isValidPosition(from) || !isValidPosition(to)) {
    return state;
  }
  
  const piece = state.board[from.row][from.col];
  if (!piece || piece.color !== state.currentPlayer) {
    return state;
  }
  
  const validMoves = getValidMoves(state, piece);
  const move = validMoves.find(m => m.row === to.row && m.col === to.col);
  if (!move) {
    return state;
  }
  
  const newBoard = state.board.map(row => [...row]);
  
  const isCapture = move.capturePosition !== undefined;
  let capturedPiece: Piece | null = null;
  
  if (isCapture && move.capturePosition) {
    capturedPiece = newBoard[move.capturePosition.row][move.capturePosition.col];
    if (capturedPiece) {
      newBoard[move.capturePosition.row][move.capturePosition.col] = null;
    }
  }
  
  const willBecomeKing = 
    (!piece.isKing && piece.color === 'black' && to.row === 0) ||
    (!piece.isKing && piece.color === 'white' && to.row === 7);
  
  const updatedPiece = {
    ...piece,
    position: { row: to.row, col: to.col },
    isKing: piece.isKing || willBecomeKing
  };
  
  newBoard[from.row][from.col] = null;
  newBoard[to.row][to.col] = updatedPiece;
  
  const newCapturedPieces = { ...state.capturedPieces };
  if (capturedPiece) {
    newCapturedPieces[capturedPiece.color]++;
  }

  // Mise à jour du compteur de coups sans prise
  const newMovesWithoutCapture = isCapture ? 0 : state.movesWithoutCapture + 1;
  
  if (!isCapture || willBecomeKing) {
    const nextPlayer = state.currentPlayer === 'black' ? 'white' : 'black';
    const hasJumps = checkForJumps({
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      mustJump: false
    });
    
    const gameOverCheck = checkGameOver({
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      movesWithoutCapture: newMovesWithoutCapture
    });
    
    return {
      ...state,
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      validMoves: [],
      capturedPieces: newCapturedPieces,
      mustJump: hasJumps,
      jumpingPiece: null,
      gameOver: gameOverCheck.gameOver,
      winner: gameOverCheck.winner,
      capturePosition: null,
      movesWithoutCapture: newMovesWithoutCapture,
      isDraw: gameOverCheck.isDraw
    };
  }
  
  const furtherMoves = getValidMoves({
    ...state,
    board: newBoard,
    mustJump: true,
    capturePosition: move.capturePosition
  }, updatedPiece);
  
  const hasMoreCaptures = furtherMoves.some(m => m.capturePosition !== undefined);
  
  if (hasMoreCaptures) {
    return {
      ...state,
      board: newBoard,
      capturedPieces: newCapturedPieces,
      selectedPiece: updatedPiece,
      validMoves: furtherMoves,
      mustJump: true,
      jumpingPiece: updatedPiece,
      capturePosition: move.capturePosition || null,
      movesWithoutCapture: 0
    };
  }
  
  const nextPlayer = state.currentPlayer === 'black' ? 'white' : 'black';
  const hasJumps = checkForJumps({
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    mustJump: false
  });
  
  const gameOverCheck = checkGameOver({
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    movesWithoutCapture: newMovesWithoutCapture
  });
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: nextPlayer,
    selectedPiece: null,
    validMoves: [],
    capturedPieces: newCapturedPieces,
    mustJump: hasJumps,
    jumpingPiece: null,
    gameOver: gameOverCheck.gameOver,
    winner: gameOverCheck.winner,
    capturePosition: null,
    movesWithoutCapture: newMovesWithoutCapture,
    isDraw: gameOverCheck.isDraw
  };
};