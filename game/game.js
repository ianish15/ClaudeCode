// ===== Flappy Hummingbird Game =====

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Screens
const screenStart = document.getElementById('screen-start');
const screenGameOver = document.getElementById('screen-gameover');
const scoreDisplay = document.getElementById('score-display');
const finalScoreEl = document.getElementById('final-score');
const highScoreEl = document.getElementById('high-score');

// Buttons
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('btn-restart').addEventListener('click', startGame);

// Character selection
let selectedCharacter = 'hummingbird';
const charBtns = document.querySelectorAll('.char-btn');
charBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    charBtns.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedCharacter = btn.dataset.char;
  });
});

// Ryan image (loaded if available, falls back to canvas drawing)
let ryanImg = null;
let ryanImgLoaded = false;
const ryanImage = new Image();
ryanImage.onload = () => { ryanImg = ryanImage; ryanImgLoaded = true; };
ryanImage.src = 'ryan.png';

// ===== Constants =====
const GRAVITY = 0.45;
const FLAP_FORCE = -7.5;
const PIPE_WIDTH = 60;
const PIPE_GAP = 155;
const PIPE_SPEED = 2.8;
const PIPE_SPAWN_INTERVAL = 1600; // ms
const GROUND_HEIGHT = 60;

// ===== Colors (matching main site palette) =====
const COLORS = {
  sky: '#d4edda',
  skyGradientTop: '#a8d5ba',
  skyGradientBottom: '#d4edda',
  ground: '#5a3e2b',
  groundGrass: '#2d6a4f',
  pipe: '#1a6b4a',
  pipeDark: '#0f4d34',
  pipeHighlight: '#3d9970',
  bird: '#6bc26b',
  birdDark: '#1a6b4a',
  birdBelly: '#f0eeea',
  birdBeak: '#e05d44',
  birdEye: '#2c2c2c',
  birdWing: '#3d9970',
  cloud: 'rgba(255, 255, 255, 0.6)',
  flower: '#e05d44',
  flowerCenter: '#f4a261',
};

// ===== Game State =====
let gameState = 'idle'; // idle | playing | gameover
let bird = {};
let pipes = [];
let score = 0;
let highScore = parseInt(localStorage.getItem('flappyHummingbirdHighScore') || '0', 10);
let lastPipeSpawn = 0;
let frameCount = 0;
let clouds = [];
let backgroundFlowers = [];
let animationId = null;

