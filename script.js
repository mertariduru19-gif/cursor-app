const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const ui = {
  playerLevel: document.getElementById("player-level"),
  playerXp: document.getElementById("player-xp"),
  playerHp: document.getElementById("player-hp"),
  playerAmmo: document.getElementById("player-ammo"),
  wave: document.getElementById("wave"),
  kills: document.getElementById("kills"),
  credits: document.getElementById("credits"),
  characterSelect: document.getElementById("character-select"),
  weaponSelect: document.getElementById("weapon-select"),
  unlockCharacter: document.getElementById("unlock-character"),
  unlockWeapon: document.getElementById("unlock-weapon"),
  upgradeWeapon: document.getElementById("upgrade-weapon"),
  weaponLevel: document.getElementById("weapon-level"),
  weaponInfo: document.getElementById("weapon-info"),
  characterInfo: document.getElementById("character-info"),
  missionMain: document.getElementById("mission-main"),
  missionDaily: document.getElementById("mission-daily"),
  skillDamage: document.getElementById("skill-damage"),
  skillHealth: document.getElementById("skill-health"),
  skillSpeed: document.getElementById("skill-speed"),
  skillPoints: document.getElementById("skill-points"),
  start: document.getElementById("start"),
  pause: document.getElementById("pause"),
  ability: document.getElementById("ability"),
  reset: document.getElementById("reset"),
  overlay: document.getElementById("overlay"),
  overlayTitle: document.getElementById("overlay-title"),
  overlaySubtitle: document.getElementById("overlay-subtitle"),
  overlayWave: document.getElementById("overlay-wave"),
  overlayKills: document.getElementById("overlay-kills"),
  overlayCredits: document.getElementById("overlay-credits"),
  restart: document.getElementById("restart"),
  modButtons: Array.from(document.querySelectorAll(".mod-btn")),
  skillButtons: Array.from(document.querySelectorAll(".skill-up")),
};

const base = {
  width: 900,
  height: 520,
  arenaPadding: 36,
};

const characters = [
  {
    id: "forge",
    name: "Mara Forge",
    rarity: "Common",
    cost: 0,
    base: { maxHp: 120, speed: 150, damageMult: 1, crit: 0.05 },
    passive: "Atolye ustasi: yukseltme maliyeti -5%",
    active: "Alan tamiri: hasar artisi + iyilesme",
    ability: { cooldown: 16, duration: 8 },
  },
  {
    id: "nomad",
    name: "Rhea Nomad",
    rarity: "Rare",
    cost: 260,
    base: { maxHp: 105, speed: 170, damageMult: 1.05, crit: 0.05 },
    passive: "Gocebe ruh: alinan hasar -10%",
    active: "Sis bombasi: gizlenme ve hiz",
    ability: { cooldown: 18, duration: 4 },
  },
  {
    id: "pulse",
    name: "Aya Pulse",
    rarity: "Rare",
    cost: 260,
    base: { maxHp: 110, speed: 160, damageMult: 0.98, crit: 0.06 },
    passive: "Enerji beslemesi: hurda +15%",
    active: "EMP alani: robotlari kilitler",
    ability: { cooldown: 20, duration: 4 },
  },
  {
    id: "ironwall",
    name: "Tarek Ironwall",
    rarity: "Epic",
    cost: 540,
    base: { maxHp: 150, speed: 130, damageMult: 0.95, crit: 0.04 },
    passive: "Celik damar: dusuk HP'de hasar azaltir",
    active: "Kalkan darbesi: itme ve sersemletme",
    ability: { cooldown: 22, duration: 2 },
  },
  {
    id: "specter",
    name: "Jin Specter",
    rarity: "Legendary",
    cost: 900,
    base: { maxHp: 95, speed: 180, damageMult: 1.12, crit: 0.1 },
    passive: "Keskin icgudu: kritik sansi +8%",
    active: "Golge atlama: kisa sicrama + kritik artisi",
    ability: { cooldown: 20, duration: 3 },
  },
];

const weapons = [
  {
    id: "carapace",
    name: "Carapace Rifle",
    rarity: "Common",
    cost: 0,
    base: {
      damage: 12,
      fireRate: 4.6,
      reload: 1.4,
      magazine: 12,
      projectileSpeed: 540,
      spread: 0.02,
      pelletCount: 1,
      pierce: 0.35,
    },
    special: "Zirh delme",
  },
  {
    id: "vektor",
    name: "Vektor-9",
    rarity: "Rare",
    cost: 240,
    base: {
      damage: 7,
      fireRate: 8.2,
      reload: 1.5,
      magazine: 24,
      projectileSpeed: 520,
      spread: 0.05,
      pelletCount: 1,
    },
    special: "Zincir kritik",
  },
  {
    id: "ashmaker",
    name: "Ashmaker",
    rarity: "Rare",
    cost: 280,
    base: {
      damage: 8,
      fireRate: 1.1,
      reload: 1.8,
      magazine: 5,
      projectileSpeed: 460,
      spread: 0.18,
      pelletCount: 6,
    },
    special: "Yakin alan patlamasi",
  },
  {
    id: "hailstorm",
    name: "Hailstorm LMG",
    rarity: "Epic",
    cost: 560,
    base: {
      damage: 6,
      fireRate: 9.2,
      reload: 2.2,
      magazine: 40,
      projectileSpeed: 520,
      spread: 0.06,
      pelletCount: 1,
    },
    special: "Baski alani",
  },
  {
    id: "talon",
    name: "Talon Bow",
    rarity: "Legendary",
    cost: 880,
    base: {
      damage: 28,
      fireRate: 1.3,
      reload: 1.2,
      magazine: 6,
      projectileSpeed: 640,
      spread: 0.01,
      pelletCount: 1,
      pierce: 0.5,
    },
    special: "Keskin tek atis",
  },
];

const modifiers = {
  fire: { label: "Alev", cost: 220, desc: "Yanma hasari" },
  poison: { label: "Zehir", cost: 220, desc: "Yavaslatma" },
  crit: { label: "Kritik", cost: 260, desc: "Kritik sansi" },
  splash: { label: "Sok", cost: 260, desc: "Alan hasari" },
};

const enemyTypes = {
  stalker: {
    name: "Stalker",
    radius: 11,
    speed: 140,
    hp: 28,
    damage: 6,
    reward: 3,
    xp: 8,
    behavior: "melee",
    color: "#d96262",
  },
  brute: {
    name: "Brute",
    radius: 18,
    speed: 70,
    hp: 80,
    damage: 14,
    reward: 7,
    xp: 18,
    behavior: "melee",
    armor: 0.2,
    color: "#a06a46",
  },
  spitter: {
    name: "Spitter",
    radius: 14,
    speed: 85,
    hp: 38,
    damage: 8,
    reward: 5,
    xp: 12,
    behavior: "ranged",
    range: 230,
    shotRate: 1.2,
    projectileSpeed: 240,
    effect: "poison",
    color: "#7bbd56",
  },
  drone: {
    name: "Drone",
    radius: 12,
    speed: 110,
    hp: 32,
    damage: 7,
    reward: 5,
    xp: 12,
    behavior: "ranged",
    range: 240,
    shotRate: 1.5,
    projectileSpeed: 260,
    robot: true,
    color: "#5fb3dc",
  },
  warden: {
    name: "Warden",
    radius: 20,
    speed: 60,
    hp: 115,
    damage: 18,
    reward: 10,
    xp: 25,
    behavior: "melee",
    armor: 0.45,
    color: "#8b8b8b",
  },
};

