export const GAME_CONFIG = {
  width: 800,
  height: 600,
  gravity: 300,
  playerSpeed: 400,
  spawnInterval: 1000, // ms
  initialHealth: 100,
};

export const ITEMS = [
  { type: 'candy', score: 2, damage: 0, speed: 200 },
  { type: 'pumpkin', score: 5, damage: 0, speed: 250 },
  { type: 'jar', score: 7, damage: 0, speed: 300 },
  { type: 'cake', score: 10, damage: 0, speed: 350 },
  { type: 'bomb', score: 0, damage: 5, speed: 250 },
  { type: 'knife', score: 0, damage: 10, speed: 300 },
];
