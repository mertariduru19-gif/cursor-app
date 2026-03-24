const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const nextGlassEl = document.getElementById("nextGlass");
const glassCountEl = document.getElementById("glassCount");
const stuckEl = document.getElementById("stuck");
const restartBtn = document.getElementById("restart");

const WORLD = {
  width: 800,
  height: 520,
  table: {
    left: 28,
    right: 772,
    top: 86,
    bottom: 500,
  },
};

const PHYSICS = {
  gravity: 2100,
  restitution: 0.18,
  dragDamping: 0.9,
  rollingFriction: 2.7,
  boundaryFriction: 0.88,
  velocitySleepThreshold: 14,
  dropCooldown: 0.18,
  launcherStep: 38,
  maxDelta: 1 / 30,
};

const LEVELS = [
  { tag: "water", name: "Su", radius: 20, color: "#62b5ff", score: 10 },
  {
    tag: "orange_juice",
    name: "Portakal Suyu",
    radius: 24,
    color: "#ffb347",
    score: 25,
  },
  { tag: "lemonade", name: "Limonata", radius: 28, color: "#f9e06c", score: 45 },
  {
    tag: "strawberry_cocktail",
    name: "Cilekli Kokteyl",
    radius: 32,
    color: "#ff6f9f",
    score: 70,
  },
  {
    tag: "watermelon_juice",
    name: "Karpuz Suyu",
    radius: 37,
    color: "#ff5f6d",
    score: 110,
  },
  { tag: "apple_juice", name: "Elma Suyu", radius: 41, color: "#9dd95f", score: 165 },
  { tag: "blue_tonic", name: "Mavi Icecek", radius: 46, color: "#5f8cff", score: 230 },
  {
    tag: "tropical_mix",
    name: "Tropik Mix",
    radius: 52,
    color: "#ffcc5c",
    score: 320,
  },
  {
    tag: "energy_drink",
    name: "Enerji Icecegi",
    radius: 58,
    color: "#7f6dff",
    score: 450,
  },
  { tag: "golden_essence", name: "Altin Oz", radius: 66, color: "#ffd447", score: 650 },
];

const state = {
  score: 0,
  best: 0,
  gameOver: false,
  stuckTime: 0,
  lastTick: 0,
  currentLevel: 0,
  nextLevel: 0,
  launcherX: WORLD.width / 2,
  hasReadyGlass: false,
  dropCooldown: 0,
  nextGlassId: 1,
};

/** @type {Array<{
 * id:number, level:number, tag:string, x:number, y:number, vx:number, vy:number, radius:number, mass:number, color:string
 * }>} */
let glasses = [];

const pointer = {
  active: false,
  id: null,
};

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distanceSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function toCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const sx = WORLD.width / rect.width;
  const sy = WORLD.height / rect.height;
  return {
    x: (event.clientX - rect.left) * sx,
    y: (event.clientY - rect.top) * sy,
  };
}

function levelData(level) {
  return LEVELS[clamp(level, 0, LEVELS.length - 1)];
}

function rollNextLevel() {
  const r = Math.random();
  if (r < 0.68) {
    return 0;
  }
  if (r < 0.92) {
    return 1;
  }
  return 2;
}

function createGlass(level, x, y) {
  const info = levelData(level);
  return {
    id: state.nextGlassId++,
    level,
    tag: info.tag, // Tag tabanli tanima
    x,
    y,
    vx: rand(-8, 8),
    vy: rand(-4, 4),
    radius: info.radius,
    mass: info.radius * info.radius,
    color: info.color,
  };
}

function canMerge(a, b) {
  return a.level === b.level && a.tag === b.tag; // ID farkli, Tag ayni ise merge
}

function lockLauncherX() {
  if (!state.hasReadyGlass) {
    return;
  }
  const r = levelData(state.currentLevel).radius;
  state.launcherX = clamp(state.launcherX, WORLD.table.left + r, WORLD.table.right - r);
}

function setLauncherX(targetX) {
  if (!state.hasReadyGlass) {
    return;
  }
  state.launcherX = targetX;
  lockLauncherX();
}

function canSpawnAtX(level, x) {
  const info = levelData(level);
  const r = info.radius;
  const y = WORLD.table.top + r + 2;
  if (x < WORLD.table.left + r || x > WORLD.table.right - r) {
    return false;
  }
  for (let i = 0; i < glasses.length; i += 1) {
    const other = glasses[i];
    const rr = other.radius + r + 2;
    const dx = other.x - x;
    const dy = other.y - y;
    if (dx * dx + dy * dy < rr * rr) {
      return false;
    }
  }
  return true;
}

