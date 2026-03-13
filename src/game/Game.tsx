import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MainScene } from './scenes/MainScene';
import { GAME_CONFIG } from './constants';

interface GameProps {
  width: number;
  height: number;
  onGameOver?: (score: number) => void;
}

const Game: React.FC<GameProps> = ({ width, height, onGameOver }) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    // Destroy existing game instance if any
    if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: width,
      height: height,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: GAME_CONFIG.gravity },
          debug: false,
        },
      },
      scene: [MainScene],
      scale: {
        mode: Phaser.Scale.NONE, // Manual Control
        autoCenter: Phaser.Scale.NO_CENTER,
      },
      backgroundColor: '#2d0a31',
    };

    gameInstanceRef.current = new Phaser.Game(config);
    
    // Listen for game-over event
    if (onGameOver) {
        gameInstanceRef.current.events.on('game-over', onGameOver);
    }

    return () => {
      if (gameInstanceRef.current) {
        // Cleanup listeners
        if (onGameOver) {
            gameInstanceRef.current.events.off('game-over', onGameOver);
        }
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount (or when width/height *structure* changes, but we handle resize below)

  // Handle Resize
  useEffect(() => {
    if (gameInstanceRef.current) {
      gameInstanceRef.current.scale.resize(width, height);
    }
  }, [width, height]);

  // Handle onGameOver prop change (if hot reload or dynamic change)
  useEffect(() => {
      if (!gameInstanceRef.current || !onGameOver) return;
      gameInstanceRef.current.events.off('game-over');
      gameInstanceRef.current.events.on('game-over', onGameOver);
      
      return () => {
          if (gameInstanceRef.current) {
            gameInstanceRef.current.events.off('game-over', onGameOver);
          }
      };
  }, [onGameOver]);

  return (
    <div className="w-full h-full bg-black overflow-hidden relative">
      <div id="phaser-game" ref={gameRef} className="w-full h-full" />
    </div>
  );
};

export default Game;
