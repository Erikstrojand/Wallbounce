const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

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
};

let floorY = canvas.height - FLOOR_HEIGHT;
let cameraY = 0;

const WALL_LEFT = 10;
const WALL_RIGHT = canvas.width - 10 - player.size;

const platforms = [];

let firstPlatform = null;

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
  });

  platformY -= PLATFORM_GAP + Math.random() * 40;

  while (platformY > -50000) {
    const x = Math.random() * (canvas.width - PLATFORM_WIDTH - 2 * WALL_LEFT) + WALL_LEFT;
    platforms.push({
      x: x,
      y: platformY,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    });
    platformY -= PLATFORM_GAP + Math.random() * 40;
  }
}
function resetJump() {
  player.vy = player.jumpPower;
  player.onGround = false;
  player.onWall = false;
}

function jumpOffWall() {
  player.vy = player.jumpPower;
  player.direction *= -1;
  player.onWall = false;
}

function update() {
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
    for (const p of platforms) {
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
  }

  const desiredCameraY = player.y - canvas.height * 0.5;
  cameraY += (desiredCameraY - cameraY) * 0.1;
}

function draw() {
  const WIDTH = canvas.width;
  const HEIGHT = canvas.height;
  
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  
  ctx.fillStyle = '#777';
  ctx.fillRect(0, 0, 10, HEIGHT);
  ctx.fillRect(WIDTH - 10, 0, 10, HEIGHT);
  
  for (const p of platforms) {
    ctx.fillStyle = '#aaa';
    ctx.fillRect(p.x, p.y - cameraY - 20, p.width, PLATFORM_HEIGHT);
  }
  
  ctx.fillStyle = '#0f0';
  ctx.fillRect(player.x, player.y - player.size - cameraY, player.size, player.size);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
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