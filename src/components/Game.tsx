import React, { useState, useEffect } from 'react';
import Board from './Board';
import GameInfo from './GameInfo';
import { initialGameState, getValidMoves, movePiece, checkForJumps, findPiecesWithJumps } from '../utils/gameLogic';
import { getBestMove } from '../utils/aiLogic';
import { Piece, Position, GameState } from '../types/game';
import { soundManager } from '../utils/sounds';

interface MovementPath {
  points: Position[];
  active: boolean;
}

const Game: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [movingPiece, setMovingPiece] = useState<Piece | null>(null);
  const [captureAnimation, setCaptureAnimation] = useState<Position | null>(null);
  const [mustJumpPieces, setMustJumpPieces] = useState<Piece[]>([]);
  const [movementPath, setMovementPath] = useState<MovementPath>({ points: [], active: false });
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  
  useEffect(() => {
    const hasJumps = checkForJumps(gameState);
    const jumpingPieces = hasJumps ? findPiecesWithJumps(gameState) : [];
    setMustJumpPieces(jumpingPieces);
    
    if (hasJumps !== gameState.mustJump) {
      setGameState(prevState => ({
        ...prevState,
        mustJump: hasJumps
      }));
    }

    if (gameState.isAIEnabled && gameState.currentPlayer === 'white' && !gameState.gameOver && !isAIThinking) {
      setIsAIThinking(true);
      
      const makeAIMove = async () => {
        let currentState = { ...gameState };
        let shouldContinue = true;
        let pathPoints: Position[] = [];
        
        while (shouldContinue) {
          const aiMove = getBestMove(currentState);
          if (!aiMove) break;
          
          setMovingPiece(aiMove.piece);
          pathPoints = [aiMove.piece.position, aiMove.to];
          setMovementPath({ points: pathPoints, active: true });
          
          await new Promise(resolve => setTimeout(resolve, 300));
          soundManager.playMove();
          
          const isCapture = Math.abs(aiMove.to.row - aiMove.piece.position.row) >= 2;
          if (isCapture) {
            const capturePos = {
              row: Math.floor((aiMove.to.row + aiMove.piece.position.row) / 2),
              col: Math.floor((aiMove.to.col + aiMove.piece.position.col) / 2)
            };
            
            if (currentState.board[capturePos.row][capturePos.col]) {
              setCaptureAnimation(capturePos);
              await new Promise(resolve => setTimeout(resolve, 300));
              soundManager.playCapture();
              await new Promise(resolve => setTimeout(resolve, 300));
            }
          }
          
          const willBecomeKing = 
            (!aiMove.piece.isKing && aiMove.piece.color === 'white' && aiMove.to.row === 7) ||
            (!aiMove.piece.isKing && aiMove.piece.color === 'black' && aiMove.to.row === 0);
          
          currentState = movePiece(currentState, aiMove.piece.position, aiMove.to);
          
          if (willBecomeKing) {
            await new Promise(resolve => setTimeout(resolve, 300));
            soundManager.playKing();
          }
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const movedPiece = currentState.board[aiMove.to.row][aiMove.to.col];
          if (movedPiece) {
            const furtherMoves = getValidMoves(currentState, movedPiece);
            shouldContinue = furtherMoves.length > 0 && furtherMoves.some(move => 
              Math.abs(move.row - movedPiece.position.row) >= 2
            );
          } else {
            shouldContinue = false;
          }
        }
        
        setMovementPath({ points: [], active: false });
        setMovingPiece(null);
        setCaptureAnimation(null);
        setGameState(currentState);
        setIsAIThinking(false);
      };
      
      makeAIMove();
    }
  }, [gameState.currentPlayer, gameState.isAIEnabled, gameState.gameOver, isAIThinking]);

  useEffect(() => {
    if (gameState.gameOver && gameState.winner) {
      setTimeout(() => {
        soundManager.playGameEnd(gameState.winner!, gameState.isAIEnabled);
      }, 500);
    }
  }, [gameState.gameOver, gameState.winner, gameState.isAIEnabled]);
  
  const handlePieceSelect = (piece: Piece) => {
    if (gameState.gameOver || isProcessingMove) return;
    if (piece.color !== gameState.currentPlayer) return;
    if (gameState.isAIEnabled && piece.color === 'white') return;
    if (isAIThinking) return;
    
    if (gameState.mustJump && !mustJumpPieces.some(p => p.id === piece.id)) {
      return;
    }
    
    const validMoves = getValidMoves(gameState, piece);
    
    setGameState(prevState => ({
      ...prevState,
      selectedPiece: piece,
      validMoves: validMoves
    }));
  };
  
  const handleSquareSelect = async (position: Position, draggedPiece?: Piece) => {
    if (gameState.gameOver || isProcessingMove) return;
    if (gameState.isAIEnabled && gameState.currentPlayer === 'white') return;
    if (isAIThinking) return;
    
    const pieceToMove = draggedPiece || gameState.selectedPiece;
    if (!pieceToMove) return;
    
    const validMoves = getValidMoves(gameState, pieceToMove);
    const move = validMoves.find(
      move => move.row === position.row && move.col === position.col
    );
    
    if (move) {
      setIsProcessingMove(true);
      const pathPoints = [pieceToMove.position, position];
      setMovementPath({ points: pathPoints, active: true });
      
      await new Promise(resolve => setTimeout(resolve, 100));
      soundManager.playMove();
      
      const isCapture = Math.abs(position.row - pieceToMove.position.row) >= 2;
      if (isCapture) {
        const capturePos = {
          row: Math.floor((position.row + pieceToMove.position.row) / 2),
          col: Math.floor((position.col + pieceToMove.position.col) / 2)
        };
        
        if (gameState.board[capturePos.row][capturePos.col]) {
          setCaptureAnimation(capturePos);
          await new Promise(resolve => setTimeout(resolve, 300));
          soundManager.playCapture();
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      const willBecomeKing = 
        (!pieceToMove.isKing && pieceToMove.color === 'white' && position.row === 7) ||
        (!pieceToMove.isKing && pieceToMove.color === 'black' && position.row === 0);
      
      const newGameState = movePiece(gameState, pieceToMove.position, position);
      
      if (willBecomeKing) {
        await new Promise(resolve => setTimeout(resolve, 300));
        soundManager.playKing();
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setMovementPath({ points: [], active: false });
      setCaptureAnimation(null);
      setGameState(newGameState);
      setIsProcessingMove(false);
    }
  };

  const handleRestart = (withAI: boolean, difficulty?: number) => {
    const newGameState = {
      ...initialGameState,
      isAIEnabled: withAI,
      aiDifficulty: difficulty || 1
    };
    setGameState(newGameState);
    setIsAIThinking(false);
    setMovingPiece(null);
    setCaptureAnimation(null);
    setMustJumpPieces([]);
    setMovementPath({ points: [], active: false });
    setIsProcessingMove(false);
  };
  
  return (
    <div className="w-full max-w-xl mx-auto">
      <Board
        board={gameState.board}
        selectedPiece={gameState.selectedPiece}
        validMoves={gameState.validMoves}
        onPieceSelect={handlePieceSelect}
        onSquareSelect={handleSquareSelect}
        movingPiece={movingPiece}
        captureAnimation={captureAnimation}
        mustJumpPieces={mustJumpPieces}
        movementPath={movementPath}
      />
      <GameInfo
        gameState={gameState}
        onRestart={handleRestart}
      />
    </div>
  );
};

export default Game;