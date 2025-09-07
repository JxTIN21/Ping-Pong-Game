const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Responsive canvas sizing
function resizeCanvas() {
    const maxWidth = Math.min(window.innerWidth - 20, 700);
    const maxHeight = Math.min(window.innerHeight - 100, 400);
    
    if (maxWidth < 700) {
        const ratio = maxWidth / 700;
        canvas.width = maxWidth;
        canvas.height = 400 * ratio;
    } else {
        canvas.width = 700;
        canvas.height = 400;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game constants (will be scaled based on canvas size)
function getScaledValue(baseValue) {
    return baseValue * (canvas.width / 700);
}

// Game objects
let playerY, aiY, ball, playerScore, aiScore;

function initGame() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const PADDLE_HEIGHT = getScaledValue(80);
    
    playerY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    aiY = HEIGHT / 2 - PADDLE_HEIGHT / 2;
    
    ball = {
        x: WIDTH / 2,
        y: HEIGHT / 2,
        vx: Math.random() > 0.5 ? getScaledValue(4) : -getScaledValue(4),
        vy: (Math.random() - 0.5) * getScaledValue(6),
        radius: getScaledValue(7)
    };
    
    playerScore = 0;
    aiScore = 0;
}

initGame();

// Input handling for both mouse and touch
let isTouch = false;

function getInputY(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        isTouch = true;
        return e.touches[0].clientY - rect.top;
    } else {
        return e.clientY - rect.top;
    }
}

function handleInput(e) {
    e.preventDefault();
    const mouseY = getInputY(e);
    const PADDLE_HEIGHT = getScaledValue(80);
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp paddle within canvas
    playerY = Math.max(Math.min(playerY, canvas.height - PADDLE_HEIGHT), 0);
}

// Mouse events
canvas.addEventListener('mousemove', handleInput);

// Touch events
canvas.addEventListener('touchstart', handleInput);
canvas.addEventListener('touchmove', handleInput);
canvas.addEventListener('touchend', e => e.preventDefault());

// Prevent scrolling on mobile
document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

// Reset ball to center
function resetBall() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    
    ball.x = WIDTH / 2;
    ball.y = HEIGHT / 2;
    ball.vx = (Math.random() > 0.5 ? getScaledValue(4) : -getScaledValue(4));
    ball.vy = (Math.random() - 0.5) * getScaledValue(6);
}

// Draw everything
function draw() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const PADDLE_WIDTH = getScaledValue(12);
    const PADDLE_HEIGHT = getScaledValue(80);
    const PADDLE_MARGIN = getScaledValue(12);
    const PLAYER_COLOR = '#3DF8FF';
    const AI_COLOR = '#FFD43D';
    const BALL_COLOR = '#fff';

    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Net
    ctx.strokeStyle = '#888';
    ctx.lineWidth = getScaledValue(2);
    ctx.setLineDash([getScaledValue(8), getScaledValue(8)]);
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

    // Ball (now round!)
    ctx.fillStyle = BALL_COLOR;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Score
    const fontSize = getScaledValue(32);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#fff";
    ctx.textAlign = 'center';
    ctx.fillText(playerScore, WIDTH / 2 - getScaledValue(24), getScaledValue(42));
    ctx.fillText(aiScore, WIDTH / 2 + getScaledValue(24), getScaledValue(42));
}

// Simple AI logic for right paddle
function updateAI() {
    const PADDLE_HEIGHT = getScaledValue(80);
    const aiCenter = aiY + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    // Move ai paddle towards ball, with a max speed
    const speed = getScaledValue(4);
    const deadZone = getScaledValue(12);
    
    if (aiCenter < ballCenter - deadZone) {
        aiY += speed;
    } else if (aiCenter > ballCenter + deadZone) {
        aiY -= speed;
    }
    // Clamp within canvas
    aiY = Math.max(Math.min(aiY, canvas.height - PADDLE_HEIGHT), 0);
}

// Ball & paddle collision check
function checkPaddleCollision(paddleX, paddleY) {
    const PADDLE_WIDTH = getScaledValue(12);
    const PADDLE_HEIGHT = getScaledValue(80);
    
    return (
        ball.x - ball.radius < paddleX + PADDLE_WIDTH &&
        ball.x + ball.radius > paddleX &&
        ball.y - ball.radius < paddleY + PADDLE_HEIGHT &&
        ball.y + ball.radius > paddleY
    );
}

// Update game state
function update() {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;
    const PADDLE_WIDTH = getScaledValue(12);
    const PADDLE_HEIGHT = getScaledValue(80);
    const PADDLE_MARGIN = getScaledValue(12);

    // Move ball
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top/bottom wall collision
    if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= HEIGHT) {
        ball.vy *= -1;
        ball.y = Math.max(ball.radius, Math.min(ball.y, HEIGHT - ball.radius));
    }

    // Player paddle collision
    if (checkPaddleCollision(PADDLE_MARGIN, playerY)) {
        ball.vx = Math.abs(ball.vx); // Always bounce right
        // Add "spin" based on where it hit the paddle
        let hitPos = ball.y - (playerY + PADDLE_HEIGHT / 2);
        ball.vy += hitPos * 0.15;
        ball.x = PADDLE_MARGIN + PADDLE_WIDTH + ball.radius; // Prevent sticking
    }

    // AI paddle collision
    if (checkPaddleCollision(WIDTH - PADDLE_MARGIN - PADDLE_WIDTH, aiY)) {
        ball.vx = -Math.abs(ball.vx); // Always bounce left
        let hitPos = ball.y - (aiY + PADDLE_HEIGHT / 2);
        ball.vy += hitPos * 0.15;
        ball.x = WIDTH - PADDLE_MARGIN - PADDLE_WIDTH - ball.radius; // Prevent sticking
    }

    // Score for AI
    if (ball.x + ball.radius <= 0) {
        aiScore++;
        resetBall();
    }
    // Score for player
    if (ball.x - ball.radius >= WIDTH) {
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

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    initGame();
});

// Start game
loop();