function canSpawnFromTop(level) {
  const r = levelData(level).radius;
  const step = Math.max(10, Math.floor(r * 0.4));
  for (let x = WORLD.table.left + r; x <= WORLD.table.right - r; x += step) {
    if (canSpawnAtX(level, x)) {
      return true;
    }
  }
  return false;
}

function prepareNextGlass() {
  state.currentLevel = state.nextLevel;
  state.nextLevel = rollNextLevel();
  state.hasReadyGlass = true;
  lockLauncherX();
}

function dropCurrentGlass() {
  if (state.gameOver || !state.hasReadyGlass || state.dropCooldown > 0) {
    return false;
  }
  lockLauncherX();
  if (!canSpawnAtX(state.currentLevel, state.launcherX)) {
    return false;
  }
  const r = levelData(state.currentLevel).radius;
  const glass = createGlass(state.currentLevel, state.launcherX, WORLD.table.top + r + 2);
  glass.vx = 0;
  glass.vy = 60;
  glasses.push(glass);
  state.hasReadyGlass = false;
  state.dropCooldown = PHYSICS.dropCooldown;
  return true;
}

function updateHud() {
  if (scoreEl) {
    scoreEl.textContent = String(state.score);
  }
  if (bestEl) {
    bestEl.textContent = String(state.best);
  }
  if (nextGlassEl) {
    const currentName = levelData(state.currentLevel).name;
    const nextName = levelData(state.nextLevel).name;
    nextGlassEl.textContent = `${currentName} > ${nextName}`;
  }
  if (glassCountEl) {
    glassCountEl.textContent = String(glasses.length);
  }
  if (stuckEl) {
    stuckEl.textContent = state.stuckTime.toFixed(1);
  }
}

function resetGame() {
  state.score = 0;
  state.gameOver = false;
  state.stuckTime = 0;
  state.lastTick = 0;
  state.nextLevel = rollNextLevel();
  state.currentLevel = rollNextLevel();
  state.launcherX = WORLD.width / 2;
  state.hasReadyGlass = true;
  state.dropCooldown = 0;
  glasses = [];
  pointer.active = false;
  pointer.id = null;
  updateHud();
}

function onPointerDown(event) {
  if (state.gameOver) {
    return;
  }
  const p = toCanvasPoint(event);
  pointer.active = true;
  pointer.id = event.pointerId;
  setLauncherX(p.x);
  canvas.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (pointer.active && event.pointerId !== pointer.id) {
    return;
  }
  const p = toCanvasPoint(event);
  setLauncherX(p.x);
}

function releasePointer(event) {
  if (!pointer.active || event.pointerId !== pointer.id) {
    return;
  }
  pointer.active = false;
  pointer.id = null;
  dropCurrentGlass();
}

function solveBoundary(g) {
  const minX = WORLD.table.left + g.radius;
  const maxX = WORLD.table.right - g.radius;
  const minY = WORLD.table.top + g.radius;
  const maxY = WORLD.table.bottom - g.radius;

  if (g.x < minX) {
    g.x = minX;
    g.vx = Math.abs(g.vx) * PHYSICS.restitution;
    g.vy *= PHYSICS.boundaryFriction;
  } else if (g.x > maxX) {
    g.x = maxX;
    g.vx = -Math.abs(g.vx) * PHYSICS.restitution;
    g.vy *= PHYSICS.boundaryFriction;
  }

  if (g.y < minY) {
    g.y = minY;
    g.vy = Math.abs(g.vy) * PHYSICS.restitution;
    g.vx *= PHYSICS.boundaryFriction;
  } else if (g.y > maxY) {
    g.y = maxY;
    g.vy = -Math.abs(g.vy) * PHYSICS.restitution;
    g.vx *= PHYSICS.boundaryFriction;
    if (Math.abs(g.vy) < 12) {
      g.vy = 0;
    }
  }
}

