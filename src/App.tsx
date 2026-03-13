import React, { useState, useEffect } from 'react';
import Game from './game/Game';
import { Settings, X, Trophy } from 'lucide-react';
import { supabase } from './db/supabase';

type Resolution = 'FULL' | '1280x720' | '1024x768' | '800x600';

interface ScoreEntry {
    player_name: string;
    score: number;
    created_at: string;
}

const App: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [resolution] = useState<Resolution>('800x600');
  
  // Game State
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAME_OVER'>('START');
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [lastScore, setLastScore] = useState<number | null>(null);

  // Track window size for FULL mode
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    fetchLeaderboard();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(10);
      
      if (!error && data) {
          setLeaderboard(data);
      }
  };

  const handleStartGame = () => {
      if (playerName.trim()) {
          setGameState('PLAYING');
      }
  };

  const handleGameOver = async (score: number) => {
      setLastScore(score);
      // Save Score
      if (playerName) {
          await supabase.from('scores').insert({
              player_name: playerName,
              score: score
          });
          // Refresh leaderboard
          await fetchLeaderboard();
      }
      setGameState('GAME_OVER');
  };

  // Calculate actual game dimensions
  const getGameDimensions = () => {
    if (resolution === 'FULL') {
      return { width: windowSize.width, height: windowSize.height };
    }
    const [w, h] = resolution.split('x').map(Number);
    return { width: w, height: h };
  };

  const { width, height } = getGameDimensions();

  // Container Styles
  const isFixed = resolution !== 'FULL';
  const containerClass = isFixed
    ? "relative rounded-lg border-4 border-gray-700 shadow-2xl overflow-hidden mx-auto"
    : "fixed inset-0 w-full h-full";
  
  const containerStyle = isFixed
    ? { width: width, height: height }
    : {};

  return (
    <div className={`w-full min-h-screen bg-gray-900 overflow-hidden relative flex items-center justify-center`}>
      
      {/* Game Area */}
      {gameState === 'PLAYING' ? (
        <div className={containerClass} style={containerStyle}>
          <Game width={width} height={height} onGameOver={handleGameOver} />
        </div>
      ) : (
        /* Start / Game Over Screen */
        <div className="bg-gray-800 p-8 rounded-lg max-w-2xl w-full border-4 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.4)] text-center relative z-20">
            <h1 className="text-4xl font-bold text-orange-500 mb-2 font-['Press_Start_2P'] uppercase tracking-widest leading-relaxed">
              Halloween<br/>Catcher
            </h1>
            
            {gameState === 'GAME_OVER' && (
                <div className="mb-6 animate-pulse">
                    <h2 className="text-2xl text-red-500 font-['Press_Start_2P'] mb-2">GAME OVER</h2>
                    <p className="text-white font-mono text-xl">Score: <span className="text-yellow-400 font-bold">{lastScore}</span></p>
                </div>
            )}

            <div className="mb-8">
                <label className="block text-gray-400 text-sm mb-2 font-mono">ENTER YOUR NAME TO PLAY</label>
                <input 
                    type="text" 
                    maxLength={15}
                    placeholder="Player Name"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    className="w-full max-w-xs bg-gray-900 border-2 border-gray-600 rounded p-3 text-center text-white font-['Press_Start_2P'] focus:border-purple-500 focus:outline-none uppercase"
                />
            </div>

            <button
              onClick={handleStartGame}
              disabled={!playerName.trim()}
              className={`w-full max-w-xs font-bold py-4 px-8 rounded-lg transform transition text-xl font-['Press_Start_2P'] shadow-lg mb-8
                  ${playerName.trim() 
                      ? 'bg-purple-600 hover:bg-purple-500 text-white hover:scale-105 active:scale-95 cursor-pointer' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
            >
              {gameState === 'GAME_OVER' ? 'PLAY AGAIN' : 'START GAME'}
            </button>

            {/* Leaderboard Section */}
            <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center justify-center gap-2 mb-4 text-yellow-500">
                    <Trophy size={24} />
                    <h3 className="text-xl font-['Press_Start_2P']">TOP SCORES</h3>
                </div>
                
                <div className="bg-gray-900 rounded-lg p-4 max-h-60 overflow-y-auto font-mono text-sm border border-gray-700">
                    {leaderboard.length > 0 ? (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-800">
                                    <th className="pb-2 pl-2">RANK</th>
                                    <th className="pb-2">NAME</th>
                                    <th className="pb-2 text-right pr-2">SCORE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr key={index} className={`border-b border-gray-800/50 ${entry.player_name === playerName ? 'bg-purple-900/30' : ''}`}>
                                        <td className="py-2 pl-4 text-gray-400">#{index + 1}</td>
                                        <td className="py-2 text-white">{entry.player_name}</td>
                                        <td className="py-2 pr-2 text-right text-yellow-400 font-bold">{entry.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-gray-500 py-4">No scores yet. Be the first!</p>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Settings Button */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 z-50 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors border border-gray-600 shadow-lg flex items-center justify-center w-12 h-12"
        title="Settings"
      >
        <Settings size={24} />
      </button>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full border border-orange-500 relative shadow-[0_0_20px_rgba(234,88,12,0.3)]">
            <button 
              onClick={() => setShowSettings(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-xl font-bold text-orange-500 mb-6 font-['Press_Start_2P'] text-center">HOW TO PLAY</h2>
            
            <div className="space-y-6 text-gray-200 font-mono text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">👻</span>
                <div>
                  <h3 className="font-bold text-orange-400 mb-1">MOVEMENT</h3>
                  <p>Use <span className="font-bold text-white">ARROW KEYS</span> or <span className="font-bold text-white">TOUCH</span> to move left/right.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🍬</span>
                <div>
                  <h3 className="font-bold text-green-400 mb-1">COLLECT</h3>
                  <p>Catch Candy & Pumpkins for points!</p>
                  <p className="text-xs text-gray-400 mt-1">Candy (+2), Pumpkin (+5), Jar (+7), Cake (+10)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💣</span>
                <div>
                  <h3 className="font-bold text-red-400 mb-1">AVOID</h3>
                  <p>Dodging Bombs (-5 HP) and Knives (-10 HP)!</p>
                </div>
              </div>

              <div className="text-center text-cyan-400 mt-4 border-t border-gray-600 pt-3">
                <p>⚡ Level up every 50 points!</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded transition-colors font-['Press_Start_2P'] text-sm"
            >
              RESUME
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
