import Phaser from 'phaser';
import { GAME_CONFIG, ITEMS } from '../constants';

export class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  private health: number = GAME_CONFIG.initialHealth;
  private scoreText!: Phaser.GameObjects.Text;
  private level: number = 1;
  private levelText!: Phaser.GameObjects.Text;
  private itemsGroup!: Phaser.Physics.Arcade.Group;
  private spawnEvent!: Phaser.Time.TimerEvent;
  private isGameOver: boolean = false;
  private bg!: Phaser.GameObjects.Image;

  private spawnDelay: number = GAME_CONFIG.spawnInterval;

  constructor() {
    super('MainScene');
  }

  init() {
    this.spawnDelay = GAME_CONFIG.spawnInterval;
  }

  preload() {
    this.load.image('background', 'https://miaoda-site-img.s3cdn.medo.dev/images/KLing_5c1a0bfe-4af7-4ee2-a1c0-bba01432dafc.jpg');
  }

  createPixelTexture(key: string, pixelData: string[], palette: Record<string, string>, scale: number = 2) {
    if (this.textures.exists(key)) return;

    const width = pixelData[0].length;
    const height = pixelData.length;
    
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const char = pixelData[y][x];
        if (char !== '.' && palette[char]) {
          ctx.fillStyle = palette[char];
          ctx.fillRect(x * scale, y * scale, scale, scale);
        }
      }
    }

    this.textures.addCanvas(key, canvas);
  }

  createTextures() {
    // Colors
    const C = {
        W: '#FFFFFF', // White
        B: '#000000', // Black
        O: '#FFA500', // Orange
        G: '#32CD32', // Lime Green
        R: '#FF0000', // Red
        P: '#800080', // Purple
        Y: '#FFD700', // Gold
        Gy: '#808080', // Gray
        Br: '#8B4513', // Brown
        Pi: '#FFC0CB', // Pink
        Cy: '#00FFFF', // Cyan (Glowing potion)
    };

    // Ghost (Player) - 16x16
    this.createPixelTexture('ghost', [
        '.....WWWWW......',
        '...WWWWWWWWW....',
        '..WWWWWWWWWWW...',
        '.WWWWWWWWWWWWW..',
        '.WWWWWWWWWWWWW..',
        '.WWWWWWWWWWWWW..',
        'WWWWWWWWWWWWWWW.',
        'W BW WWWW BW WW.',
        'WWWWWWWWWWWWWWW.',
        'WWWWWWWWWWWWWWW.',
        'WWWWWWWWWWWWWWW.',
        'WWWWWWWWWWWWWWW.',
        'WWWWWWWWWWWWWWW.',
        'W.W.W.W.W.W.W.W.', // Feet
        '.W.W.W.W.W.W.W..',
        '................'
    ], C, 2); // Scale 2

    // Candy - 16x16
    this.createPixelTexture('candy', [
        '....RRR.........',
        '..RRWWWRR.......',
        '.RRWWWWWRR......',
        '.RRWWWWWRR......',
        '..RRWWWRR.......',
        '...RRRR.........',
        '......WW........',
        '.....WWWW.......',
        '....WWWWWW......',
        '...WWWWWWWW.....',
        '..WWWWWWWWWW....',
        '.WWWWWWWWWWWW...',
        '..WWWWWWWWWW....',
        '...WWWWWWWW.....',
        '....WWWWWW......',
        '.....WWWW.......'
    ], C, 2);

    // Pumpkin - 16x16
    this.createPixelTexture('pumpkin', [
        '.......GG.......',
        '......GGGG......',
        '....OOOOOOOO....',
        '...OOOOOOOOOO...',
        '..OOOOOOOOOOOO..',
        '.OOOOOOOOOOOOOO.',
        '.OOOOOOOOOOOOOO.',
        '.OO BO OO BO OO.', // Eyes
        '.OOOOOOOOOOOOOO.',
        '.OOO B OO B OOO.', // Nose
        '.OOOOOOOOOOOOOO.',
        '.OOOO BBBB OOOO.', // Mouth
        '..OOOOOOOOOOOO..',
        '...OOOOOOOOOO...',
        '....OOOOOOOO....',
        '................'
    ], C, 2);
    
    // Jar (Green potion) - 16x16
    this.createPixelTexture('jar', [
        '.....GyGyGy.....',
        '.....GyGyGy.....',
        '....GGGGGGGGG...',
        '...G.........G..',
        '..G...CyCyCy..G.',
        '..G...CyCyCy..G.',
        '..G...CyCyCy..G.',
        '..G...........G.',
        '..G...CyCyCy..G.',
        '..G...CyCyCy..G.',
        '..G...CyCyCy..G.',
        '..G...........G.',
        '..G...CyCyCy..G.',
        '...GGGGGGGGGGG..',
        '................',
        '................'
    ], C, 2);

    // Cake - 16x16
    this.createPixelTexture('cake', [
        '.......R........', // Cherry
        '......WW........', // Cream
        '.....WWWW.......',
        '....WWWWWW......',
        '...BBBBBBBB.....', // Chocolate
        '..BBBBBBBBBB....',
        '.PiPiPiPiPiPi...', // Filling
        'BBBBBBBBBBBBBB..',
        'BBBBBBBBBBBBBB..',
        'BBBBBBBBBBBBBB..',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
    ], C, 2);

    // Bomb - 16x16
    this.createPixelTexture('bomb', [
        '.......Y........', // Spark
        '......W.........', // Wick
        '.....B..........',
        '....BBBB........',
        '...BBBBBB.......',
        '..BBBBBBBB......',
        '.BBBBBBBBBB.....',
        '.BBBBBBBBBB.....',
        '.BBBBBBBBBB.....',
        '..BBBBBBBB......',
        '...BBBBBB.......',
        '....BBBB........',
        '................',
        '................',
        '................',
        '................'
    ], C, 2);
    
    // Knife - 16x16
    this.createPixelTexture('knife', [
        '..............W.', // Blade tip
        '............WW..',
        '..........WW....',
        '........WW......',
        '......WW........',
        '....WW..........',
        '...Br...........', // Handle
        '..Br............',
        '.Br.............',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................',
        '................'
    ], C, 2);
    
    // Particle Texture (1x1 white pixel)
    const particleCanvas = document.createElement('canvas');
    particleCanvas.width = 4;
    particleCanvas.height = 4;
    const ctx = particleCanvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 4, 4);
    }
    this.textures.addCanvas('particle', particleCanvas);
  }

  create() {
    this.isGameOver = false;
    this.score = 0;
    this.level = 1;
    this.health = GAME_CONFIG.initialHealth;
    
    this.createTextures();

    // Background
    const { width, height } = this.scale;
    this.bg = this.add.image(width / 2, height / 2, 'background');
    this.resizeBackground();
    
    // Ambient Animation: Subtle Zoom Pulse (REMOVED per user request)
    // this.tweens.add({
    //     targets: this.bg,
    //     scaleX: this.bg.scaleX * 1.05,
    //     scaleY: this.bg.scaleY * 1.05,
    //     duration: 5000,
    //     yoyo: true,
    //     repeat: -1,
    //     ease: 'Sine.easeInOut'
    // });

    // Ambient Effects: Fireflies
    this.add.particles(0, 0, 'particle', {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
        lifespan: { min: 2000, max: 4000 },
        speed: { min: 10, max: 30 },
        scale: { start: 0.5, end: 0 },
        alpha: { start: 0, end: 0.8 },
        tint: [0x00FF00, 0xFFFF00], // Green/Yellow
        blendMode: 'ADD',
        frequency: 100,
        quantity: 1
    });

    // Ambient Effects: Lightning (Random)
    this.time.addEvent({
        delay: 5000,
        callback: this.triggerLightning,
        callbackScope: this,
        loop: true
    }); 

    // Player (Sprite)
    this.player = this.physics.add.sprite(width / 2, height - 80, 'ghost') as any; // Moved up
    // Make smaller (16x16 * 2 = 32px)
    this.player.setScale(2);
    
    // Ghost Float Animation
    this.tweens.add({
        targets: this.player,
        y: this.player.y - 10,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
    
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setImmovable(true);
    body.setAllowGravity(false); // Fix: Prevent player from falling
    // Shrink hitbox slightly
    body.setSize(10, 10);
    body.setOffset(3, 3);

    
    // Input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
    
    // Touch/Mouse Input for mobile
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        if (!this.isGameOver) {
            const body = this.player.body as Phaser.Physics.Arcade.Body;
            const newX = Phaser.Math.Clamp(pointer.x, 24, this.scale.width - 24);
            // Flip based on movement direction
            if (newX > this.player.x) {
                this.player.setFlipX(true);
            } else if (newX < this.player.x) {
                this.player.setFlipX(false);
            }
            this.player.x = newX;
        }
    });

    // Items Group
    this.itemsGroup = this.physics.add.group();

    // Spawning
    this.spawnEvent = this.time.addEvent({
      delay: this.spawnDelay,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true,
    });

    // UI
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#ffffff',
    });

    this.levelText = this.add.text(16, 50, 'LEVEL: 1', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#00FFFF', // Cyan
    });

    this.healthText = this.add.text(width - 250, 16, `HP: ${this.health}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#00FF00', // Green
    });

    // Collision
    this.physics.add.overlap(
      this.player,
      this.itemsGroup,
      this.handleCollectItem,
      undefined,
      this
    );
    
    // Resize Handler
    this.scale.on('resize', this.handleResize, this);
  }

  resizeBackground() {
    const { width, height } = this.scale;
    if (!this.bg) return;
    
    // Reset position
    this.bg.setPosition(width / 2, height / 2);

    // Use LINEAR filter for background image (JPG) to avoid pixelated artifacts
    // Sprites will remain pixel art (NEAREST)
    const texture = this.textures.get('background');
    if (!texture) return;
    texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    
    // Calculate scale factor using "Cover" strategy to fill screen
    const scaleX = width / this.bg.width;
    const scaleY = height / this.bg.height;
    
    // Math.max (Cover) ensures no black bars, but crops.
    // If the user wants to "see fully", maybe they prefer Fit (Math.min) with bars?
    // Given "minimize" + "see fully", I suspect they saw a zoomed-in pixelated mess with previous logic.
    // Now with LINEAR filter and proper Cover scaling, it should look better.
    // However, if they truly want "see fully" (no crop), I'll use Math.min and center.
    // Let's stick with Cover for now as it's standard for backgrounds, but ensure centering.
    
    const scale = Math.max(scaleX, scaleY);
    this.bg.setScale(scale).setScrollFactor(0);
  }

  handleResize(gameSize: Phaser.Structs.Size) {
    const width = gameSize.width;
    const height = gameSize.height;

    this.physics.world.setBounds(0, 0, width, height);

    this.resizeBackground();

    // Reposition UI
    if (this.healthText) this.healthText.setX(width - 250);

    // Update Game Over screen elements if they exist
    const overlay = this.children.getByName('gameOverOverlay') as Phaser.GameObjects.Rectangle;
    if (overlay) {
        overlay.setSize(width, height);
        overlay.setPosition(width / 2, height / 2);
    }
    const t1 = this.children.getByName('gameOverText1') as Phaser.GameObjects.Text;
    if (t1) t1.setPosition(width / 2, height / 2 - 50);
    const t2 = this.children.getByName('gameOverText2') as Phaser.GameObjects.Text;
    if (t2) t2.setPosition(width / 2, height / 2 + 50);
    const t3 = this.children.getByName('gameOverText3') as Phaser.GameObjects.Text;
    if (t3) t3.setPosition(width / 2, height / 2 + 150);

    // Reposition Player if out of bounds
    if (this.player) {
        if (this.player.x > width - 32) {
            this.player.x = width - 32;
        }
        // Keep player at bottom
        this.player.setY(height - 80); 
    }
  }

  update() {
    if (this.isGameOver) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Keyboard Movement
    if (this.cursors?.left.isDown) {
      body.setVelocityX(-GAME_CONFIG.playerSpeed);
      this.player.setFlipX(false);
    } else if (this.cursors?.right.isDown) {
      body.setVelocityX(GAME_CONFIG.playerSpeed);
      this.player.setFlipX(true);
    } else {
      body.setVelocityX(0);
    }

    // Check for items falling off screen
    const items = this.itemsGroup.getChildren();
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i] as Phaser.Physics.Arcade.Sprite;
        // Use this.scale.height instead of fixed config
        if (item.y > this.scale.height + 50) {
            item.destroy();
        }
    }
  }

  spawnItem() {
    if (this.isGameOver) return;

    // Use current width
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const itemConfig = Phaser.Utils.Array.GetRandom(ITEMS);
    
    // Create sprite instead of text
    const item = this.physics.add.sprite(x, -50, itemConfig.type);
    item.setScale(1.5); // 16x16 * 1.5 = 24px (Smaller)
    
    // body is automatically created for Arcade sprite
    const body = item.body as Phaser.Physics.Arcade.Body;
    
    // Increase speed based on level
    // Base speed + (level * factor)
    // Level 1: 1.0x, Level 2: 1.2x, Level 3: 1.4x ...
    const speedMultiplier = 1 + (this.level - 1) * 0.2; 
    body.setVelocityY(itemConfig.speed * speedMultiplier);
    
    // Random rotation for falling effect
    item.setAngularVelocity(Phaser.Math.Between(-100, 100));
    
    // Store data for collision
    item.setData('type', itemConfig.type);
    item.setData('score', itemConfig.score);
    item.setData('damage', itemConfig.damage);
    
    this.itemsGroup.add(item);
  }

  // Helper for Lightning Effect
  triggerLightning() {
    if (this.isGameOver) return;
    // 20% chance to trigger
    if (Math.random() > 0.8) {
        this.cameras.main.flash(100, 255, 255, 255);
        // Small shake
        this.cameras.main.shake(100, 0.005);
    }
  }

  handleCollectItem = (playerObj: any, itemObj: any) => {
    if (this.isGameOver) return;

    // Cast objects
    const item = itemObj as Phaser.Physics.Arcade.Sprite;
    
    const score = item.getData('score');
    const damage = item.getData('damage');

    // Update Score
    if (score > 0) {
      this.score += score;
      this.scoreText.setText(`SCORE: ${this.score}`);
      this.createParticles(item.x, item.y, 0xFFFF00); // Yellow particles for points
      
      // Level Up Logic: Every 50 points
      const currentLevel = Math.floor(this.score / 50) + 1;
      if (currentLevel > this.level) {
          this.levelUp(currentLevel);
      }
    }

    // Update Health
    if (damage > 0) {
      this.health -= damage;
      this.healthText.setText(`HP: ${this.health}`);
      this.cameras.main.shake(200, 0.02);
      this.cameras.main.flash(200, 0xFF0000); // Flash red
      this.createParticles(item.x, item.y, 0xFF0000); // Red particles for damage
      
      if (this.health <= 0) {
        this.gameOver();
      }
    }

    item.destroy();
  };

  levelUp(newLevel: number) {
      this.level = newLevel;
      this.levelText.setText(`LEVEL: ${this.level}`);
      
      // Decrease spawn delay to increase frequency
      // Max(200ms, Start(1000ms) - (Level * 50ms))
      // e.g. L1: 1000, L2: 950, L3: 900, L20: 200 (Max difficulty)
      const newDelay = Math.max(200, GAME_CONFIG.spawnInterval - ((this.level - 1) * 50));
      this.spawnDelay = newDelay;
      
      // Reset timer with new delay
      if (this.spawnEvent) {
          this.spawnEvent.remove(false);
          this.spawnEvent = this.time.addEvent({
              delay: this.spawnDelay,
              callback: this.spawnItem,
              callbackScope: this,
              loop: true,
          });
      }

      // Visual feedback
      this.levelText.setScale(1.5);
      this.tweens.add({
          targets: this.levelText,
          scaleX: 1,
          scaleY: 1,
          duration: 500,
          ease: 'Bounce.easeOut'
      });
      
      // Show Level Up text on screen center briefly
      const levelUpText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'LEVEL UP!', {
          fontFamily: '"Press Start 2P"',
          fontSize: '48px',
          color: '#00FFFF',
          stroke: '#000000',
          strokeThickness: 6
      }).setOrigin(0.5);
      
      this.tweens.add({
          targets: levelUpText,
          y: levelUpText.y - 100,
          alpha: 0,
          duration: 2000,
          onComplete: () => {
              levelUpText.destroy();
          }
      });
      
      // Increase spawn rate slightly? Or just speed in spawnItem is enough.
      // Let's keep spawn rate constant but increase speed.
  }

  createParticles(x: number, y: number, color: number) {
      const particles = this.add.particles(x, y, 'particle', {
          speed: { min: 50, max: 150 },
          scale: { start: 1, end: 0 },
          lifespan: 500,
          gravityY: 200,
          quantity: 10,
          tint: color
      });
      // Auto destroy emitter after lifespan
      this.time.delayedCall(600, () => {
          particles.destroy();
      });
  }

  gameOver() {
    this.isGameOver = true;
    this.physics.pause();
    this.spawnEvent.remove();
    
    // Show Game Over Text
    const { width, height } = this.scale;
    
    // Use a container or group to manage these if needed, but simple add is fine.
    // If resized, these won't move automatically without resize handler update.
    // Ideally we should clear old texts or update their positions.
    // For simplicity, let's just add them.
    
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setScrollFactor(0)
      .setName('gameOverOverlay');
    
    this.add.text(width / 2, height / 2 - 50, 'GAME OVER', {
      fontFamily: '"Press Start 2P"',
      fontSize: '48px',
      color: '#ff0000',
    }).setOrigin(0.5).setName('gameOverText1');

    this.add.text(width / 2, height / 2 + 50, `SCORE: ${this.score}`, {
      fontFamily: '"Press Start 2P"',
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5).setName('gameOverText2');

    const restartText = this.add.text(width / 2, height / 2 + 150, 'RESTART', {
      fontFamily: '"Press Start 2P"',
      fontSize: '24px',
      color: '#00ff00',
    }).setOrigin(0.5).setName('gameOverText3');

    restartText.setInteractive({ useHandCursor: true });
    restartText.on('pointerdown', () => {
      // Emit 'game-restart' or handle internally
      // For now, internal restart
      this.scene.restart();
    });
    
    // Emit 'game-over' event for React to handle (Save Score)
    // Pass score to listener
    this.game.events.emit('game-over', this.score);
  }
}