function resolveCollision(a, b) {
  let dx = b.x - a.x;
  let dy = b.y - a.y;
  let dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;
  if (dist <= 0.0001) {
    dist = 0.0001;
    dx = rand(-1, 1);
    dy = rand(-1, 1);
  }
  if (dist >= minDist) {
    return;
  }

  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;
  const totalMass = a.mass + b.mass;
  const aPush = (overlap * (b.mass / totalMass)) / 1.02;
  const bPush = (overlap * (a.mass / totalMass)) / 1.02;
  a.x -= nx * aPush;
  a.y -= ny * aPush;
  b.x += nx * bPush;
  b.y += ny * bPush;

  const rvx = b.vx - a.vx;
  const rvy = b.vy - a.vy;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal > 0) {
    return;
  }

  const e = PHYSICS.restitution;
  const j = (-(1 + e) * velAlongNormal) / (1 / a.mass + 1 / b.mass);
  const ix = j * nx;
  const iy = j * ny;
  a.vx -= ix / a.mass;
  a.vy -= iy / a.mass;
  b.vx += ix / b.mass;
  b.vy += iy / b.mass;
}

function mergeGlasses(a, b) {
  const nextLevel = a.level + 1;
  if (nextLevel >= LEVELS.length) {
    return;
  }

  const nx = (a.x + b.x) / 2;
  const ny = (a.y + b.y) / 2;
  const newGlass = createGlass(nextLevel, nx, ny);
  newGlass.vx = (a.vx + b.vx) * 0.2;
  newGlass.vy = (a.vy + b.vy) * 0.2;

  const gain = levelData(nextLevel).score;
  state.score += gain;
  state.best = Math.max(state.best, state.score);

  const removeIds = new Set([a.id, b.id]);
  glasses = glasses.filter((g) => !removeIds.has(g.id));
  glasses.push(newGlass);
}

function hasMergeOpportunity() {
  for (let i = 0; i < glasses.length; i += 1) {
    for (let j = i + 1; j < glasses.length; j += 1) {
      const a = glasses[i];
      const b = glasses[j];
      if (!canMerge(a, b)) {
        continue;
      }
      const rr = a.radius + b.radius + 8;
      if (distanceSq(a, b) <= rr * rr) {
        return true;
      }
    }
  }
  return false;
}

function anyGlassMoving() {
  for (let i = 0; i < glasses.length; i += 1) {
    const g = glasses[i];
    if (Math.hypot(g.vx, g.vy) > PHYSICS.velocitySleepThreshold) {
      return true;
    }
  }
  return false;
}

function isBoardBlocked() {
  if (!state.hasReadyGlass || state.dropCooldown > 0) {
    return false;
  }
  const noTopSpawn = !canSpawnFromTop(state.currentLevel);
  return noTopSpawn && !anyGlassMoving() && !hasMergeOpportunity();
}

function update(dt) {
  if (state.gameOver) {
    return;
  }

  if (!state.hasReadyGlass) {
    state.dropCooldown = Math.max(0, state.dropCooldown - dt);
    if (state.dropCooldown <= 0) {
      prepareNextGlass();
    }
  }

  for (let i = 0; i < glasses.length; i += 1) {
    const g = glasses[i];
    g.vy += PHYSICS.gravity * dt;
    const damping = Math.max(0, 1 - PHYSICS.dragDamping * dt);
    g.vx *= damping;
    g.vy *= damping;

    g.x += g.vx * dt;
    g.y += g.vy * dt;
    solveBoundary(g);

    if (g.y >= WORLD.table.bottom - g.radius - 0.5) {
      const floorFriction = Math.max(0, 1 - PHYSICS.rollingFriction * dt);
      g.vx *= floorFriction;
    }
  }

  const mergedIds = new Set();
  const merges = [];

  for (let i = 0; i < glasses.length; i += 1) {
    for (let j = i + 1; j < glasses.length; j += 1) {
      const a = glasses[i];
      const b = glasses[j];
      if (mergedIds.has(a.id) || mergedIds.has(b.id)) {
        continue;
      }

      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      const limit = a.radius + b.radius;
      if (dist > limit) {
        continue;
      }

      if (canMerge(a, b) && a.level < LEVELS.length - 1) {
        merges.push([a, b]);
        mergedIds.add(a.id);
        mergedIds.add(b.id);
      } else {
        resolveCollision(a, b);
      }
    }
  }

  for (let i = 0; i < merges.length; i += 1) {
    const [a, b] = merges[i];
    mergeGlasses(a, b);
  }

  if (isBoardBlocked()) {
    state.stuckTime += dt;
    if (state.stuckTime >= 5) {
      state.gameOver = true;
    }
  } else {
    state.stuckTime = 0;
  }
}

