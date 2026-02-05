const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

const base = {
  width: 800,
  height: 400,
  groundOffset: 50,
  ballRadius: 18,
  ballX: 120,
  gravity: 1800,
  jumpVelocity: -650,
  obstacleSpeed: 260,
  obstacleWidth: [24, 48],
  obstacleHeight: [35, 90],
  spawnGap: [180, 320],
};

const world = {
  width: base.width,
  height: base.height,
  groundY: base.height - base.groundOffset,
};

const ball = {
  radius: base.ballRadius,
  x: base.ballX,
  y: world.groundY - base.ballRadius,
  vy: 0,
};

const physics = {
  gravity: base.gravity,
  jumpVelocity: base.jumpVelocity,
  obstacleSpeed: base.obstacleSpeed,
};

const state = {
  running: true,
  score: 0,
  best: 0,
};

let scale = 1;
let obstacle = null;
let lastTime = 0;

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function updatePauseLabel() {
  pauseBtn.textContent = state.running ? "Duraklat" : "Devam";
  pauseBtn.setAttribute("aria-pressed", state.running ? "false" : "true");
}

function applyScale() {
  world.groundY = world.height - base.groundOffset * scale;
  ball.radius = base.ballRadius * scale;
  ball.x = base.ballX * scale;
  physics.gravity = base.gravity * scale;
  physics.jumpVelocity = base.jumpVelocity * scale;
  physics.obstacleSpeed = base.obstacleSpeed * scale;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = rect.width || base.width;
  const displayHeight = rect.height || displayWidth / 2;

  canvas.width = Math.round(displayWidth * dpr);
  canvas.height = Math.round(displayHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  world.width = displayWidth;
  world.height = displayHeight;
  scale = displayWidth / base.width;
  applyScale();
  resetPositions();
}

function isOnGround() {
  return ball.y >= world.groundY - ball.radius - 0.5;
}

function createObstacle() {
  const width = rand(base.obstacleWidth[0], base.obstacleWidth[1]) * scale;
  const height = rand(base.obstacleHeight[0], base.obstacleHeight[1]) * scale;
  return {
    x: world.width + rand(base.spawnGap[0], base.spawnGap[1]) * scale,
    y: world.groundY - height,
    width,
    height,
  };
}

function updateScore() {
  scoreEl.textContent = state.score;
  bestEl.textContent = state.best;
}

function resetPositions() {
  ball.y = world.groundY - ball.radius;
  ball.vy = 0;
  obstacle = createObstacle();
}

function resetGame() {
  state.score = 0;
  state.running = true;
  updatePauseLabel();
  resetPositions();
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
  updatePauseLabel();
  if (state.running) {
    lastTime = performance.now();
  }
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
  ctx.fillText("Duraklatildi", world.width / 2, world.height / 2 - 10);
  ctx.font = "16px Arial";
  ctx.fillText(
    "Devam icin P veya buton",
    world.width / 2,
    world.height / 2 + 20
  );
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

canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  jump();
});

pauseBtn.addEventListener("click", () => {
  togglePause();
});

resetBtn.addEventListener("click", () => {
  resetGame();
});

let resizeHandle = 0;
window.addEventListener("resize", () => {
  if (resizeHandle) {
    cancelAnimationFrame(resizeHandle);
  }
  resizeHandle = requestAnimationFrame(() => {
    resizeCanvas();
  });
});

updatePauseLabel();
resizeCanvas();
updateScore();
requestAnimationFrame(loop);