const bossType = {
  id: "titan",
  name: "Broken Titan",
  radius: 36,
  speed: 55,
  hp: 650,
  damage: 22,
  reward: 120,
  xp: 120,
  armor: 0.5,
  color: "#b04a4a",
};

const SAVE_KEY = "ashfall_survival_save_v1";

let save = loadSave();
let scale = 1;
let world = {
  width: base.width,
  height: base.height,
};

let keys = {};
let input = {
  pointerId: null,
  active: false,
  origin: { x: 0, y: 0 },
  current: { x: 0, y: 0 },
};

let state = {
  status: "idle",
  paused: false,
  wave: 1,
  kills: 0,
  runCredits: 0,
  time: 0,
  waveStart: 0,
  waveDelay: 0,
  waveCleared: false,
  mission: null,
  toast: { text: "", timer: 0 },
  saveTimer: 0,
};

let player = {};
let weaponState = {};
let bullets = [];
let enemyShots = [];
let enemies = [];
let pickups = [];
let effects = {
  invis: 0,
  emp: 0,
  damageBoost: 0,
  critBoost: 0,
};

let difficulty = {
  factor: 1,
  targetWaveTime: 26,
};

let lastTime = 0;
let saveDirty = false;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(x, y) {
  const len = Math.sqrt(x * x + y * y);
  if (len <= 0.001) {
    return { x: 0, y: 0 };
  }
  return { x: x / len, y: y / len };
}

function xpToNextLevel(level) {
  return 100 + (level - 1) * 40;
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function createDailyChallenge(dateKey) {
  const templates = [
    {
      type: "kills",
      target: 45,
      reward: 120,
      label: "Gunluk: 45 dusman yok et",
    },
    {
      type: "waves",
      target: 5,
      reward: 150,
      label: "Gunluk: 5 dalga tamamla",
    },
    {
      type: "scrap",
      target: 120,
      reward: 130,
      label: "Gunluk: 120 hurda topla",
    },
  ];
  const pick = templates[randInt(0, templates.length - 1)];
  return {
    date: dateKey,
    type: pick.type,
    target: pick.target,
    progress: 0,
    reward: pick.reward,
    label: pick.label,
    done: false,
  };
}

function createDefaultSave() {
  const unlockedCharacters = {};
  const unlockedWeapons = {};
  const weaponLevels = {};
  const mastery = {};

  characters.forEach((character) => {
    unlockedCharacters[character.id] = character.id === "forge";
    mastery[character.id] = { xp: 0, level: 1 };
  });
  weapons.forEach((weapon) => {
    unlockedWeapons[weapon.id] = weapon.id === "carapace";
    weaponLevels[weapon.id] = 1;
  });

  return {
    credits: 0,
    unlockedCharacters,
    selectedCharacter: "forge",
    unlockedWeapons,
    selectedWeapon: "carapace",
    weaponLevels,
    modifiers: {
      fire: false,
      poison: false,
      crit: false,
      splash: false,
    },
    playerLevel: 1,
    playerXp: 0,
    skillPoints: 0,
    skills: {
      damage: 0,
      health: 0,
      speed: 0,
    },
    mastery,
    dailyChallenge: createDailyChallenge(getTodayKey()),
  };
}

function mergeObjects(baseObj, stored) {
  return Object.assign({}, baseObj, stored || {});
}

function loadSave() {
  const defaults = createDefaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return defaults;
    }
    const parsed = JSON.parse(raw);
    const merged = {
      ...defaults,
      ...parsed,
      unlockedCharacters: mergeObjects(
        defaults.unlockedCharacters,
        parsed.unlockedCharacters
      ),
      unlockedWeapons: mergeObjects(
        defaults.unlockedWeapons,
        parsed.unlockedWeapons
      ),
      weaponLevels: mergeObjects(defaults.weaponLevels, parsed.weaponLevels),
      modifiers: mergeObjects(defaults.modifiers, parsed.modifiers),
      skills: mergeObjects(defaults.skills, parsed.skills),
      mastery: mergeObjects(defaults.mastery, parsed.mastery),
    };
    const today = getTodayKey();
    if (!merged.dailyChallenge || merged.dailyChallenge.date !== today) {
      merged.dailyChallenge = createDailyChallenge(today);
    }
    return merged;
  } catch (error) {
    return defaults;
  }
}

function queueSave() {
  saveDirty = true;
}

function flushSave() {
  if (!saveDirty) {
    return;
  }
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  saveDirty = false;
}

function getCharacterById(id) {
  return characters.find((character) => character.id === id);
}

function getWeaponById(id) {
  return weapons.find((weapon) => weapon.id === id);
}

function getWeaponLevel(id) {
  return save.weaponLevels[id] || 1;
}

function getWeaponStats(id, levelOverride) {
  const weapon = getWeaponById(id);
  const level = levelOverride || getWeaponLevel(id);
  const baseStats = weapon.base;
  const levelFactor = level - 1;
  const damage = baseStats.damage * (1 + levelFactor * 0.07);
  const fireRate = baseStats.fireRate * (1 + levelFactor * 0.02);
  const reload = Math.max(0.6, baseStats.reload * (1 - levelFactor * 0.01));
  const magazine = baseStats.magazine + Math.floor(levelFactor / 4);
  const projectileSpeed = baseStats.projectileSpeed + levelFactor * 4;
  return {
    damage,
    fireRate,
    reload,
    magazine,
    projectileSpeed,
    spread: baseStats.spread,
    pelletCount: baseStats.pelletCount || 1,
    pierce: baseStats.pierce || 0,
  };
}

function getUnlockCostRarity(rarity) {
  switch (rarity) {
    case "Rare":
      return 260;
    case "Epic":
      return 540;
    case "Legendary":
      return 900;
    default:
      return 0;
  }
}

function getWeaponUpgradeCost(id) {
  const weapon = getWeaponById(id);
  const level = getWeaponLevel(id);
  const baseCost = 60 + level * 35;
  const rarityCost = getUnlockCostRarity(weapon.rarity) * 0.25 + 1;
  const forgeDiscount = save.selectedCharacter === "forge" ? 0.95 : 1;
  return Math.floor(baseCost * rarityCost * forgeDiscount);
}

