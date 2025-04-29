import { GameState, Piece, Position, PieceColor } from '../types/game';
import { getValidMoves, movePiece, checkForJumps, isValidPosition } from './gameLogic';

const evaluateBoard = (state: GameState, difficulty: number = 1): number => {
  let score = 0;
  
  // Réduit les bonus pour l'IA facile
  const difficultyMultiplier = Math.max(0.3, difficulty / 3);
  
  // Bonus pour les prises multiples disponibles (réduit pour l'IA facile)
  const hasJumps = checkForJumps(state);
  if (hasJumps && state.currentPlayer === 'white') {
    score += difficultyMultiplier;
  }
  
  // Compte les pièces de chaque couleur
  let whitePieces = 0;
  let blackPieces = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece) {
        if (piece.color === 'white') whitePieces++;
        else blackPieces++;
        
        // Valeur de base réduite pour l'IA facile
        const value = piece.isKing ? 3 * difficultyMultiplier : 1;
        
        // Bonus de position réduit
        const positionBonus = piece.color === 'white' ? 
          (7 - row) * 0.1 * difficultyMultiplier : 
          row * 0.1;
        
        // Bonus pour le contrôle du centre réduit
        const centerBonus = (Math.abs(3.5 - col) < 2 && Math.abs(3.5 - row) < 2) ? 
          0.2 * difficultyMultiplier : 0;
        
        // Bonus pour les pièces protégées réduit
        const isProtected = isProtectedPiece(state.board, piece);
        const protectionBonus = isProtected ? 0.1 * difficultyMultiplier : 0;
        
        // Bonus pour l'avancement vers le camp adverse
        const advancementBonus = piece.color === 'white' ? 
          (row / 7) * 0.3 * difficultyMultiplier : 
          ((7 - row) / 7) * 0.3;
        
        if (piece.color === 'white') {
          score += value + positionBonus + centerBonus + protectionBonus + advancementBonus;
        } else {
          score -= value + positionBonus + centerBonus + protectionBonus + advancementBonus;
        }
      }
    }
  }
  
  // Bonus spécial pour la dernière pièce
  if (whitePieces === 1) {
    // Encourage l'IA à se rapprocher des pièces adverses quand elle n'a qu'une pièce
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = state.board[row][col];
        if (piece && piece.color === 'white') {
          // Trouve la pièce noire la plus proche
          let minDistance = Infinity;
          for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
              const target = state.board[r][c];
              if (target && target.color === 'black') {
                const distance = Math.abs(row - r) + Math.abs(col - c);
                minDistance = Math.min(minDistance, distance);
              }
            }
          }
          // Bonus inversement proportionnel à la distance
          score += (14 - minDistance) * 0.2;
        }
      }
    }
  }
  
  return score;
};

