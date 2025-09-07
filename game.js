const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_SIZE = 14;
const PADDLE_MARGIN = 12;
const PLAYER_COLOR = '#3DF8FF';
const AI_COLOR = '#FFD43D';
const BALL_COLOR = '#fff';

// Game objects
let playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
let ball = {
  x: WIDTH / 2 - BALL_SIZE / 2,
  y: HEIGHT / 2 - BALL_SIZE / 2,
  vx: Math.random() > 0.5 ? 4 : -4,
  vy: (Math.random() - 0.5) * 6
};
let playerScore = 0;
let aiScore = 0;

// Mouse control for player paddle
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerY = mouseY - PADDLE_HEIGHT / 2;
  // Clamp paddle within canvas
  playerY = Math.max(Math.min(playerY, HEIGHT - PADDLE_HEIGHT), 0);
});

// Reset ball to center
function resetBall() {
  ball.x = WIDTH / 2 - BALL_SIZE / 2;
  ball.y = HEIGHT / 2 - BALL_SIZE / 2;
  ball.vx = (Math.random() > 0.5 ? 4 : -4);
  ball.vy = (Math.random() - 0.5) * 6;
}

// Draw everything
function draw() {
  // Clear
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Net
  ctx.strokeStyle = '#888';
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(WIDTH / 2, 0);
  ctx.lineTo(WIDTH / 2, HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Player paddle
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(PADDLE_MARGIN, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // AI paddle
  ctx.fillStyle = AI_COLOR;
  ctx.fillRect(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Ball
  ctx.fillStyle = BALL_COLOR;
  ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

  // Score
  ctx.font = "32px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(playerScore, WIDTH / 2 - 48, 42);
  ctx.fillText(aiScore, WIDTH / 2 + 24, 42);
}

// Simple AI logic for right paddle
function updateAI() {
  const aiCenter = aiY + PADDLE_HEIGHT / 2;
  const ballCenter = ball.y + BALL_SIZE / 2;
  // Move ai paddle towards ball, with a max speed
  const speed = 4;
  if (aiCenter < ballCenter - 12) {
    aiY += speed;
  } else if (aiCenter > ballCenter + 12) {
    aiY -= speed;
  }
  // Clamp within canvas
  aiY = Math.max(Math.min(aiY, HEIGHT - PADDLE_HEIGHT), 0);
}

// Ball & paddle collision check
function checkPaddleCollision(paddleX, paddleY) {
  return (
    ball.x < paddleX + PADDLE_WIDTH &&
    ball.x + BALL_SIZE > paddleX &&
    ball.y < paddleY + PADDLE_HEIGHT &&
    ball.y + BALL_SIZE > paddleY
  );
}

// Update game state
function update() {
  // Move ball
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Top/bottom wall collision
  if (ball.y <= 0 || ball.y + BALL_SIZE >= HEIGHT) {
    ball.vy *= -1;
    ball.y = Math.max(0, Math.min(ball.y, HEIGHT - BALL_SIZE));
  }

  // Player paddle collision
  if (checkPaddleCollision(PADDLE_MARGIN, playerY)) {
    ball.vx *= -1;
    // Add "spin" based on where it hit the paddle
    let hitPos = (ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
    ball.vy += hitPos * 0.15;
    ball.x = PADDLE_MARGIN + PADDLE_WIDTH; // Prevent sticking
  }

  // AI paddle collision
  if (checkPaddleCollision(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY)) {
    ball.vx *= -1;
    let hitPos = (ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
    ball.vy += hitPos * 0.15;
    ball.x = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - BALL_SIZE; // Prevent sticking
  }

  // Score for AI
  if (ball.x <= 0) {
    aiScore++;
    resetBall();
  }
  // Score for player
  if (ball.x + BALL_SIZE >= WIDTH) {
    playerScore++;
    resetBall();
  }

  updateAI();
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Start game
loop();