const screens = Array.from(document.querySelectorAll(".screen"));
const navButtons = Array.from(document.querySelectorAll("[data-nav]"));
const toast = document.getElementById("toast");
const connectionStatus = document.getElementById("connectionStatus");

const playerCountInput = document.getElementById("playerCount");
const playerCountValue = document.getElementById("playerCountValue");
const categoryStrip = document.getElementById("categoryStrip");
const categoryCards = Array.from(document.querySelectorAll(".category-card"));
const roundTimeChips = Array.from(document.querySelectorAll("#roundTimeChips .chip"));
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCodeInput = document.getElementById("roomCode");
const revealWordBtn = document.getElementById("revealWordBtn");
const readyBtn = document.getElementById("readyBtn");
const secretWordEl = document.getElementById("secretWord");
const clueProgress = document.getElementById("clueProgress");
const clueTimer = document.getElementById("clueTimer");
const clueInput = document.getElementById("clueInput");
const clueList = document.getElementById("clueList");
const emojiBar = document.getElementById("emojiBar");
const sendClueBtn = document.getElementById("sendClueBtn");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatList = document.getElementById("chatList");
const voteGrid = document.getElementById("voteGrid");
const voteStatus = document.getElementById("voteStatus");
const showResultBtn = document.getElementById("showResultBtn");
const resultWordEl = document.getElementById("resultWord");
const resultImpostorWordEl = document.getElementById("resultImpostorWord");

const STORAGE_KEY = "impostor-state-v1";
let connectionInitialized = false;

const wordPairs = {
  sehirler: ["Istanbul", "Izmir"],
  film: ["Marvel", "DC"],
  spor: ["Futbol", "Basketbol"],
  yemek: ["Pizza", "Lahmacun"],
  marka: ["Nike", "Adidas"],
};

const state = {
  screen: "home",
  playerCount: 7,
  category: "sehirler",
  roundTime: 60,
  roomCode: "",
  secretWord: "",
  impostorWord: "",
  wordCategory: "",
  wordShown: false,
  voteLocked: false,
  clueStart: null,
};

let clueTimerHandle = null;
let activeScreen = "home";

function pulse() {
  if (navigator.vibrate) {
    navigator.vibrate(12);
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function updateScreenVisibility(target) {
  screens.forEach((screen) => {
    const isActive = screen.dataset.screen === target;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
}

function updateInputsFromState() {
  playerCountInput.value = state.playerCount;
  playerCountValue.textContent = state.playerCount;
  roomCodeInput.value = state.roomCode;
  categoryCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.category === state.category);
  });
  roundTimeChips.forEach((chip) => {
    chip.classList.toggle("is-active", Number(chip.dataset.time) === state.roundTime);
  });
  resultWordEl.textContent = state.secretWord || resultWordEl.textContent;
  resultImpostorWordEl.textContent =
    state.impostorWord || resultImpostorWordEl.textContent;
  clueTimer.textContent = state.roundTime.toString();
  clueProgress.style.width = "0%";
}

function showScreen(target) {
  if (activeScreen === target) return;
  activeScreen = target;
  state.screen = target;
  updateScreenVisibility(target);
  onScreenChange(target);
  saveState();
}

function setWordPair(force = false) {
  const shouldReplace =
    force || !state.secretWord || state.wordCategory !== state.category;
  if (shouldReplace) {
    const pair = wordPairs[state.category] || ["Plaj", "Sahil"];
    const [mainWord, impostorWord] = pair;
    state.secretWord = mainWord;
    state.impostorWord = impostorWord;
    state.wordCategory = state.category;
    state.wordShown = false;
  }
  resultWordEl.textContent = state.secretWord;
  resultImpostorWordEl.textContent = state.impostorWord;
  secretWordEl.textContent = "••••";
  revealWordBtn.disabled = state.wordShown;
  readyBtn.disabled = !state.wordShown;
}

function getClueDuration() {
  return state.roundTime * 1000;
}

function startClueTimer() {
  const duration = getClueDuration();
  if (!state.clueStart || Date.now() - state.clueStart > duration) {
    state.clueStart = Date.now();
  }
  updateClueTimer();
  clueTimerHandle = window.setInterval(updateClueTimer, 200);
  saveState();
}

function stopClueTimer() {
  if (clueTimerHandle) {
    window.clearInterval(clueTimerHandle);
    clueTimerHandle = null;
  }
}

function updateClueTimer() {
  const duration = getClueDuration();
  const elapsed = Date.now() - state.clueStart;
  const remaining = Math.max(0, duration - elapsed);
  const seconds = Math.ceil(remaining / 1000);
  clueTimer.textContent = seconds.toString();
  const progress = Math.min(100, (elapsed / duration) * 100);
  clueProgress.style.width = `${progress}%`;
  if (remaining <= 0) {
    stopClueTimer();
    showToast("Sure bitti, tartismaya geciliyor.");
    showScreen("chat");
  }
}

function onScreenChange(target) {
  if (target === "clue") {
    stopClueTimer();
    startClueTimer();
  } else {
    stopClueTimer();
    state.clueStart = null;
  }

  if (target === "secret") {
    setWordPair();
  }

  if (target === "vote") {
    state.voteLocked = false;
    voteStatus.textContent =
      "Tek dokunusla oy ver. Oy verdikten sonra kilitlenir.";
    voteGrid
      .querySelectorAll(".vote-card")
      .forEach((card) => {
        card.classList.remove("selected");
        card.disabled = false;
      });
    showResultBtn.disabled = true;
  }

  if (target === "chat") {
    window.requestAnimationFrame(() => {
      chatList.scrollTop = chatList.scrollHeight;
      chatInput.focus();
    });
  }

  if (target === "join") {
    window.requestAnimationFrame(() => {
      roomCodeInput.focus();
    });
  }

  if (target === "clue") {
    window.requestAnimationFrame(() => {
      clueInput.focus();
    });
  }
}

function sanitizeRoomCode(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.haptic !== undefined) {
      pulse();
    }
    showScreen(btn.dataset.nav);
  });
});

