import React, { useEffect } from 'react';
import { GameState, PieceColor } from '../types/game';
import { RefreshCw, Monitor, Brain, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/sounds';

interface GameInfoProps {
  gameState: GameState;
  onRestart: (withAI: boolean, difficulty?: number) => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState, onRestart }) => {
  const { currentPlayer, capturedPieces, gameOver, winner, isAIEnabled, aiDifficulty, isDraw } = gameState;
  const [isSoundEnabled, setIsSoundEnabled] = React.useState(true);
  const [volume, setVolume] = React.useState(1);
  
  useEffect(() => {
    if (gameOver) {
      if (isDraw) {
        // Animation de confettis blancs pour le match nul
        const duration = 2000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffffff'],
            shapes: ['circle'],
          });
          
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffffff'],
            shapes: ['circle'],
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        
        frame();
      } else if (winner) {
        if ((winner === 'black' && !isAIEnabled) || (winner === 'black' && isAIEnabled)) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } else {
          const duration = 1000;
          const end = Date.now() + duration;
          
          const frame = () => {
            confetti({
              particleCount: 2,
              angle: 60,
              spread: 55,
              origin: { x: 0 },
              colors: ['#ff0000']
            });
            
            confetti({
              particleCount: 2,
              angle: 120,
              spread: 55,
              origin: { x: 1 },
              colors: ['#ff0000']
            });
            
            if (Date.now() < end) {
              requestAnimationFrame(frame);
            }
          };
          
          frame();
        }
      }
    }
  }, [gameOver, winner, isAIEnabled, isDraw]);

  const getPlayerName = (color: PieceColor): string => {
    if (color === 'white' && isAIEnabled) {
      return 'Ordinateur';
    }
    return color === 'black' ? 'Noir' : 'Blanc';
  };
  
  const getDifficultyName = (level: number): string => {
    switch (level) {
      case 1: return 'Facile';
      case 2: return 'Moyen';
      case 3: return 'Difficile';
      default: return 'Facile';
    }
  };

  const handleSoundToggle = () => {
    const enabled = soundManager.toggleSound();
    setIsSoundEnabled(enabled);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    soundManager.setVolume(newVolume);
  };
  
  return (
    <div className="w-full max-w-md mx-auto mt-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tour actuel</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSoundToggle}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={isSoundEnabled ? 'Désactiver le son' : 'Activer le son'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 text-gray-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-400" />
              )}
            </button>
            {isSoundEnabled && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                title={`Volume: ${Math.round(volume * 100)}%`}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={`
              w-4 h-4 rounded-full
              ${currentPlayer === 'black' ? 'bg-gray-900' : 'bg-gray-100 border border-gray-400'}
            `}></div>
            <span>{getPlayerName(currentPlayer)}</span>
          </div>
        </div>
      </div>
      
      {gameOver ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Partie terminée</h2>
          {isDraw ? (
            <p className="text-xl text-gray-600">Match nul !</p>
          ) : winner && (
            <p className={`text-xl ${winner === 'black' ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-semibold">
                {getPlayerName(winner)}
              </span>{' '}
              a gagné!
            </p>
          )}
          <div className="flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
                onClick={() => onRestart(false)}
              >
                <RefreshCw size={18} />
                2 Joueurs
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                onClick={() => onRestart(true, 1)}
              >
                <Monitor size={18} />
                IA Facile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                onClick={() => onRestart(true, 2)}
              >
                <Brain size={18} />
                IA Moyenne
              </button>
              <button
                className="px-4 py-2 bg-blue-800 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors"
                onClick={() => onRestart(true, 3)}
              >
                <Brain size={18} />
                IA Difficile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {isAIEnabled && (
            <div className="mb-4 text-center">
              <p className="text-sm text-gray-600">
                Difficulté : {getDifficultyName(aiDifficulty)}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-gray-100 p-2 rounded">
              <p className="font-medium">Pièces noires capturées</p>
              <p className="text-2xl font-bold">{capturedPieces.black}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded">
              <p className="font-medium">Pièces blanches capturées</p>
              <p className="text-2xl font-bold">{capturedPieces.white}</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors"
                onClick={() => onRestart(false)}
              >
                <RefreshCw size={18} />
                2 Joueurs
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                onClick={() => onRestart(true, 1)}
              >
                <Monitor size={18} />
                IA Facile
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                onClick={() => onRestart(true, 2)}
              >
                <Brain size={18} />
                IA Moyenne
              </button>
              <button
                className="px-4 py-2 bg-blue-800 text-white rounded-md flex items-center justify-center gap-2 hover:bg-blue-900 transition-colors"
                onClick={() => onRestart(true, 3)}
              >
                <Brain size={18} />
                IA Difficile
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default GameInfo;