function updatePauseLabel() {
  const paused = state.paused;
  ui.pause.textContent = paused ? "Devam" : "Duraklat";
  ui.pause.setAttribute("aria-pressed", paused ? "true" : "false");
}

function updateAbilityLabel() {
  if (state.status !== "running") {
    ui.ability.textContent = "Yetenek";
    return;
  }
  if (player.abilityCooldown > 0) {
    ui.ability.textContent = `Yetenek (${player.abilityCooldown.toFixed(1)}s)`;
  } else {
    ui.ability.textContent = "Yetenek Hazir";
  }
}

function updateStatusBar() {
  ui.playerLevel.textContent = save.playerLevel;
  ui.playerXp.textContent = `${Math.floor(save.playerXp)}/${xpToNextLevel(
    save.playerLevel
  )}`;
  if (player && player.maxHp) {
    ui.playerHp.textContent = `${Math.ceil(player.hp)}/${Math.ceil(
      player.maxHp
    )}`;
  } else {
    ui.playerHp.textContent = "0/0";
  }
  if (weaponState && weaponState.magazine) {
    ui.playerAmmo.textContent = `${weaponState.ammo}/${weaponState.magazine}`;
  } else {
    ui.playerAmmo.textContent = "0/0";
  }
  ui.wave.textContent = state.wave;
  ui.kills.textContent = state.kills;
  ui.credits.textContent = save.credits;
}

function updateSkillPanel() {
  ui.skillDamage.textContent = save.skills.damage;
  ui.skillHealth.textContent = save.skills.health;
  ui.skillSpeed.textContent = save.skills.speed;
  ui.skillPoints.textContent = save.skillPoints;
  ui.skillButtons.forEach((button) => {
    button.disabled = save.skillPoints <= 0;
  });
}

function updateMissionPanel() {
  if (!state.mission) {
    ui.missionMain.textContent = "Misyon: Baslatinca aktif olur";
  } else {
    const mission = state.mission;
    ui.missionMain.textContent = `Misyon: Dalga ${mission.waveProgress}/${mission.waveTarget}, Dusman ${mission.killProgress}/${mission.killTarget} (Odul ${mission.reward})`;
  }
  const daily = save.dailyChallenge;
  if (daily.done) {
    ui.missionDaily.textContent = `${daily.label} (Tamamlandi +${daily.reward})`;
  } else {
    ui.missionDaily.textContent = `${daily.label} (${daily.progress}/${daily.target})`;
  }
}

function updateCharacterPanel() {
  const selectedId = ui.characterSelect.value || save.selectedCharacter;
  const character = getCharacterById(selectedId);
  const unlocked = save.unlockedCharacters[character.id];
  const cost = character.cost || getUnlockCostRarity(character.rarity);
  ui.characterInfo.textContent = `${character.name} [${character.rarity}] Pasif: ${character.passive}. Aktif: ${character.active}.`;
  if (unlocked) {
    ui.unlockCharacter.textContent = "Acik";
    ui.unlockCharacter.disabled = true;
  } else {
    ui.unlockCharacter.textContent = `Kilidi Ac (${cost})`;
    ui.unlockCharacter.disabled = save.credits < cost;
  }
}

function updateWeaponPanel() {
  const selectedId = ui.weaponSelect.value || save.selectedWeapon;
  const weapon = getWeaponById(selectedId);
  const unlocked = save.unlockedWeapons[weapon.id];
  const level = getWeaponLevel(weapon.id);
  const stats = getWeaponStats(weapon.id, level);
  const cost = weapon.cost || getUnlockCostRarity(weapon.rarity);
  ui.weaponLevel.textContent = level;
  ui.weaponInfo.textContent = `${weapon.name} [${weapon.rarity}] Hasar ${Math.round(
    stats.damage
  )} | Atis ${stats.fireRate.toFixed(1)}/sn | Sarjor ${
    stats.magazine
  } | Yeniden ${stats.reload.toFixed(1)}sn | Ozel: ${weapon.special}`;
  if (unlocked) {
    ui.unlockWeapon.textContent = "Acik";
    ui.unlockWeapon.disabled = true;
    const upgradeCost = getWeaponUpgradeCost(weapon.id);
    ui.upgradeWeapon.textContent = `Silahi Yukselt (${upgradeCost})`;
    ui.upgradeWeapon.disabled = save.credits < upgradeCost;
  } else {
    ui.unlockWeapon.textContent = `Kilidi Ac (${cost})`;
    ui.unlockWeapon.disabled = save.credits < cost;
    ui.upgradeWeapon.textContent = "Silah Kilitli";
    ui.upgradeWeapon.disabled = true;
  }
}

function updateModifiersPanel() {
  ui.modButtons.forEach((button) => {
    const modId = button.dataset.mod;
    const owned = save.modifiers[modId];
    const mod = modifiers[modId];
    button.classList.toggle("owned", owned);
    button.classList.toggle("active", owned);
    if (owned) {
      button.textContent = `${mod.label} Aktif`;
    } else {
      button.textContent = `${mod.label} (${mod.cost})`;
    }
    button.disabled = owned || save.credits < mod.cost;
  });
}

function updateStartState() {
  const characterId = ui.characterSelect.value || save.selectedCharacter;
  const weaponId = ui.weaponSelect.value || save.selectedWeapon;
  const canStart =
    save.unlockedCharacters[characterId] && save.unlockedWeapons[weaponId];
  ui.start.disabled = !canStart;
}

function updateAllUI() {
  updateCharacterPanel();
  updateWeaponPanel();
  updateModifiersPanel();
  updateSkillPanel();
  updateMissionPanel();
  updateStatusBar();
  updateAbilityLabel();
  updatePauseLabel();
  updateStartState();
}

function showOverlay(title, subtitle) {
  ui.overlayTitle.textContent = title;
  ui.overlaySubtitle.textContent = subtitle || "";
  ui.overlayWave.textContent = state.wave;
  ui.overlayKills.textContent = state.kills;
  ui.overlayCredits.textContent = state.runCredits;
  ui.overlay.classList.remove("hidden");
}

function hideOverlay() {
  ui.overlay.classList.add("hidden");
}

function showToast(text) {
  state.toast.text = text;
  state.toast.timer = 2.2;
}

function resetRun() {
  state.wave = 1;
  state.kills = 0;
  state.runCredits = 0;
  state.time = 0;
  state.waveDelay = 0;
  state.waveCleared = false;
  state.mission = createMission();
  bullets = [];
  enemyShots = [];
  enemies = [];
  pickups = [];
  effects = {
    invis: 0,
    emp: 0,
    damageBoost: 0,
    critBoost: 0,
  };
  createPlayer();
  configureWeaponState();
  spawnWave();
  updateAllUI();
}

