const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const restartButton = document.getElementById('restart');
restartButton.addEventListener('click', resetGame);

const scoreElement = document.getElementById('score');
const gameoverElement = document.getElementById('gameover');
const gameoverText = document.getElementById('gameover-text');

const FLOOR_HEIGHT = 100;
const PLATFORM_WIDTH = 170;
const PLATFORM_HEIGHT = 10;
const PLATFORM_GAP = 120;

const player = {
  x: 0,
  y: 0,
  size: 20,
  vy: 0,
  jumpPower: -12,
  gravity: 0.4,
  speedX: 3,
  direction: 1,
  onGround: false,
  onWall: false,
  currentPlatform: null,
};

let floorY;
let cameraY = 0;

const WALL_LEFT = 10;
let WALL_RIGHT;

const platforms = [];

let firstPlatform = null;

let lavaY = canvas.height;
const lavaSpeed = 1;
let gameOver = false;
let currentScore = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  WALL_RIGHT = canvas.width - 10 - player.size;
  floorY = canvas.height - FLOOR_HEIGHT;
}
window.addEventListener('resize', resize);
resize();

function generatePlatforms() {
  platforms.length = 0;

  let platformY = floorY - 1;

  const firstWidth = PLATFORM_WIDTH * 3;
  const firstX = (canvas.width - firstWidth) / 2;
  platforms.push({
    x: firstX,
    y: platformY,
    width: firstWidth,
    height: PLATFORM_HEIGHT,
    moving: false,
    dx: 0,
  });

  platformY -= PLATFORM_GAP + Math.random() * 40;

  while (platformY > -50000) {
    const x = Math.random() * (canvas.width - PLATFORM_WIDTH - 2 * WALL_LEFT) + WALL_LEFT;
    let moving = false;
    let dx = 0;
    if (platforms.length >= 99 && Math.random() < 0.3) {
      moving = true;
      dx = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.random() * 2);
    }
    platforms.push({
      x: x,
      y: platformY,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
      moving: moving,
      dx: dx,
    });
    platformY -= PLATFORM_GAP + Math.random() * 40;
  }
}

function resetJump() {
  player.vy = player.jumpPower;
  player.onGround = false;
  player.onWall = false;
  player.currentPlatform = null;
}

function jumpOffWall() {
  player.vy = player.jumpPower;
  player.direction *= -1;
  player.onWall = false;
  player.currentPlatform = null;
}

function update() {
  // Move platforms
  platforms.forEach(p => {
    if (p.moving) {
      p.x += p.dx;
      const pLeft = WALL_LEFT;
      const pRight = canvas.width - 10 - p.width;
      if (p.x < pLeft) {
        p.x = pLeft;
        p.dx *= -1;
      } else if (p.x > pRight) {
        p.x = pRight;
        p.dx *= -1;
      }
    }
  });

  // If on moving platform, move with it
  if (player.onGround && player.currentPlatform && player.currentPlatform.moving) {
    player.x += player.currentPlatform.dx;
  }

  player.x += player.speedX * player.direction;

  if (player.x <= WALL_LEFT) {
    player.x = WALL_LEFT;
    if (!player.onGround) {
      player.onWall = true;
      player.onGround = false;
    } else {
      player.direction = 1;
    }
  } else if (player.x >= WALL_RIGHT) {
    player.x = WALL_RIGHT;
    if (!player.onGround) {
      player.onWall = true;
      player.onGround = false;
    } else {
      player.direction = -1;
    }
  } else {
    player.onWall = false;
  }

  player.vy += player.gravity;
  player.y += player.vy;

  if (player.vy >= 0) {
    player.onGround = false;
    player.currentPlatform = null;
    for (let i = 0; i < platforms.length; i++) {
      const p = platforms[i];
      const playerBottom = player.y + player.size;
      const platformTop = p.y;

      const playerRight = player.x + player.size;
      const playerLeft = player.x;

      if (
        playerBottom >= platformTop &&
        playerBottom <= platformTop + player.vy + 1 &&
        playerRight > p.x &&
        playerLeft < p.x + p.width
      ) {
        player.y = platformTop - player.size;
        player.vy = 0;
        player.onGround = true;
        player.onWall = false;
        player.currentPlatform = p;
        currentScore = Math.max(currentScore, i + 1);
        break;
      }
    }
  }

  const floorYFixed = canvas.height - FLOOR_HEIGHT;
  if (player.y + player.size >= floorYFixed) {
    player.y = floorYFixed - player.size;
    player.vy = 0;
    player.onGround = true;
    player.onWall = false;
    player.currentPlatform = null;
  }

  const desiredCameraY = player.y - canvas.height * 0.5;
  cameraY += (desiredCameraY - cameraY) * 0.1;

  lavaY -= lavaSpeed;

  if (player.y + player.size >= lavaY) {
    gameOver = true;
    gameoverText.innerHTML = `Game Over<br>Final Score: ${currentScore}`;
    gameoverElement.style.display = 'flex';
  }

  scoreElement.innerText = `Score: ${currentScore}`;
}

function draw() {
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  // Draw lava
  ctx.fillStyle = '#f00';
  const lavaScreenY = lavaY - cameraY;
  ctx.fillRect(0, lavaScreenY - 20, WIDTH, HEIGHT - lavaScreenY + 100);
  
  ctx.fillStyle = '#777';
  ctx.fillRect(0, 0, 10, HEIGHT);
  ctx.fillRect(WIDTH - 10, 0, 10, HEIGHT);
  
  for (const p of platforms) {
    ctx.fillStyle = '#aaa';
    ctx.fillRect(p.x, p.y - cameraY - 20, p.width, PLATFORM_HEIGHT);
  }
  
  ctx.fillStyle = gameOver ? '#ff0' : '#0f0';
  ctx.fillRect(player.x, player.y - player.size - cameraY, player.size, player.size);
}

function gameLoop() {
  if (!gameOver) {
    update();
  } else {
    scoreElement.innerText = `Score: ${currentScore}`;
  }
  draw();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  gameOver = false;
  lavaY = canvas.height;
  currentScore = 0;
  player.x = canvas.width / 2 - player.size / 2;
  player.y = canvas.height - FLOOR_HEIGHT - player.size;
  player.vy = 0;
  player.onGround = true;
  player.onWall = false;
  player.currentPlatform = null;
  cameraY = player.y - canvas.height / 2;
  generatePlatforms();
  gameoverElement.style.display = 'none';
  scoreElement.innerText = `Score: ${currentScore}`;
}

window.addEventListener('pointerdown', () => {
  if (player.onGround) {
    resetJump();
  } else if (player.onWall) {
    jumpOffWall();
  }
});

player.x = canvas.width / 2 - player.size / 2;
player.y = canvas.height - FLOOR_HEIGHT - player.size;
cameraY = player.y - canvas.height / 2;

generatePlatforms();
gameLoop();