playerCountInput.addEventListener("input", (event) => {
  state.playerCount = Number(event.target.value);
  playerCountValue.textContent = state.playerCount;
  saveState();
});

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    state.category = card.dataset.category;
    categoryCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    setWordPair();
    saveState();
  });
});

let swipeStartX = 0;
let swipeActive = false;
categoryStrip.addEventListener("pointerdown", (event) => {
  swipeStartX = event.clientX;
  swipeActive = true;
});

categoryStrip.addEventListener("pointerup", (event) => {
  if (!swipeActive) return;
  const delta = event.clientX - swipeStartX;
  swipeActive = false;
  if (Math.abs(delta) < 40) return;
  const currentIndex = categoryCards.findIndex(
    (card) => card.dataset.category === state.category
  );
  const direction = delta < 0 ? 1 : -1;
  const nextIndex = Math.min(
    categoryCards.length - 1,
    Math.max(0, currentIndex + direction)
  );
  const nextCard = categoryCards[nextIndex];
  if (nextCard) {
    nextCard.click();
    nextCard.scrollIntoView({ behavior: "smooth", inline: "center" });
  }
});

categoryStrip.addEventListener("pointercancel", () => {
  swipeActive = false;
});

roundTimeChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    roundTimeChips.forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
    state.roundTime = Number(chip.dataset.time);
    if (activeScreen !== "clue") {
      clueTimer.textContent = state.roundTime.toString();
      clueProgress.style.width = "0%";
    }
    saveState();
  });
});

createRoomBtn.addEventListener("click", () => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  state.roomCode = code;
  state.secretWord = "";
  state.impostorWord = "";
  state.wordCategory = state.category;
  state.wordShown = false;
  roomCodeInput.value = code;
  saveState();
  showToast(`Oda kodu hazir: ${code}`);
});

roomCodeInput.addEventListener("input", (event) => {
  const clean = sanitizeRoomCode(event.target.value);
  event.target.value = clean;
  state.roomCode = clean;
  saveState();
});

joinRoomBtn.addEventListener("click", () => {
  pulse();
  if (roomCodeInput.value.length < 4) {
    showToast("Lutfen 4-6 haneli kod gir.");
    return;
  }
  state.roomCode = roomCodeInput.value;
  saveState();
  showScreen("secret");
});

revealWordBtn.addEventListener("click", () => {
  pulse();
  if (state.wordShown) return;
  state.wordShown = true;
  secretWordEl.textContent = state.secretWord;
  revealWordBtn.disabled = true;
  readyBtn.disabled = false;
  saveState();
  window.setTimeout(() => {
    secretWordEl.textContent = "••••";
  }, 2500);
});

readyBtn.addEventListener("click", () => {
  pulse();
  showScreen("clue");
});

emojiBar.addEventListener("click", (event) => {
  const emoji = event.target.dataset.emoji;
  if (!emoji) return;
  clueInput.value += emoji;
  clueInput.focus();
});

sendClueBtn.addEventListener("click", () => {
  pulse();
  const value = clueInput.value.trim();
  if (!value) return;
  const card = document.createElement("div");
  card.className = "clue-card";
  card.textContent = `"${value}"`;
  clueList.prepend(card);
  clueInput.value = "";
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  pulse();
  const value = chatInput.value.trim();
  if (!value) return;
  const message = document.createElement("div");
  message.className = "message right";
  message.innerHTML = `<p class="meta">Sen</p><p>${value}</p>`;
  chatList.appendChild(message);
  chatInput.value = "";
  chatList.scrollTop = chatList.scrollHeight;
});

voteGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".vote-card");
  if (!card || state.voteLocked) return;
  pulse();
  state.voteLocked = true;
  voteGrid.querySelectorAll(".vote-card").forEach((item) => {
    item.disabled = true;
    item.classList.remove("selected");
  });
  card.classList.add("selected");
  voteStatus.textContent = `Oyun kilitlendi. Oyuncu: ${card.dataset.player}`;
  showResultBtn.disabled = false;
});

function updateConnection() {
  const online = navigator.onLine;
  connectionStatus.textContent = online ? "Online" : "Baglanti Zayif";
  connectionStatus.classList.toggle("offline", !online);
  if (connectionInitialized) {
    if (!online) {
      showToast("Baglanti kesildi, yeniden baglaniyor...");
    } else {
      showToast("Baglanti geri geldi.");
    }
  }
  connectionInitialized = true;
}

window.addEventListener("online", updateConnection);
window.addEventListener("offline", updateConnection);

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

loadState();
if (!screens.find((screen) => screen.dataset.screen === state.screen)) {
  state.screen = "home";
}
updateInputsFromState();
updateScreenVisibility(state.screen);
activeScreen = state.screen;
onScreenChange(state.screen);
updateConnection();
registerServiceWorker();