function createMission() {
  const waveTarget = 3 + Math.floor(save.playerLevel / 2);
  const killTarget = 20 + Math.floor(save.playerLevel * 4);
  const reward = 90 + waveTarget * 12;
  return {
    waveTarget,
    killTarget,
    waveProgress: 0,
    killProgress: 0,
    reward,
    completed: false,
  };
}

function createPlayer() {
  const characterId = save.selectedCharacter;
  const character = getCharacterById(characterId);
  const mastery = save.mastery[characterId] || { xp: 0, level: 1 };
  const masteryBonus = 1 + (mastery.level - 1) * 0.02;
  const skillDamage = save.skills.damage * 0.04;
  const skillHealth = save.skills.health * 0.06;
  const skillSpeed = save.skills.speed * 0.03;

  const maxHp = character.base.maxHp * (1 + skillHealth) * masteryBonus;
  const speed = character.base.speed * (1 + skillSpeed);
  const damageMult = character.base.damageMult * (1 + skillDamage) * masteryBonus;
  let critChance = character.base.crit;
  if (character.id === "specter") {
    critChance += 0.08;
  }

  player = {
    id: character.id,
    x: world.width * 0.5,
    y: world.height * 0.55,
    radius: 12 * scale,
    maxHp,
    hp: maxHp,
    baseSpeed: speed,
    speed,
    damageMult,
    critChance,
    critMult: 1.6,
    baseDamageReduction: character.id === "nomad" ? 0.1 : 0,
    invuln: 0,
    slowTimer: 0,
    lastMoveDir: { x: 1, y: 0 },
    abilityCooldown: 0,
    abilityDuration: character.ability.duration,
    abilityMaxCooldown: character.ability.cooldown,
    pickupBonus: character.id === "pulse" ? 0.15 : 0,
  };
}

function configureWeaponState() {
  const weaponId = save.selectedWeapon;
  const stats = getWeaponStats(weaponId);
  weaponState = {
    id: weaponId,
    level: getWeaponLevel(weaponId),
    ammo: stats.magazine,
    magazine: stats.magazine,
    shotTimer: 0,
    reloadTimer: 0,
  };
}

function startGame() {
  const characterId = ui.characterSelect.value || save.selectedCharacter;
  const weaponId = ui.weaponSelect.value || save.selectedWeapon;
  if (!save.unlockedCharacters[characterId]) {
    showToast("Karakter kilitli");
    return;
  }
  if (!save.unlockedWeapons[weaponId]) {
    showToast("Silah kilitli");
    return;
  }
  save.selectedCharacter = characterId;
  save.selectedWeapon = weaponId;
  queueSave();
  resetRun();
  state.status = "running";
  state.paused = false;
  hideOverlay();
  lastTime = performance.now();
  updatePauseLabel();
}

function endRun(message) {
  state.status = "over";
  state.paused = false;
  showOverlay(message || "Oyun Bitti", "Yeni kosu icin tekrar basla");
  flushSave();
  updatePauseLabel();
}

function togglePause() {
  if (state.status !== "running") {
    return;
  }
  state.paused = !state.paused;
  updatePauseLabel();
  if (!state.paused) {
    lastTime = performance.now();
  }
}

function spawnWave() {
  state.waveStart = state.time;
  state.waveCleared = false;
  const bossWave = state.wave % 5 === 0;
  const baseCount = 5 + Math.floor(state.wave * 2.2);
  if (bossWave) {
    spawnBoss();
    const minionCount = Math.max(4, Math.floor(baseCount * 0.6));
    for (let i = 0; i < minionCount; i += 1) {
      spawnEnemyFromPool();
    }
    showToast(`Boss Dalgasi ${state.wave}`);
  } else {
    for (let i = 0; i < baseCount; i += 1) {
      spawnEnemyFromPool();
    }
    showToast(`Dalga ${state.wave}`);
  }
}

function getWaveEnemyPool(wave) {
  const pool = ["stalker"];
  if (wave >= 2) pool.push("spitter");
  if (wave >= 3) pool.push("brute");
  if (wave >= 4) pool.push("drone");
  if (wave >= 6) pool.push("warden");
  return pool;
}

function spawnEnemyFromPool() {
  const pool = getWaveEnemyPool(state.wave);
  const pick = pool[randInt(0, pool.length - 1)];
  spawnEnemy(pick);
}

function getSpawnPoint() {
  const pad = base.arenaPadding * scale;
  const side = randInt(0, 3);
  const margin = 26 * scale;
  if (side === 0) {
    return { x: rand(pad, world.width - pad), y: -margin };
  }
  if (side === 1) {
    return { x: world.width + margin, y: rand(pad, world.height - pad) };
  }
  if (side === 2) {
    return { x: rand(pad, world.width - pad), y: world.height + margin };
  }
  return { x: -margin, y: rand(pad, world.height - pad) };
}

function spawnEnemy(typeId) {
  const type = enemyTypes[typeId];
  const spawn = getSpawnPoint();
  const waveFactor = 1 + (state.wave - 1) * 0.08;
  const levelFactor = 1 + (save.playerLevel - 1) * 0.04;
  const factor = waveFactor * levelFactor * difficulty.factor;
  enemies.push({
    id: typeId,
    x: spawn.x,
    y: spawn.y,
    radius: type.radius * scale,
    speed: type.speed * (1 + (state.wave - 1) * 0.02) * difficulty.factor,
    maxHp: type.hp * factor,
    hp: type.hp * factor,
    damage: type.damage * (1 + (state.wave - 1) * 0.04),
    reward: type.reward,
    xp: type.xp,
    behavior: type.behavior,
    armor: type.armor || 0,
    range: type.range || 0,
    shotRate: type.shotRate || 0,
    projectileSpeed: type.projectileSpeed || 0,
    color: type.color,
    robot: type.robot || false,
    effect: type.effect || null,
    attackTimer: rand(0.2, 0.8),
    stun: 0,
    burnTime: 0,
    burnDps: 0,
    poisonTime: 0,
  });
}

function spawnBoss() {
  const spawn = getSpawnPoint();
  const waveFactor = 1 + (state.wave - 1) * 0.1;
  const levelFactor = 1 + (save.playerLevel - 1) * 0.05;
  const factor = waveFactor * levelFactor * difficulty.factor;
  enemies.push({
    id: "boss",
    x: spawn.x,
    y: spawn.y,
    radius: bossType.radius * scale,
    speed: bossType.speed * (1 + (state.wave - 1) * 0.01),
    maxHp: bossType.hp * factor,
    hp: bossType.hp * factor,
    damage: bossType.damage * (1 + (state.wave - 1) * 0.05),
    reward: bossType.reward,
    xp: bossType.xp,
    behavior: "boss",
    armor: bossType.armor,
    color: bossType.color,
    attackTimer: 2.5,
    stun: 0,
    burnTime: 0,
    burnDps: 0,
    poisonTime: 0,
    phase: 1,
  });
}