// Vérifie si une pièce est protégée par d'autres pièces
const isProtectedPiece = (board: (Piece | null)[][], piece: Piece): boolean => {
  const { row, col } = piece.position;
  const directions = piece.isKing ? [-1, 1] : [piece.color === 'white' ? 1 : -1];
  
  for (const rowDir of directions) {
    for (const colDir of [-1, 1]) {
      const adjRow = row + rowDir;
      const adjCol = col + colDir;
      
      if (isValidPosition({ row: adjRow, col: adjCol })) {
        const adjPiece = board[adjRow][adjCol];
        if (adjPiece && adjPiece.color === piece.color) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Simule un coup complet avec prises multiples
const simulateCompleteMove = (state: GameState, piece: Piece, move: Position): GameState => {
  // Vérifier si le mouvement est valide avant de continuer
  const validMoves = getValidMoves(state, piece);
  const isValidMove = validMoves.some(m => m.row === move.row && m.col === move.col);
  if (!isValidMove) return state;

  let currentState = movePiece(state, piece.position, move);
  let moveCount = 0;
  const maxMoves = 3; // Réduit la limite de mouvements consécutifs
  const visitedPositions = new Set<string>();
  
  // Ajouter la position initiale
  visitedPositions.add(`${piece.position.row},${piece.position.col}`);
  
  // Vérifie si la pièce existe toujours après le mouvement
  let currentPiece = currentState.board[move.row][move.col];
  
  while (currentState.mustJump && currentPiece && moveCount < maxMoves) {
    const currentPos = `${currentPiece.position.row},${currentPiece.position.col}`;
    if (visitedPositions.has(currentPos)) {
      break;
    }
    visitedPositions.add(currentPos);
    
    const furtherMoves = getValidMoves(currentState, currentPiece);
    const validJumps = furtherMoves.filter(m => {
      const isJump = Math.abs(m.row - currentPiece!.position.row) >= 2;
      const newPos = `${m.row},${m.col}`;
      return isJump && !visitedPositions.has(newPos);
    });
    
    if (validJumps.length === 0) break;
    
    // Prend le premier saut valide au lieu d'évaluer tous les sauts
    const nextMove = validJumps[0];
    const prevState = JSON.stringify(currentState.board);
    currentState = movePiece(currentState, currentPiece.position, nextMove);
    
    if (JSON.stringify(currentState.board) === prevState) {
      break;
    }
    
    currentPiece = currentState.board[nextMove.row][nextMove.col];
    moveCount++;
    
    if (currentPiece && currentPiece.isKing && !piece.isKing) {
      break;
    }
  }
  
  return currentState;
};

// Algorithme MinMax avec élagage alpha-beta
const minMax = (
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  difficulty: number = 1,
  moveHistory: Set<string> = new Set()
): { score: number; move?: { piece: Piece; to: Position } } => {
  if (depth === 0 || state.gameOver) {
    return { score: evaluateBoard(state, difficulty) };
  }

  const currentColor: PieceColor = maximizingPlayer ? 'white' : 'black';
  let bestMove: { piece: Piece; to: Position } | undefined;
  
  const allMoves: { piece: Piece; moves: Position[] }[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = state.board[row][col];
      if (piece && piece.color === currentColor) {
        const moves = getValidMoves(state, piece);
        if (moves.length > 0) {
          allMoves.push({ piece, moves });
        }
      }
    }
  }
  
  if (allMoves.length === 0) {
    return { score: evaluateBoard(state, difficulty) };
  }
  
  // Mélange aléatoirement les mouvements pour éviter les boucles
  allMoves.sort(() => Math.random() - 0.5);
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    
    for (const { piece, moves } of allMoves) {
      for (const move of moves) {
        const moveKey = `${piece.id}-${move.row}-${move.col}`;
        if (moveHistory.has(moveKey)) continue;
        
        const newHistory = new Set(moveHistory);
        newHistory.add(moveKey);
        
        const newState = simulateCompleteMove(state, piece, move);
        const evalResult = minMax(newState, depth - 1, alpha, beta, false, difficulty, newHistory);
        
        if (evalResult.score > maxEval) {
          maxEval = evalResult.score;
          bestMove = { piece, to: move };
        }
        alpha = Math.max(alpha, evalResult.score);
        if (beta <= alpha) break;
      }
    }
    
    return { score: maxEval, move: bestMove };
  } else {
    let minEval = Infinity;
    
    for (const { piece, moves } of allMoves) {
      for (const move of moves) {
        const moveKey = `${piece.id}-${move.row}-${move.col}`;
        if (moveHistory.has(moveKey)) continue;
        
        const newHistory = new Set(moveHistory);
        newHistory.add(moveKey);
        
        const newState = simulateCompleteMove(state, piece, move);
        const evalResult = minMax(newState, depth - 1, alpha, beta, true, difficulty, newHistory);
        
        if (evalResult.score < minEval) {
          minEval = evalResult.score;
          bestMove = { piece, to: move };
        }
        beta = Math.min(beta, evalResult.score);
        if (beta <= alpha) break;
      }
    }
    
    return { score: minEval, move: bestMove };
  }
};

// Fonction principale pour obtenir le meilleur coup de l'IA
export const getBestMove = (state: GameState): { piece: Piece; to: Position } | null => {
  const difficulty = state.aiDifficulty || 1;
  const depth = Math.min(2 + difficulty, 4);
  
  let whitePieces = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (state.board[row][col]?.color === 'white') {
        whitePieces++;
      }
    }
  }
  
  // Utilise une profondeur plus faible quand il ne reste qu'une pièce
  const finalDepth = whitePieces === 1 ? 3 : depth;
  
  const result = minMax(state, finalDepth, -Infinity, Infinity, true, difficulty, new Set());
  
  // Vérifie si le mouvement est valide avant de le retourner
  if (result.move) {
    const validMoves = getValidMoves(state, result.move.piece);
    const isValidMove = validMoves.some(m => 
      m.row === result.move!.to.row && m.col === result.move!.to.col
    );
    return isValidMove ? result.move : null;
  }
  
  return null;
};