function drawTable() {
  ctx.fillStyle = "#201c35";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.fillStyle = "#292346";
  const w = WORLD.table.right - WORLD.table.left;
  const h = WORLD.table.bottom - WORLD.table.top;
  ctx.fillRect(WORLD.table.left, WORLD.table.top, w, h);
  ctx.strokeStyle = "#635fa3";
  ctx.lineWidth = 3;
  ctx.strokeRect(WORLD.table.left, WORLD.table.top, w, h);
}

function drawGlass(g) {
  const gradient = ctx.createRadialGradient(
    g.x - g.radius * 0.28,
    g.y - g.radius * 0.35,
    g.radius * 0.2,
    g.x,
    g.y,
    g.radius
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, g.color);
  gradient.addColorStop(1, "#1a1a1f");

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.max(10, g.radius * 0.38)}px Arial`;
  ctx.fillText(String(g.level + 1), g.x, g.y - 2);
}

function drawLauncher() {
  if (!state.hasReadyGlass) {
    return;
  }
  const info = levelData(state.currentLevel);
  const x = clamp(state.launcherX, WORLD.table.left + info.radius, WORLD.table.right - info.radius);
  const y = WORLD.table.top - Math.min(info.radius * 0.5, 34);

  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.moveTo(x, y + info.radius + 4);
  ctx.lineTo(x, WORLD.table.bottom);
  ctx.stroke();
  ctx.setLineDash([]);

  const gradient = ctx.createRadialGradient(
    x - info.radius * 0.3,
    y - info.radius * 0.35,
    info.radius * 0.2,
    x,
    y,
    info.radius
  );
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, info.color);
  gradient.addColorStop(1, "#1a1a1f");

  ctx.globalAlpha = 0.92;
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, info.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.strokeStyle = "rgba(255, 214, 77, 0.95)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, info.radius + 3, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFloatingInfo() {
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 15px Arial";
  ctx.fillText("Drop Mode (Juice Merge tarzi)", 18, 16);
  ctx.font = "13px Arial";
  ctx.fillText("Ustteki kadehi saga-sola ayarla, birakinca masaya duser.", 18, 36);
  ctx.fillText("Mouse/touch birak: dusur | Klavye: Sol-Sag + Space", 18, 54);
}

function drawGameOver() {
  if (!state.gameOver) {
    return;
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.62)";
  ctx.fillRect(0, 0, WORLD.width, WORLD.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 38px Arial";
  ctx.fillText("Game Over", WORLD.width / 2, WORLD.height / 2 - 26);
  ctx.font = "19px Arial";
  ctx.fillText(
    "Masa dolu ve 5 saniye hareket imkani kalmadi.",
    WORLD.width / 2,
    WORLD.height / 2 + 14
  );
  ctx.font = "16px Arial";
  ctx.fillText("Yeniden Baslat ile tekrar dene.", WORLD.width / 2, WORLD.height / 2 + 44);
}

function render() {
  ctx.clearRect(0, 0, WORLD.width, WORLD.height);
  drawTable();
  for (let i = 0; i < glasses.length; i += 1) {
    drawGlass(glasses[i]);
  }
  drawLauncher();
  drawFloatingInfo();
  drawGameOver();
}

function frame(ts) {
  if (!state.lastTick) {
    state.lastTick = ts;
  }
  const dt = Math.min((ts - state.lastTick) / 1000, PHYSICS.maxDelta);
  state.lastTick = ts;
  update(dt);
  render();
  updateHud();
  requestAnimationFrame(frame);
}

canvas.addEventListener("pointerdown", onPointerDown);
canvas.addEventListener("pointermove", onPointerMove);
canvas.addEventListener("pointerup", releasePointer);
canvas.addEventListener("pointercancel", releasePointer);

if (restartBtn) {
  restartBtn.addEventListener("click", () => {
    resetGame();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    setLauncherX(state.launcherX - PHYSICS.launcherStep);
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    setLauncherX(state.launcherX + PHYSICS.launcherStep);
  }
  if (event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    dropCurrentGlass();
  }
  if (event.code === "KeyR") {
    resetGame();
  }
});

canvas.width = WORLD.width;
canvas.height = WORLD.height;
resetGame();
requestAnimationFrame(frame);