function addCredits(amount, isPickup) {
  let finalAmount = amount;
  if (isPickup && player.pickupBonus) {
    finalAmount = Math.floor(amount * (1 + player.pickupBonus));
  }
  save.credits += finalAmount;
  state.runCredits += finalAmount;
  queueSave();
  updateStatusBar();
  if (isPickup) {
    updateDailyProgress("scrap", finalAmount);
  }
}

function gainXp(amount) {
  save.playerXp += amount;
  let leveledUp = false;
  while (save.playerXp >= xpToNextLevel(save.playerLevel)) {
    save.playerXp -= xpToNextLevel(save.playerLevel);
    save.playerLevel += 1;
    save.skillPoints += 1;
    leveledUp = true;
  }
  if (leveledUp) {
    showToast("Seviye artti! +1 yetenek puani");
    updateSkillPanel();
  }
  queueSave();
}

function gainMastery(amount) {
  const entry = save.mastery[save.selectedCharacter];
  if (!entry) {
    return;
  }
  entry.xp += amount;
  const needed = 80 + entry.level * 40;
  if (entry.level < 5 && entry.xp >= needed) {
    entry.level += 1;
    entry.xp = 0;
    showToast("Mastery +1");
  }
  queueSave();
}

function updateDailyProgress(type, amount) {
  const daily = save.dailyChallenge;
  if (!daily || daily.done) {
    return;
  }
  if (daily.type !== type) {
    return;
  }
  daily.progress = Math.min(daily.target, daily.progress + amount);
  if (daily.progress >= daily.target) {
    daily.done = true;
    addCredits(daily.reward, false);
    showToast(`Gunluk tamamlandi +${daily.reward}`);
  }
  queueSave();
  updateMissionPanel();
}

function updateMissionProgress() {
  const mission = state.mission;
  if (!mission || mission.completed) {
    return;
  }
  if (
    mission.waveProgress >= mission.waveTarget &&
    mission.killProgress >= mission.killTarget
  ) {
    mission.completed = true;
    addCredits(mission.reward, false);
    showToast(`Misyon tamamlandi +${mission.reward}`);
  }
  updateMissionPanel();
}

function applyDamageToEnemy(enemy, amount, pierce) {
  const armor = enemy.armor || 0;
  const effectiveArmor = armor * (1 - pierce);
  const finalDamage = amount * (1 - effectiveArmor);
  enemy.hp -= finalDamage;
}

function applyDamageToPlayer(amount) {
  if (player.invuln > 0) {
    return;
  }
  const reduction = getPlayerDamageReduction();
  const finalDamage = amount * (1 - reduction);
  player.hp -= finalDamage;
  player.invuln = 0.45;
  if (player.hp <= 0) {
    endRun("Oyun Bitti");
  }
}

function getPlayerDamageReduction() {
  let reduction = player.baseDamageReduction || 0;
  if (player.id === "ironwall" && player.hp / player.maxHp < 0.4) {
    reduction += 0.2;
  }
  if (effects.invis > 0) {
    reduction += 0.15;
  }
  return clamp(reduction, 0, 0.6);
}

function triggerAbility() {
  if (state.status !== "running" || state.paused) {
    return;
  }
  if (player.abilityCooldown > 0) {
    return;
  }
  const characterId = save.selectedCharacter;
  if (characterId === "nomad") {
    effects.invis = 4;
    showToast("Sis bombasi");
  } else if (characterId === "ironwall") {
    shieldBash();
  } else if (characterId === "pulse") {
    effects.emp = 4;
    showToast("EMP aktif");
  } else if (characterId === "specter") {
    effects.critBoost = 3;
    dashPlayer();
    showToast("Golge atlama");
  } else if (characterId === "forge") {
    effects.damageBoost = 8;
    player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.2);
    showToast("Alan tamiri");
  }
  player.abilityCooldown = player.abilityMaxCooldown;
  updateAbilityLabel();
}

function shieldBash() {
  const range = 90 * scale;
  enemies.forEach((enemy) => {
    const dist = distance(player, enemy);
    if (dist <= range) {
      enemy.stun = 1.5;
      const dir = normalize(enemy.x - player.x, enemy.y - player.y);
      enemy.x += dir.x * 40 * scale;
      enemy.y += dir.y * 40 * scale;
    }
  });
  showToast("Kalkan darbesi");
}

function dashPlayer() {
  const dashDistance = 90 * scale;
  const dir = normalize(player.lastMoveDir.x, player.lastMoveDir.y);
  player.x = clamp(
    player.x + dir.x * dashDistance,
    base.arenaPadding * scale,
    world.width - base.arenaPadding * scale
  );
  player.y = clamp(
    player.y + dir.y * dashDistance,
    base.arenaPadding * scale,
    world.height - base.arenaPadding * scale
  );
}

function createBullet(x, y, angle, stats) {
  const speed = stats.projectileSpeed;
  const spread = stats.spread;
  const bulletAngle = angle + rand(-spread, spread);
  const damageMultiplier = effects.damageBoost > 0 ? 1.25 : 1;
  const bonusCrit = effects.critBoost > 0 ? 0.25 : 0;
  const critChance =
    player.critChance + (save.modifiers.crit ? 0.08 : 0) + bonusCrit;
  const finalCritChance = clamp(critChance, 0, 0.85);
  const isCrit = Math.random() < finalCritChance;
  const baseDamage = stats.damage * player.damageMult * damageMultiplier;
  const finalDamage = isCrit ? baseDamage * player.critMult : baseDamage;
  return {
    x,
    y,
    vx: Math.cos(bulletAngle) * speed,
    vy: Math.sin(bulletAngle) * speed,
    radius: 3 * scale,
    damage: finalDamage,
    pierce: stats.pierce || 0,
    life: 1.6,
    isCrit,
    fire: save.modifiers.fire,
    poison: save.modifiers.poison,
    splash: save.modifiers.splash,
  };
}

function fireWeapon(target) {
  const stats = getWeaponStats(weaponState.id);
  if (weaponState.reloadTimer > 0) {
    return;
  }
  if (weaponState.ammo <= 0) {
    weaponState.reloadTimer = stats.reload;
    return;
  }
  if (weaponState.shotTimer > 0) {
    return;
  }
  const angle = Math.atan2(target.y - player.y, target.x - player.x);
  for (let i = 0; i < stats.pelletCount; i += 1) {
    bullets.push(createBullet(player.x, player.y, angle, stats));
  }
  weaponState.ammo -= 1;
  weaponState.shotTimer = 1 / stats.fireRate;
}

function updateWeapon(dt) {
  const stats = getWeaponStats(weaponState.id);
  weaponState.magazine = stats.magazine;
  if (weaponState.reloadTimer > 0) {
    weaponState.reloadTimer -= dt;
    if (weaponState.reloadTimer <= 0) {
      weaponState.ammo = stats.magazine;
      weaponState.reloadTimer = 0;
    }
    updateStatusBar();
    return;
  }
  weaponState.shotTimer = Math.max(0, weaponState.shotTimer - dt);
  if (weaponState.ammo <= 0) {
    weaponState.reloadTimer = stats.reload;
  }
  const target = findNearestEnemy();
  if (target) {
    fireWeapon(target);
  }
  updateStatusBar();
}