// ===== Canvas Sizing =====
function resizeCanvas() {
  const wrapper = document.getElementById('game-wrapper');
  canvas.width = wrapper.clientWidth;
  canvas.height = wrapper.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ===== Bird =====
function resetBird() {
  bird = {
    x: canvas.width * 0.2,
    y: canvas.height * 0.4,
    width: 36,
    height: 28,
    velocity: 0,
    wingAngle: 0,
    wingDir: 1,
    rotation: 0,
  };
}

function updateBird() {
  bird.velocity += GRAVITY;
  bird.y += bird.velocity;

  // Wing animation
  bird.wingAngle += 0.3 * bird.wingDir;
  if (bird.wingAngle > 1 || bird.wingAngle < -1) {
    bird.wingDir *= -1;
  }

  // Rotation based on velocity
  bird.rotation = Math.max(-0.5, Math.min(bird.velocity * 0.06, 1.2));

  // Boundaries
  const groundY = canvas.height - GROUND_HEIGHT;
  if (bird.y + bird.height / 2 > groundY) {
    bird.y = groundY - bird.height / 2;
    endGame();
  }
  if (bird.y - bird.height / 2 < 0) {
    bird.y = bird.height / 2;
    bird.velocity = 0;
  }
}

function drawBird() {
  if (selectedCharacter === 'ryan') {
    drawRyan();
  } else {
    drawHummingbird();
  }
}

function drawHummingbird() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  // Body (ellipse)
  ctx.beginPath();
  ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.bird;
  ctx.fill();
  ctx.strokeStyle = COLORS.birdDark;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Belly
  ctx.beginPath();
  ctx.ellipse(2, 3, bird.width / 3, bird.height / 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.birdBelly;
  ctx.fill();

  // Wing
  const wingOffset = bird.wingAngle * 6;
  ctx.beginPath();
  ctx.ellipse(-4, -4 + wingOffset, 12, 6, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.birdWing;
  ctx.fill();
  ctx.strokeStyle = COLORS.birdDark;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Eye
  ctx.beginPath();
  ctx.arc(10, -4, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(11, -4, 2, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.birdEye;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(11.5, -4.5, 0.7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Beak
  ctx.beginPath();
  ctx.moveTo(16, -2);
  ctx.lineTo(24, -1);
  ctx.lineTo(16, 2);
  ctx.closePath();
  ctx.fillStyle = COLORS.birdBeak;
  ctx.fill();

  // Tail feathers
  ctx.beginPath();
  ctx.moveTo(-bird.width / 2, -2);
  ctx.lineTo(-bird.width / 2 - 10, -6);
  ctx.lineTo(-bird.width / 2 - 8, 0);
  ctx.lineTo(-bird.width / 2 - 12, 4);
  ctx.lineTo(-bird.width / 2, 2);
  ctx.fillStyle = COLORS.birdWing;
  ctx.fill();

  ctx.restore();
}

function drawRyan() {
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);

  const radius = 18;

  if (ryanImgLoaded) {
    // Draw Ryan's photo in a circle
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(ryanImg, -radius, -radius, radius * 2, radius * 2);
    ctx.restore();

    // Border around the circle (separate save/restore since we clipped above)
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();
  } else {
    // Fallback: draw a cartoon Ryan
    // Head
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd699';
    ctx.fill();
    ctx.strokeStyle = '#d4a054';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Hair
    ctx.beginPath();
    ctx.ellipse(0, -radius + 4, radius - 2, 8, 0, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#6b4226';
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-6, -3, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(6, -3, 4, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3b2f2f';
    ctx.beginPath();
    ctx.arc(-5, -2.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(7, -2.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.beginPath();
    ctx.arc(0, 3, 7, 0.15, Math.PI - 0.15);
    ctx.strokeStyle = '#8b5e3c';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  // Cape / flapping effect (drawn in both modes)
  ctx.save();
  ctx.translate(bird.x, bird.y);
  ctx.rotate(bird.rotation);
  const capeWave = bird.wingAngle * 5;
  ctx.beginPath();
  ctx.moveTo(-radius + 2, -4);
  ctx.quadraticCurveTo(-radius - 14, -2 + capeWave, -radius - 8, 8 + capeWave);
  ctx.quadraticCurveTo(-radius - 4, 6, -radius + 2, 4);
  ctx.fillStyle = '#e05d44';
  ctx.fill();
  ctx.restore();
}

// ===== Pipes (Branch Obstacles) =====
function spawnPipe() {
  const minY = 80;
  const maxY = canvas.height - GROUND_HEIGHT - PIPE_GAP - 80;
  const gapY = minY + Math.random() * (maxY - minY);

  // Add a random flower decoration
  const hasFlower = Math.random() > 0.4;
  const flowerSide = Math.random() > 0.5 ? 'top' : 'bottom';

  pipes.push({
    x: canvas.width + PIPE_WIDTH,
    gapY: gapY,
    scored: false,
    hasFlower,
    flowerSide,
  });
}

function updatePipes() {
  for (let i = pipes.length - 1; i >= 0; i--) {
    pipes[i].x -= PIPE_SPEED;

    // Scoring
    if (!pipes[i].scored && pipes[i].x + PIPE_WIDTH < bird.x) {
      pipes[i].scored = true;
      score++;
      scoreDisplay.textContent = score;
    }

    // Remove off-screen pipes
    if (pipes[i].x + PIPE_WIDTH < -10) {
      pipes.splice(i, 1);
    }
  }
}

function drawPipe(pipe) {
  const topPipeBottom = pipe.gapY;
  const bottomPipeTop = pipe.gapY + PIPE_GAP;
  const groundY = canvas.height - GROUND_HEIGHT;

  // Top pipe (branch hanging down)
  const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
  topGrad.addColorStop(0, COLORS.pipeDark);
  topGrad.addColorStop(0.3, COLORS.pipe);
  topGrad.addColorStop(0.7, COLORS.pipeHighlight);
  topGrad.addColorStop(1, COLORS.pipe);

  ctx.fillStyle = topGrad;
  ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topPipeBottom);

  // Top pipe cap (wider part at bottom)
  ctx.fillStyle = COLORS.pipeDark;
  ctx.fillRect(pipe.x - 5, topPipeBottom - 20, PIPE_WIDTH + 10, 20);
  ctx.fillStyle = COLORS.pipeHighlight;
  ctx.fillRect(pipe.x - 5, topPipeBottom - 20, 3, 20);

  // Bottom pipe (branch coming up)
  ctx.fillStyle = topGrad;
  ctx.fillRect(pipe.x, bottomPipeTop, PIPE_WIDTH, groundY - bottomPipeTop);

  // Bottom pipe cap
  ctx.fillStyle = COLORS.pipeDark;
  ctx.fillRect(pipe.x - 5, bottomPipeTop, PIPE_WIDTH + 10, 20);
  ctx.fillStyle = COLORS.pipeHighlight;
  ctx.fillRect(pipe.x - 5, bottomPipeTop, 3, 20);

  // Vine/leaf decorations
  drawLeaf(pipe.x + PIPE_WIDTH / 2 - 5, topPipeBottom - 25, 8);
  drawLeaf(pipe.x + PIPE_WIDTH / 2 + 5, bottomPipeTop + 22, -8);

  // Flower decoration
  if (pipe.hasFlower) {
    const fx = pipe.x + PIPE_WIDTH / 2;
    const fy = pipe.flowerSide === 'top' ? topPipeBottom - 30 : bottomPipeTop + 30;
    drawFlower(fx, fy);
  }
}

function drawLeaf(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.abs(size), Math.abs(size) / 2, size > 0 ? 0.5 : -0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#3d9970';
  ctx.fill();
  ctx.restore();
}

function drawFlower(x, y) {
  const petalCount = 5;
  const petalRadius = 5;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const px = x + Math.cos(angle) * 6;
    const py = y + Math.sin(angle) * 6;
    ctx.beginPath();
    ctx.arc(px, py, petalRadius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.flower;
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.flowerCenter;
  ctx.fill();
}

// ===== Collision Detection =====
function checkCollision() {
  const birdLeft = bird.x - bird.width / 2 + 4;
  const birdRight = bird.x + bird.width / 2 - 4;
  const birdTop = bird.y - bird.height / 2 + 4;
  const birdBottom = bird.y + bird.height / 2 - 4;

  for (const pipe of pipes) {
    const pipeLeft = pipe.x - 5;
    const pipeRight = pipe.x + PIPE_WIDTH + 5;
    const topPipeBottom = pipe.gapY;
    const bottomPipeTop = pipe.gapY + PIPE_GAP;

    if (birdRight > pipeLeft && birdLeft < pipeRight) {
      if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
        endGame();
        return;
      }
    }
  }
}

// ===== Background =====
function initClouds() {
  clouds = [];
  for (let i = 0; i < 5; i++) {
    clouds.push({
      x: Math.random() * canvas.width,
      y: 30 + Math.random() * (canvas.height * 0.35),
      width: 60 + Math.random() * 80,
      speed: 0.3 + Math.random() * 0.4,
    });
  }
}

function initBackgroundFlowers() {
  backgroundFlowers = [];
  const groundY = canvas.height - GROUND_HEIGHT;
  for (let i = 0; i < 8; i++) {
    backgroundFlowers.push({
      x: Math.random() * canvas.width,
      y: groundY - 5 - Math.random() * 15,
      size: 3 + Math.random() * 4,
    });
  }
}

function drawBackground() {
  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height - GROUND_HEIGHT);
  skyGrad.addColorStop(0, COLORS.skyGradientTop);
  skyGrad.addColorStop(1, COLORS.skyGradientBottom);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Clouds
  for (const cloud of clouds) {
    cloud.x -= cloud.speed;
    if (cloud.x + cloud.width < 0) {
      cloud.x = canvas.width + 20;
      cloud.y = 30 + Math.random() * (canvas.height * 0.35);
    }
    drawCloud(cloud.x, cloud.y, cloud.width);
  }

  // Distant hills
  drawHills();

  // Ground
  const groundY = canvas.height - GROUND_HEIGHT;
  ctx.fillStyle = COLORS.groundGrass;
  ctx.fillRect(0, groundY, canvas.width, 8);
  ctx.fillStyle = COLORS.ground;
  ctx.fillRect(0, groundY + 8, canvas.width, GROUND_HEIGHT - 8);

  // Grass blades
  for (let i = 0; i < canvas.width; i += 12) {
    const h = 4 + Math.sin(i * 0.5 + frameCount * 0.02) * 3;
    ctx.fillStyle = COLORS.groundGrass;
    ctx.fillRect(i, groundY - h, 3, h + 2);
  }

  // Background flowers on ground
  for (const f of backgroundFlowers) {
    drawFlower(f.x, f.y);
  }
}

function drawCloud(x, y, width) {
  ctx.fillStyle = COLORS.cloud;
  const h = width * 0.35;
  ctx.beginPath();
  ctx.ellipse(x, y, width / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - width * 0.2, y + h * 0.15, width / 3, h / 2.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x + width * 0.25, y + h * 0.1, width / 3.5, h / 3, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawHills() {
  const groundY = canvas.height - GROUND_HEIGHT;
  ctx.fillStyle = 'rgba(45, 106, 79, 0.15)';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= canvas.width; x += 10) {
    const y = groundY - 30 - Math.sin(x * 0.008 + 1) * 25 - Math.sin(x * 0.015) * 15;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, groundY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(45, 106, 79, 0.1)';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = 0; x <= canvas.width; x += 10) {
    const y = groundY - 20 - Math.sin(x * 0.012 + 3) * 20 - Math.sin(x * 0.006) * 15;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(canvas.width, groundY);
  ctx.closePath();
  ctx.fill();
}

// ===== Game Loop =====
function gameLoop() {
  frameCount++;

  drawBackground();

  if (gameState === 'playing') {
    updateBird();
    updatePipes();
    checkCollision();

    // Spawn pipes on interval
    if (frameCount % Math.round(PIPE_SPAWN_INTERVAL / 16.67) === 0) {
      spawnPipe();
    }
  }

  // Draw pipes
  for (const pipe of pipes) {
    drawPipe(pipe);
  }

  // Draw bird
  drawBird();

  animationId = requestAnimationFrame(gameLoop);
}

// ===== Game Controls =====
function flap() {
  if (gameState === 'playing') {
    bird.velocity = FLAP_FORCE;
  }
}

function startGame() {
  resizeCanvas();
  resetBird();
  pipes = [];
  score = 0;
  frameCount = 0;
  scoreDisplay.textContent = '0';

  screenStart.classList.add('hidden');
  screenGameOver.classList.add('hidden');
  scoreDisplay.classList.remove('hidden');

  initClouds();
  initBackgroundFlowers();

  gameState = 'playing';

  if (!animationId) {
    gameLoop();
  }
}

function endGame() {
  if (gameState !== 'playing') return;
  gameState = 'gameover';

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('flappyHummingbirdHighScore', String(highScore));
  }

  finalScoreEl.textContent = 'Score: ' + score;
  highScoreEl.textContent = 'Best: ' + highScore;
  scoreDisplay.classList.add('hidden');
  screenGameOver.classList.remove('hidden');
}

// ===== Input Handlers =====
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.key === ' ') {
    e.preventDefault();
    if (gameState === 'idle') {
      startGame();
    } else if (gameState === 'playing') {
      flap();
    } else if (gameState === 'gameover') {
      startGame();
    }
  }
});

canvas.addEventListener('click', (e) => {
  e.preventDefault();
  if (gameState === 'playing') {
    flap();
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (gameState === 'playing') {
    flap();
  }
}, { passive: false });

// ===== Initial Render =====
resizeCanvas();
resetBird();
initClouds();
initBackgroundFlowers();
gameLoop();
