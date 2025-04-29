import React from 'react';
import Game from './components/Game';

function App() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-amber-900 mb-6">Jeu de Dames</h1>
      <Game />
    </div>
  );
}

export default App;