function findNearestEnemy() {
  let nearest = null;
  let minDist = Infinity;
  enemies.forEach((enemy) => {
    const dist = distance(player, enemy);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  });
  return nearest;
}

function spawnPickup(x, y, value) {
  pickups.push({
    x,
    y,
    radius: 5 * scale,
    value,
  });
}

function updatePickups() {
  for (let i = pickups.length - 1; i >= 0; i -= 1) {
    const pickup = pickups[i];
    const dist = distance(player, pickup);
    if (dist < player.radius + pickup.radius + 6) {
      addCredits(pickup.value, true);
      pickups.splice(i, 1);
    }
  }
}

function updateBullets(dt) {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    const bullet = bullets[i];
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (
      bullet.life <= 0 ||
      bullet.x < -50 ||
      bullet.x > world.width + 50 ||
      bullet.y < -50 ||
      bullet.y > world.height + 50
    ) {
      bullets.splice(i, 1);
      continue;
    }
    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      const enemy = enemies[j];
      const dist = distance(bullet, enemy);
      if (dist <= bullet.radius + enemy.radius) {
        applyDamageToEnemy(enemy, bullet.damage, bullet.pierce);
        if (bullet.fire) {
          enemy.burnTime = 2.5;
          enemy.burnDps = 8;
        }
        if (bullet.poison) {
          enemy.poisonTime = 3;
        }
        if (bullet.splash) {
          applySplashDamage(enemy, bullet.damage * 0.45, 60 * scale);
        }
        bullets.splice(i, 1);
        break;
      }
    }
  }
}

function applySplashDamage(centerEnemy, damage, radius) {
  enemies.forEach((enemy) => {
    if (enemy === centerEnemy) {
      return;
    }
    const dist = distance(centerEnemy, enemy);
    if (dist <= radius) {
      applyDamageToEnemy(enemy, damage, 0);
    }
  });
}

function updateEnemyShots(dt) {
  for (let i = enemyShots.length - 1; i >= 0; i -= 1) {
    const shot = enemyShots[i];
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    shot.life -= dt;
    if (
      shot.life <= 0 ||
      shot.x < -60 ||
      shot.x > world.width + 60 ||
      shot.y < -60 ||
      shot.y > world.height + 60
    ) {
      enemyShots.splice(i, 1);
      continue;
    }
    const dist = distance(shot, player);
    if (dist <= shot.radius + player.radius) {
      applyDamageToPlayer(shot.damage);
      if (shot.effect === "poison") {
        player.slowTimer = 2.5;
      }
      enemyShots.splice(i, 1);
    }
  }
}

function updateEnemies(dt) {
  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    const enemy = enemies[i];
    if (enemy.hp <= 0) {
      handleEnemyDeath(enemy);
      enemies.splice(i, 1);
      continue;
    }
    if (enemy.stun > 0) {
      enemy.stun = Math.max(0, enemy.stun - dt);
      continue;
    }
    if (enemy.burnTime > 0) {
      enemy.burnTime = Math.max(0, enemy.burnTime - dt);
      enemy.hp -= enemy.burnDps * dt;
    }
    const slowFactor = enemy.poisonTime > 0 ? 0.7 : 1;
    if (enemy.poisonTime > 0) {
      enemy.poisonTime = Math.max(0, enemy.poisonTime - dt);
    }
    if (enemy.behavior === "boss") {
      updateBoss(enemy, dt);
    } else if (enemy.behavior === "ranged") {
      updateRangedEnemy(enemy, dt, slowFactor);
    } else {
      updateMeleeEnemy(enemy, dt, slowFactor);
    }
  }
}

function updateMeleeEnemy(enemy, dt, slowFactor) {
  const dir = normalize(player.x - enemy.x, player.y - enemy.y);
  const speedMod = effects.invis > 0 ? 0.6 : 1;
  enemy.x += dir.x * enemy.speed * slowFactor * speedMod * dt;
  enemy.y += dir.y * enemy.speed * slowFactor * speedMod * dt;
  const dist = distance(enemy, player);
  if (dist <= enemy.radius + player.radius + 2) {
    applyDamageToPlayer(enemy.damage);
  }
}

function updateRangedEnemy(enemy, dt, slowFactor) {
  const dist = distance(enemy, player);
  const dir = normalize(player.x - enemy.x, player.y - enemy.y);
  const speedMod = effects.invis > 0 ? 0.6 : 1;
  if (dist > enemy.range * 1.05) {
    enemy.x += dir.x * enemy.speed * slowFactor * speedMod * dt;
    enemy.y += dir.y * enemy.speed * slowFactor * speedMod * dt;
  } else if (dist < enemy.range * 0.75) {
    enemy.x -= dir.x * enemy.speed * slowFactor * speedMod * dt;
    enemy.y -= dir.y * enemy.speed * slowFactor * speedMod * dt;
  }
  if (effects.emp > 0 && enemy.robot) {
    return;
  }
  enemy.attackTimer -= dt;
  if (enemy.attackTimer <= 0 && dist <= enemy.range * 1.2) {
    const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
    enemyShots.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * enemy.projectileSpeed,
      vy: Math.sin(angle) * enemy.projectileSpeed,
      radius: 4 * scale,
      damage: enemy.damage,
      life: 3,
      color: enemy.color,
      effect: enemy.effect,
    });
    enemy.attackTimer = 1 / enemy.shotRate + rand(0.1, 0.35);
  }
}

function updateBoss(enemy, dt) {
  const hpRatio = enemy.hp / enemy.maxHp;
  if (hpRatio < 0.3) {
    enemy.phase = 3;
  } else if (hpRatio < 0.6) {
    enemy.phase = 2;
  } else {
    enemy.phase = 1;
  }
  const dir = normalize(player.x - enemy.x, player.y - enemy.y);
  const speedMod = effects.invis > 0 ? 0.7 : 1;
  enemy.x += dir.x * enemy.speed * speedMod * dt;
  enemy.y += dir.y * enemy.speed * speedMod * dt;
  const dist = distance(enemy, player);
  if (dist <= enemy.radius + player.radius + 8) {
    applyDamageToPlayer(enemy.damage);
  }
  enemy.attackTimer -= dt;
  if (enemy.attackTimer <= 0) {
    if (enemy.phase >= 2) {
      spawnBossShockwave(enemy);
    }
    if (enemy.phase === 3) {
      for (let i = 0; i < 3; i += 1) {
        spawnEnemyFromPool();
      }
    }
    enemy.attackTimer = 3.6 - enemy.phase * 0.5;
  }
}

