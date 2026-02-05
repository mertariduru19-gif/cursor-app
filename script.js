const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const resetBtn = document.getElementById("reset");

const world = {
  width: canvas.width,
  height: canvas.height,
  groundY: canvas.height - 50,
};

const ball = {
  radius: 18,
  x: 120,
  y: world.groundY - 18,
  vy: 0,
};

const physics = {
  gravity: 1800,
  jumpVelocity: -650,
  obstacleSpeed: 260,
};

const state = {
  running: true,
  score: 0,
  best: 0,
};

let obstacle = createObstacle();
let lastTime = 0;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function isOnGround() {
  return ball.y >= world.groundY - ball.radius - 0.5;
}

function createObstacle() {
  const width = rand(24, 48);
  const height = rand(35, 90);
  return {
    x: world.width + rand(180, 320),
    y: world.groundY - height,
    width,
    height,
  };
}

function updateScore() {
  scoreEl.textContent = state.score;
  bestEl.textContent = state.best;
}

function resetGame() {
  state.score = 0;
  ball.y = world.groundY - ball.radius;
  ball.vy = 0;
  obstacle = createObstacle();
  updateScore();
}

function jump() {
  if (!state.running) {
    return;
  }
  if (isOnGround()) {
    ball.vy = physics.jumpVelocity;
  }
}

function togglePause() {
  state.running = !state.running;
}

function hitTestCircleRect(circle, rect) {
  const closestX = clamp(circle.x, rect.x, rect.x + rect.width);
  const closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function update(dt) {
  if (!state.running) {
    return;
  }

  ball.vy += physics.gravity * dt;
  ball.y += ball.vy * dt;

  if (ball.y > world.groundY - ball.radius) {
    ball.y = world.groundY - ball.radius;
    ball.vy = 0;
  }

  obstacle.x -= physics.obstacleSpeed * dt;

  if (obstacle.x + obstacle.width < 0) {
    state.score += 1;
    state.best = Math.max(state.best, state.score);
    obstacle = createObstacle();
    updateScore();
  }

  if (hitTestCircleRect(ball, obstacle)) {
    resetGame();
  }
}

function drawGround() {
  ctx.strokeStyle = "#2a2a2a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, world.groundY);
  ctx.lineTo(world.width, world.groundY);
  ctx.stroke();
}

function drawBall() {
  ctx.fillStyle = "#ff3b3b";
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawObstacle() {
  ctx.fillStyle = "#6d6d6d";
  ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
}

function drawPauseText() {
  if (state.running) {
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Paused", world.width / 2, world.height / 2 - 10);
  ctx.font = "16px Arial";
  ctx.fillText("Press P to resume", world.width / 2, world.height / 2 + 20);
}

function render() {
  ctx.clearRect(0, 0, world.width, world.height);
  drawGround();
  drawObstacle();
  drawBall();
  drawPauseText();
}

function loop(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
  }
  if (event.code === "KeyP") {
    togglePause();
  }
  if (event.code === "KeyR") {
    resetGame();
  }
});

canvas.addEventListener("pointerdown", () => {
  jump();
});

resetBtn.addEventListener("click", () => {
  resetGame();
});

updateScore();
requestAnimationFrame(loop);
