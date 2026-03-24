const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const glassCountEl = document.getElementById("glassCount");
const stuckEl = document.getElementById("stuck");
const restartBtn = document.getElementById("restart");

const WORLD = {
  width: 800,
  height: 520,
  table: {
    left: 28,
    right: 772,
    top: 70,
    bottom: 500,
  },
};

const PHYSICS = {
  restitution: 0.24,
  dragDamping: 6.2,
  rollingFriction: 1.6,
  boundaryFriction: 0.92,
  pointerForce: 46,
  velocitySleepThreshold: 11,
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
  spawnTimer: 0.8,
  nextGlassId: 1,
};

/** @type {Array<{
 * id:number, level:number, tag:string, x:number, y:number, vx:number, vy:number, radius:number, mass:number, color:string
 * }>} */
let glasses = [];

const pointer = {
  active: false,
  id: null,
  glassId: null,
  x: 0,
  y: 0,
  targetX: 0,
  targetY: 0,
  prevX: 0,
  prevY: 0,
  prevT: 0,
  impulseX: 0,
  impulseY: 0,
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

function createGlass(level, x, y) {
  const info = levelData(level);
  return {
    id: state.nextGlassId++,
    level,
    tag: info.tag, // Tag tabanli tanima
    x,
    y,
    vx: rand(-16, 16),
    vy: rand(-14, 14),
    radius: info.radius,
    mass: info.radius * info.radius,
    color: info.color,
  };
}

function canMerge(a, b) {
  return a.level === b.level && a.tag === b.tag; // ID farkli, Tag ayni ise merge
}

function tryFindSpawnPoint(level, fromTop = true) {
  const info = levelData(level);
  const r = info.radius;
  const minX = WORLD.table.left + r;
  const maxX = WORLD.table.right - r;
  const minY = WORLD.table.top + r;
  const maxY = WORLD.table.bottom - r;

  for (let attempt = 0; attempt < 45; attempt += 1) {
    const x = rand(minX, maxX);
    const y = fromTop ? WORLD.table.top + r - rand(30, 80) : rand(minY, maxY);
    let blocked = false;
    for (let i = 0; i < glasses.length; i += 1) {
      const other = glasses[i];
      const rr = other.radius + r + 2;
      const dx = other.x - x;
      const dy = other.y - y;
      if (dx * dx + dy * dy < rr * rr) {
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      return { x, y };
    }
  }
  return null;
}

function spawnGlass(level = 0) {
  const fromTop = Math.random() < 0.6;
  const point = tryFindSpawnPoint(level, fromTop);
  if (!point) {
    return false;
  }
  const glass = createGlass(level, point.x, point.y);
  if (fromTop) {
    glass.vy += rand(120, 190);
  }
  glasses.push(glass);
  return true;
}

function updateHud() {
  scoreEl.textContent = String(state.score);
  bestEl.textContent = String(state.best);
  glassCountEl.textContent = String(glasses.length);
  stuckEl.textContent = state.stuckTime.toFixed(1);
}

function resetGame() {
  state.score = 0;
  state.gameOver = false;
  state.stuckTime = 0;
  state.spawnTimer = 0.7;
  glasses = [];
  for (let i = 0; i < 6; i += 1) {
    spawnGlass(0);
  }
  updateHud();
}

function findTopGlassAt(x, y) {
  let picked = null;
  for (let i = glasses.length - 1; i >= 0; i -= 1) {
    const g = glasses[i];
    const dx = g.x - x;
    const dy = g.y - y;
    if (dx * dx + dy * dy <= g.radius * g.radius) {
      picked = g;
      break;
    }
  }
  return picked;
}

function onPointerDown(event) {
  if (state.gameOver) {
    return;
  }
  const p = toCanvasPoint(event);
  pointer.active = true;
  pointer.id = event.pointerId;
  pointer.x = p.x;
  pointer.y = p.y;
  pointer.targetX = p.x;
  pointer.targetY = p.y;
  pointer.prevX = p.x;
  pointer.prevY = p.y;
  pointer.prevT = performance.now();
  pointer.impulseX = 0;
  pointer.impulseY = 0;
  const picked = findTopGlassAt(p.x, p.y);
  pointer.glassId = picked ? picked.id : null;
  canvas.setPointerCapture(event.pointerId);
}

function onPointerMove(event) {
  if (!pointer.active || event.pointerId !== pointer.id) {
    return;
  }
  const p = toCanvasPoint(event);
  const now = performance.now();
  const dt = Math.max((now - pointer.prevT) / 1000, 1 / 240);
  pointer.impulseX = (p.x - pointer.prevX) / dt;
  pointer.impulseY = (p.y - pointer.prevY) / dt;
  pointer.prevX = p.x;
  pointer.prevY = p.y;
  pointer.prevT = now;
  pointer.x = p.x;
  pointer.y = p.y;
  pointer.targetX = p.x;
  pointer.targetY = p.y;
}

function releasePointer(event) {
  if (!pointer.active || event.pointerId !== pointer.id) {
    return;
  }
  const held = glasses.find((g) => g.id === pointer.glassId);
  if (held) {
    held.vx += pointer.impulseX * 0.08;
    held.vy += pointer.impulseY * 0.08;
  }
  pointer.active = false;
  pointer.id = null;
  pointer.glassId = null;
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
  const noSpawnRoom = !tryFindSpawnPoint(0, false) && !tryFindSpawnPoint(0, true);
  return noSpawnRoom && !anyGlassMoving() && !hasMergeOpportunity() && !pointer.active;
}

function update(dt) {
  if (state.gameOver) {
    return;
  }

  const held =
    pointer.active && pointer.glassId
      ? glasses.find((g) => g.id === pointer.glassId) || null
      : null;

  for (let i = 0; i < glasses.length; i += 1) {
    const g = glasses[i];
    if (held && g.id === held.id) {
      const tx = clamp(
        pointer.targetX,
        WORLD.table.left + g.radius,
        WORLD.table.right - g.radius
      );
      const ty = clamp(
        pointer.targetY,
        WORLD.table.top + g.radius,
        WORLD.table.bottom - g.radius
      );
      const ax = (tx - g.x) * PHYSICS.pointerForce;
      const ay = (ty - g.y) * PHYSICS.pointerForce;
      g.vx += ax * dt;
      g.vy += ay * dt;
      g.vx *= 0.84;
      g.vy *= 0.84;
    } else {
      const damping = Math.max(0, 1 - PHYSICS.dragDamping * dt * 0.2);
      g.vx *= damping;
      g.vy *= damping;
    }

    const friction = Math.max(0, 1 - PHYSICS.rollingFriction * dt * 0.08);
    g.vx *= friction;
    g.vy *= friction;

    g.x += g.vx * dt;
    g.y += g.vy * dt;
    solveBoundary(g);
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

  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnGlass(0);
    state.spawnTimer = rand(1.15, 1.95);
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

function drawFloatingInfo() {
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 15px Arial";
  ctx.fillText("Swipe & Merge", 18, 16);
  ctx.font = "13px Arial";
  ctx.fillText("Ayni tag/ID seviyesi temas edince bir ust seviyeye birlesir.", 18, 36);
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

restartBtn.addEventListener("click", () => {
  resetGame();
});

document.addEventListener("keydown", (event) => {
  if (event.code === "KeyR") {
    resetGame();
  }
});

canvas.width = WORLD.width;
canvas.height = WORLD.height;
resetGame();
requestAnimationFrame(frame);