function spawnBossShockwave(enemy) {
  const count = 8;
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    enemyShots.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * 220,
      vy: Math.sin(angle) * 220,
      radius: 5 * scale,
      damage: enemy.damage * 0.7,
      life: 2.5,
      color: "#e06a6a",
      effect: null,
    });
  }
}

function handleEnemyDeath(enemy) {
  state.kills += 1;
  gainXp(enemy.xp);
  gainMastery(enemy.xp);
  spawnPickup(enemy.x, enemy.y, enemy.reward);
  state.mission.killProgress += 1;
  updateDailyProgress("kills", 1);
  updateMissionProgress();
}

function updateMovement(dt) {
  let moveX = 0;
  let moveY = 0;
  if (keys.KeyW || keys.ArrowUp) moveY -= 1;
  if (keys.KeyS || keys.ArrowDown) moveY += 1;
  if (keys.KeyA || keys.ArrowLeft) moveX -= 1;
  if (keys.KeyD || keys.ArrowRight) moveX += 1;

  if (input.active) {
    const dx = input.current.x - input.origin.x;
    const dy = input.current.y - input.origin.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len > 10) {
      moveX = dx / len;
      moveY = dy / len;
    }
  }

  const move = normalize(moveX, moveY);
  if (move.x !== 0 || move.y !== 0) {
    player.lastMoveDir = { x: move.x, y: move.y };
  }
  let speed = player.baseSpeed;
  if (player.slowTimer > 0) {
    speed *= 0.7;
  }
  if (effects.invis > 0) {
    speed *= 1.1;
  }
  player.x += move.x * speed * dt;
  player.y += move.y * speed * dt;
  const pad = base.arenaPadding * scale;
  player.x = clamp(player.x, pad, world.width - pad);
  player.y = clamp(player.y, pad, world.height - pad);
}

function updateEffects(dt) {
  Object.keys(effects).forEach((key) => {
    effects[key] = Math.max(0, effects[key] - dt);
  });
  if (player.abilityCooldown > 0) {
    player.abilityCooldown = Math.max(0, player.abilityCooldown - dt);
  }
  if (player.invuln > 0) {
    player.invuln = Math.max(0, player.invuln - dt);
  }
  if (player.slowTimer > 0) {
    player.slowTimer = Math.max(0, player.slowTimer - dt);
  }
}

function updateWave(dt) {
  if (enemies.length > 0) {
    return;
  }
  if (!state.waveCleared) {
    state.waveCleared = true;
    state.mission.waveProgress += 1;
    updateDailyProgress("waves", 1);
    updateMissionProgress();
    addCredits(20 + state.wave * 5, false);
    const waveTime = state.time - state.waveStart;
    if (waveTime < difficulty.targetWaveTime - 6) {
      difficulty.factor = Math.min(1.3, difficulty.factor + 0.05);
    } else if (waveTime > difficulty.targetWaveTime + 6) {
      difficulty.factor = Math.max(0.85, difficulty.factor - 0.05);
    }
    state.waveDelay = 2.2;
    showToast("Dalga temizlendi");
  } else {
    state.waveDelay -= dt;
    if (state.waveDelay <= 0) {
      state.wave += 1;
      spawnWave();
      updateStatusBar();
    }
  }
}

function update(dt) {
  if (state.status !== "running" || state.paused) {
    return;
  }
  state.time += dt;
  if (state.toast.timer > 0) {
    state.toast.timer = Math.max(0, state.toast.timer - dt);
  }
  updateEffects(dt);
  updateMovement(dt);
  updateWeapon(dt);
  updateBullets(dt);
  updateEnemyShots(dt);
  updateEnemies(dt);
  updatePickups();
  updateWave(dt);

  state.saveTimer += dt;
  if (state.saveTimer >= 2) {
    state.saveTimer = 0;
    flushSave();
  }

  updateStatusBar();
  updateAbilityLabel();
}

function drawGround() {
  ctx.fillStyle = "#0e111b";
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  const spacing = 32 * scale;
  for (let x = -world.height; x < world.width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + world.height, world.height);
    ctx.stroke();
  }
  for (let x = 0; x < world.width + world.height; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - world.height, world.height);
    ctx.stroke();
  }
  const pad = base.arenaPadding * scale;
  ctx.strokeStyle = "#24304a";
  ctx.lineWidth = 2;
  ctx.strokeRect(pad, pad, world.width - pad * 2, world.height - pad * 2);
}

function drawPlayer() {
  if (!player || !player.maxHp) {
    return;
  }
  ctx.save();
  if (effects.invis > 0) {
    ctx.globalAlpha = 0.6;
  }
  ctx.fillStyle = "#51d1f6";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const barWidth = 46 * scale;
  const barHeight = 6 * scale;
  const hpRatio = clamp(player.hp / player.maxHp, 0, 1);
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(
    player.x - barWidth / 2,
    player.y - player.radius - 16 * scale,
    barWidth,
    barHeight
  );
  ctx.fillStyle = "#4ddf7a";
  ctx.fillRect(
    player.x - barWidth / 2,
    player.y - player.radius - 16 * scale,
    barWidth * hpRatio,
    barHeight
  );

  if (player.abilityCooldown > 0) {
    const cooldownRatio =
      player.abilityCooldown / player.abilityMaxCooldown;
    ctx.strokeStyle = "rgba(255,214,102,0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      player.x,
      player.y,
      player.radius + 8 * scale,
      -Math.PI / 2,
      -Math.PI / 2 + Math.PI * 2 * (1 - cooldownRatio)
    );
    ctx.stroke();
  }
}

function drawEnemies() {
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    const barWidth = enemy.radius * 2;
    const barHeight = 4 * scale;
    const hpRatio = clamp(enemy.hp / enemy.maxHp, 0, 1);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(
      enemy.x - barWidth / 2,
      enemy.y - enemy.radius - 10 * scale,
      barWidth,
      barHeight
    );
    ctx.fillStyle = "#ff8c8c";
    ctx.fillRect(
      enemy.x - barWidth / 2,
      enemy.y - enemy.radius - 10 * scale,
      barWidth * hpRatio,
      barHeight
    );
  });
}

function drawBullets() {
  bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.isCrit ? "#ffd166" : "#ffffff";
    ctx.beginPath();
    ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
    ctx.fill();
  });
  enemyShots.forEach((shot) => {
    ctx.fillStyle = shot.color || "#ff8f8f";
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, shot.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPickups() {
  ctx.fillStyle = "#ffd166";
  pickups.forEach((pickup) => {
    ctx.beginPath();
    ctx.arc(pickup.x, pickup.y, pickup.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawJoystick() {
  if (!input.active) {
    return;
  }
  const dx = input.current.x - input.origin.x;
  const dy = input.current.y - input.origin.y;
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = "#6c7aa5";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(input.origin.x, input.origin.y, 34 * scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    input.origin.x + dx,
    input.origin.y + dy,
    14 * scale,
    0,
    Math.PI * 2
  );
  ctx.stroke();
  ctx.restore();
}

function drawToast() {
  if (state.toast.timer <= 0) {
    return;
  }
  ctx.save();
  ctx.globalAlpha = clamp(state.toast.timer / 2.2, 0, 1);
  ctx.fillStyle = "rgba(10,12,18,0.8)";
  ctx.fillRect(world.width / 2 - 120, 16, 240, 32);
  ctx.fillStyle = "#f2f2f2";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(state.toast.text, world.width / 2, 38);
  ctx.restore();
}

function drawPause() {
  if (!state.paused) {
    return;
  }
  ctx.fillStyle = "rgba(10,12,18,0.6)";
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
  drawGround();
  drawPickups();
  drawEnemies();
  drawBullets();
  drawPlayer();
  drawJoystick();
  drawToast();
  drawPause();
}

function loop(timestamp) {
  const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;
  update(delta);
  render();
  requestAnimationFrame(loop);
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = rect.width || base.width;
  const displayHeight = rect.height || displayWidth * (base.height / base.width);

  const prevWidth = world.width;
  const prevHeight = world.height;
  const prevScale = scale;

  canvas.width = Math.round(displayWidth * dpr);
  canvas.height = Math.round(displayHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  world.width = displayWidth;
  world.height = displayHeight;
  scale = displayWidth / base.width;

  if (prevWidth) {
    const ratioX = displayWidth / prevWidth;
    const ratioY = displayHeight / prevHeight;
    const scaleRatio = scale / prevScale;
    if (player && player.x) {
      player.x *= ratioX;
      player.y *= ratioY;
      player.radius *= scaleRatio;
    }
    enemies.forEach((enemy) => {
      enemy.x *= ratioX;
      enemy.y *= ratioY;
      enemy.radius *= scaleRatio;
    });
    bullets.forEach((bullet) => {
      bullet.x *= ratioX;
      bullet.y *= ratioY;
      bullet.radius *= scaleRatio;
    });
    enemyShots.forEach((shot) => {
      shot.x *= ratioX;
      shot.y *= ratioY;
      shot.radius *= scaleRatio;
    });
    pickups.forEach((pickup) => {
      pickup.x *= ratioX;
      pickup.y *= ratioY;
      pickup.radius *= scaleRatio;
    });
  }
}

function bindEvents() {
  ui.start.addEventListener("click", () => {
    startGame();
  });
  ui.restart.addEventListener("click", () => {
    startGame();
  });
  ui.pause.addEventListener("click", () => {
    togglePause();
  });
  ui.ability.addEventListener("click", () => {
    triggerAbility();
  });
  ui.reset.addEventListener("click", () => {
    endRun("Kosu Sifirlandi");
  });
  ui.characterSelect.addEventListener("change", () => {
    save.selectedCharacter = ui.characterSelect.value;
    queueSave();
    updateCharacterPanel();
    updateWeaponPanel();
    updateStartState();
  });
  ui.weaponSelect.addEventListener("change", () => {
    save.selectedWeapon = ui.weaponSelect.value;
    queueSave();
    updateWeaponPanel();
    updateStartState();
  });
  ui.unlockCharacter.addEventListener("click", () => {
    const id = ui.characterSelect.value;
    const character = getCharacterById(id);
    const cost = character.cost || getUnlockCostRarity(character.rarity);
    if (save.credits >= cost) {
      save.credits -= cost;
      save.unlockedCharacters[id] = true;
      queueSave();
      populateSelects();
      updateAllUI();
    }
  });
  ui.unlockWeapon.addEventListener("click", () => {
    const id = ui.weaponSelect.value;
    const weapon = getWeaponById(id);
    const cost = weapon.cost || getUnlockCostRarity(weapon.rarity);
    if (save.credits >= cost) {
      save.credits -= cost;
      save.unlockedWeapons[id] = true;
      queueSave();
      populateSelects();
      updateAllUI();
    }
  });
  ui.upgradeWeapon.addEventListener("click", () => {
    const id = ui.weaponSelect.value;
    const cost = getWeaponUpgradeCost(id);
    if (save.credits >= cost) {
      save.credits -= cost;
      save.weaponLevels[id] += 1;
      queueSave();
      updateAllUI();
    }
  });
  ui.modButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const modId = button.dataset.mod;
      const mod = modifiers[modId];
      if (save.credits >= mod.cost && !save.modifiers[modId]) {
        save.credits -= mod.cost;
        save.modifiers[modId] = true;
        queueSave();
        updateAllUI();
      }
    });
  });
  ui.skillButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const skill = button.dataset.skill;
      if (save.skillPoints > 0) {
        save.skills[skill] += 1;
        save.skillPoints -= 1;
        queueSave();
        updateAllUI();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    keys[event.code] = true;
    if (event.code === "Space") {
      event.preventDefault();
      triggerAbility();
    }
    if (event.code === "KeyP") {
      togglePause();
    }
    if (event.code === "KeyR") {
      endRun("Kosu Sifirlandi");
    }
    if (event.code === "Enter" && state.status !== "running") {
      startGame();
    }
  });
  document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    if (x < world.width * 0.45 && !input.active) {
      input.pointerId = event.pointerId;
      input.active = true;
      input.origin = { x, y };
      input.current = { x, y };
    } else {
      triggerAbility();
    }
  });
  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerId !== input.pointerId) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    input.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  });
  canvas.addEventListener("pointerup", (event) => {
    if (event.pointerId === input.pointerId) {
      input.active = false;
      input.pointerId = null;
    }
  });
  canvas.addEventListener("pointercancel", (event) => {
    if (event.pointerId === input.pointerId) {
      input.active = false;
      input.pointerId = null;
    }
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
  });
}

function populateSelects() {
  ui.characterSelect.innerHTML = "";
  characters.forEach((character) => {
    const option = document.createElement("option");
    option.value = character.id;
    const locked = !save.unlockedCharacters[character.id];
    option.textContent = `${character.name} (${character.rarity})${
      locked ? " - Kilitli" : ""
    }`;
    ui.characterSelect.appendChild(option);
  });
  ui.characterSelect.value = save.selectedCharacter;

  ui.weaponSelect.innerHTML = "";
  weapons.forEach((weapon) => {
    const option = document.createElement("option");
    option.value = weapon.id;
    const locked = !save.unlockedWeapons[weapon.id];
    option.textContent = `${weapon.name} (${weapon.rarity})${
      locked ? " - Kilitli" : ""
    }`;
    ui.weaponSelect.appendChild(option);
  });
  ui.weaponSelect.value = save.selectedWeapon;
}

function init() {
  populateSelects();
  bindEvents();
  resizeCanvas();
  updateAllUI();
  showOverlay("Baslatmak icin butona bas", "Karakter ve silah secimi yap");
  requestAnimationFrame(loop);
}

init();
