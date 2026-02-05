const screens = Array.from(document.querySelectorAll(".screen"));
const navButtons = Array.from(document.querySelectorAll("[data-nav]"));
const toast = document.getElementById("toast");
const connectionStatus = document.getElementById("connectionStatus");

const playerNameCreate = document.getElementById("playerNameCreate");
const playerNameJoin = document.getElementById("playerNameJoin");
const playerCountInput = document.getElementById("playerCount");
const playerCountValue = document.getElementById("playerCountValue");
const categoryStrip = document.getElementById("categoryStrip");
const categoryCards = Array.from(document.querySelectorAll(".category-card"));
const roundTimeChips = Array.from(document.querySelectorAll("#roundTimeChips .chip"));
const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const startGameBtn = document.getElementById("startGameBtn");
const roomCodeInput = document.getElementById("roomCode");
const roomInfo = document.getElementById("roomInfo");
const playerList = document.getElementById("playerList");

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
const startVoteBtn = document.getElementById("startVoteBtn");

const voteGrid = document.getElementById("voteGrid");
const voteStatus = document.getElementById("voteStatus");
const showResultBtn = document.getElementById("showResultBtn");
const resultWordEl = document.getElementById("resultWord");
const resultImpostorWordEl = document.getElementById("resultImpostorWord");

const SETTINGS_KEY = "impostor-settings-v2";
const CLIENT_KEY = "impostor-client-v2";

const settings = {
  playerCount: 7,
  category: "sehirler",
  roundTime: 60,
};

const client = {
  socket: null,
  room: null,
  roomCode: "",
  playerId: "",
  isHost: false,
  playerName: "",
  phase: "home",
  clue: {
    startedAt: null,
    duration: null,
  },
};

let activeScreen = "";
let clueTimerHandle = null;
let reconnectHandle = null;

const phaseToScreen = {
  lobby: "join",
  secret: "secret",
  clue: "clue",
  chat: "chat",
  vote: "vote",
  result: "result",
};

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

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.assign(settings, saved);
  } catch (error) {
    localStorage.removeItem(SETTINGS_KEY);
  }
}

function saveClient() {
  const payload = {
    roomCode: client.roomCode,
    playerId: client.playerId,
    playerName: client.playerName,
  };
  localStorage.setItem(CLIENT_KEY, JSON.stringify(payload));
}

function loadClient() {
  const raw = localStorage.getItem(CLIENT_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    client.roomCode = saved.roomCode || "";
    client.playerId = saved.playerId || "";
    client.playerName = saved.playerName || "";
  } catch (error) {
    localStorage.removeItem(CLIENT_KEY);
  }
}

function clearClient() {
  localStorage.removeItem(CLIENT_KEY);
  client.room = null;
  client.roomCode = "";
  client.playerId = "";
  client.isHost = false;
  client.playerName = "";
  client.phase = "home";
  client.clue.startedAt = null;
  client.clue.duration = null;
  roomCodeInput.readOnly = false;
  roomCodeInput.value = "";
  roomInfo.textContent = "0/0 oyuncu baglandi";
}

function showScreen(target) {
  if (activeScreen === target) return;
  activeScreen = target;
  screens.forEach((screen) => {
    const isActive = screen.dataset.screen === target;
    screen.classList.toggle("is-active", isActive);
    screen.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
}

function updateInputs(options = {}) {
  playerCountInput.value = settings.playerCount;
  playerCountValue.textContent = settings.playerCount;
  roomCodeInput.value = client.roomCode;
  playerNameCreate.value = client.playerName;
  playerNameJoin.value = client.playerName;
  categoryCards.forEach((card) => {
    card.classList.toggle("is-active", card.dataset.category === settings.category);
  });
  roundTimeChips.forEach((chip) => {
    chip.classList.toggle("is-active", Number(chip.dataset.time) === settings.roundTime);
  });
  if (!options.keepClueTimer) {
    clueTimer.textContent = settings.roundTime.toString();
    clueProgress.style.width = "0%";
  }
}

function sanitizeRoomCode(value) {
  return value.replace(/\D/g, "").slice(0, 6);
}

function sanitizeName(value) {
  return value.replace(/[<>]/g, "").trim().slice(0, 16);
}

function buildAvatar(name) {
  return name ? name.trim().charAt(0).toUpperCase() : "?";
}

function renderPlayers(room) {
  playerList.innerHTML = "";
  room.players.forEach((player) => {
    const card = document.createElement("div");
    card.className = "player-card";
    const statusText = player.isHost ? "Host" : player.connected ? "Baglandi" : "Ayrildi";
    const badgeText = player.ready ? "Hazir" : "Bekliyor";
    const badgeClass = player.ready ? "badge" : "badge waiting";
    card.innerHTML = `
      <div class="avatar">${buildAvatar(player.name)}</div>
      <div class="player-info">
        <p class="player-name">${player.name}</p>
        <p class="player-status">${statusText}</p>
      </div>
      <span class="${badgeClass}">${badgeText}</span>
    `;
    playerList.appendChild(card);
  });
}

function renderVoteGrid(room) {
  voteGrid.innerHTML = "";
  room.players.forEach((player) => {
    const card = document.createElement("button");
    card.className = "vote-card";
    card.type = "button";
    card.dataset.playerId = player.id;
    card.dataset.playerName = player.name;
    card.innerHTML = `
      <span class="avatar">${buildAvatar(player.name)}</span>
      <span class="vote-name">${player.name}</span>
    `;
    voteGrid.appendChild(card);
  });
}

function renderClues(clues) {
  clueList.innerHTML = "";
  clues.forEach((clue) => {
    const card = document.createElement("div");
    card.className = "clue-card";
    card.textContent = `"${clue.text}" - ${clue.by}`;
    clueList.appendChild(card);
  });
}

function renderChat(chat) {
  chatList.innerHTML = "";
  chat.forEach((message) => {
    const bubble = document.createElement("div");
    bubble.className =
      message.playerId === client.playerId ? "message right" : "message left";
    bubble.innerHTML = `<p class="meta">${message.by}</p><p>${message.text}</p>`;
    chatList.appendChild(bubble);
  });
  chatList.scrollTop = chatList.scrollHeight;
}

function updateRoomInfo(room) {
  const current = room.players.length;
  const total = room.settings.playerCount;
  roomInfo.textContent = `${current}/${total} oyuncu baglandi`;
}

function updateHostControls(room) {
  const hasRoom = Boolean(room);
  const showStart = hasRoom && client.isHost && room.state === "lobby";
  const canStart =
    hasRoom &&
    client.isHost &&
    room.state === "lobby" &&
    room.players.length >= room.settings.playerCount;
  startGameBtn.disabled = !canStart;
  startGameBtn.style.display = showStart ? "block" : "none";
  startVoteBtn.disabled = !client.isHost || room.state !== "chat";
  showResultBtn.disabled = !client.isHost || room.state !== "vote";
}

function stopClueTimer() {
  if (clueTimerHandle) {
    window.clearInterval(clueTimerHandle);
    clueTimerHandle = null;
  }
}

function startClueTimer(startedAt, duration) {
  client.clue.startedAt = startedAt;
  client.clue.duration = duration;
  stopClueTimer();
  clueTimerHandle = window.setInterval(updateClueTimer, 200);
  updateClueTimer();
}

function updateClueTimer() {
  if (!client.clue.startedAt || !client.clue.duration) return;
  const elapsed = Date.now() - client.clue.startedAt;
  const remaining = Math.max(0, client.clue.duration - elapsed);
  clueTimer.textContent = Math.ceil(remaining / 1000).toString();
  const progress = Math.min(100, (elapsed / client.clue.duration) * 100);
  clueProgress.style.width = `${progress}%`;
}

function resetVoteUI() {
  voteStatus.textContent =
    "Tek dokunusla oy ver. Oy verdikten sonra kilitlenir.";
  voteGrid.querySelectorAll(".vote-card").forEach((card) => {
    card.classList.remove("selected");
    card.disabled = false;
  });
}

function resetSecretUI() {
  secretWordEl.textContent = "••••";
  revealWordBtn.disabled = false;
  readyBtn.disabled = true;
}

function setPhase(phase) {
  const screen = phaseToScreen[phase] || "home";
  client.phase = phase;
  showScreen(screen);

  if (phase === "secret") {
    resetSecretUI();
  }

  if (phase !== "clue") {
    stopClueTimer();
  }

  if (phase === "clue") {
    clueInput.value = "";
    clueList.innerHTML = "";
    window.requestAnimationFrame(() => {
      clueInput.focus();
    });
  }

  if (phase === "chat") {
    window.requestAnimationFrame(() => {
      chatList.scrollTop = chatList.scrollHeight;
      chatInput.focus();
    });
  }

  if (phase === "lobby") {
    window.requestAnimationFrame(() => {
      roomCodeInput.focus();
    });
  }

  if (phase === "vote") {
    resetVoteUI();
  }
}

function applyRoom(room) {
  client.room = room;
  client.roomCode = room.code;
  client.isHost = room.hostId === client.playerId;
  settings.playerCount = room.settings.playerCount;
  settings.category = room.settings.category;
  settings.roundTime = room.settings.roundTime;
  updateInputs({ keepClueTimer: room.state === "clue" });
  roomCodeInput.value = room.code;
  roomCodeInput.readOnly = client.isHost;
  updateRoomInfo(room);
  renderPlayers(room);
  renderVoteGrid(room);
  if (room.clues && room.state === "clue") {
    renderClues(room.clues);
  }
  if (room.chat && (room.state === "chat" || room.state === "vote" || room.state === "result")) {
    renderChat(room.chat);
  }
  if (room.state === "result" && room.result) {
    resultWordEl.textContent = room.result.secretWord;
    resultImpostorWordEl.textContent = room.result.impostorWord;
    const title = document.querySelector(".result-hero h3");
    const line = document.querySelector(".result-line");
    if (title) {
      title.textContent = `Kazanan: ${room.result.winner}`;
    }
    if (line) {
      line.textContent = `Impostor: ${room.result.impostorName}`;
    }
  }
  updateHostControls(room);
  if (room.state && client.phase !== room.state) {
    setPhase(room.state);
  }
}

function handleMessage(payload) {
  switch (payload.type) {
    case "room_created":
    case "room_joined":
    case "reconnected": {
      client.playerId = payload.playerId;
      client.roomCode = payload.roomCode;
      client.isHost = payload.isHost;
      saveClient();
      applyRoom(payload.room);
      setPhase(payload.room.state || "lobby");
      break;
    }
    case "room_updated": {
      applyRoom(payload.room);
      break;
    }
    case "game_started": {
      showToast("Kelime dagitiliyor.");
      setPhase("secret");
      break;
    }
    case "secret_word": {
      secretWordEl.textContent = payload.word;
      revealWordBtn.disabled = true;
      readyBtn.disabled = false;
      window.setTimeout(() => {
        secretWordEl.textContent = "••••";
      }, 2500);
      break;
    }
    case "clue_started": {
      startClueTimer(payload.startedAt, payload.duration);
      setPhase("clue");
      break;
    }
    case "clue_added": {
      const card = document.createElement("div");
      card.className = "clue-card";
      card.textContent = `"${payload.text}" - ${payload.by}`;
      clueList.prepend(card);
      break;
    }
    case "chat_message": {
      const message = document.createElement("div");
      message.className =
        payload.playerId === client.playerId ? "message right" : "message left";
      message.innerHTML = `<p class="meta">${payload.by}</p><p>${payload.text}</p>`;
      chatList.appendChild(message);
      chatList.scrollTop = chatList.scrollHeight;
      break;
    }
    case "phase_changed": {
      setPhase(payload.phase);
      break;
    }
    case "vote_locked": {
      voteStatus.textContent = "Oyun kilitlendi. Oy kaydedildi.";
      voteGrid.querySelectorAll(".vote-card").forEach((card) => {
        card.disabled = true;
      });
      break;
    }
    case "results": {
      resultWordEl.textContent = payload.secretWord;
      resultImpostorWordEl.textContent = payload.impostorWord;
      const title = document.querySelector(".result-hero h3");
      const line = document.querySelector(".result-line");
      if (title) {
        title.textContent = `Kazanan: ${payload.winner}`;
      }
      if (line) {
        line.textContent = `Impostor: ${payload.impostorName}`;
      }
      setPhase("result");
      break;
    }
    case "error": {
      showToast(payload.message);
      break;
    }
    default:
      break;
  }
}

function sendMessage(payload) {
  if (!client.socket || client.socket.readyState !== WebSocket.OPEN) {
    showToast("Baglanti yok, tekrar dene.");
    return false;
  }
  client.socket.send(JSON.stringify(payload));
  return true;
}

function connectSocket() {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${protocol}://${window.location.host}/ws`;
  client.socket = new WebSocket(url);

  client.socket.addEventListener("open", () => {
    connectionStatus.textContent = "Online";
    connectionStatus.classList.remove("offline");
    if (client.playerId && client.roomCode) {
      sendMessage({
        type: "reconnect",
        playerId: client.playerId,
        roomCode: client.roomCode,
      });
    }
  });

  client.socket.addEventListener("message", (event) => {
    try {
      const payload = JSON.parse(event.data);
      handleMessage(payload);
    } catch (error) {
      // ignore invalid payload
    }
  });

  client.socket.addEventListener("close", () => {
    connectionStatus.textContent = "Baglanti Zayif";
    connectionStatus.classList.add("offline");
    if (!reconnectHandle) {
      reconnectHandle = window.setTimeout(() => {
        reconnectHandle = null;
        connectSocket();
      }, 2000);
    }
  });
}

function ensureName(source) {
  const input = source === "create" ? playerNameCreate : playerNameJoin;
  const name = sanitizeName(input.value || client.playerName);
  if (!name) {
    showToast("Isim yazmalisin.");
    return "";
  }
  client.playerName = name;
  playerNameCreate.value = name;
  playerNameJoin.value = name;
  saveClient();
  return name;
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.haptic !== undefined) {
      pulse();
    }
    const target = btn.dataset.nav;
    if (client.roomCode && (target === "home" || target === "create")) {
      sendMessage({ type: "leave_room" });
      clearClient();
      updateInputs();
      playerList.innerHTML = "";
      clueList.innerHTML = "";
      chatList.innerHTML = "";
      voteGrid.innerHTML = "";
      showScreen(target);
      return;
    }
    if (!client.roomCode) {
      showScreen(target);
    }
  });
});

playerCountInput.addEventListener("input", (event) => {
  settings.playerCount = Number(event.target.value);
  playerCountValue.textContent = settings.playerCount;
  saveSettings();
});

categoryCards.forEach((card) => {
  card.addEventListener("click", () => {
    settings.category = card.dataset.category;
    categoryCards.forEach((item) => item.classList.remove("is-active"));
    card.classList.add("is-active");
    saveSettings();
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
    (card) => card.dataset.category === settings.category
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
    settings.roundTime = Number(chip.dataset.time);
    clueTimer.textContent = settings.roundTime.toString();
    clueProgress.style.width = "0%";
    saveSettings();
  });
});

createRoomBtn.addEventListener("click", () => {
  pulse();
  const name = ensureName("create");
  if (!name) return;
  const sent = sendMessage({
    type: "create_room",
    name,
    settings: {
      playerCount: settings.playerCount,
      category: settings.category,
      roundTime: settings.roundTime,
    },
  });
  if (sent) {
    showScreen("join");
  }
});

joinRoomBtn.addEventListener("click", () => {
  pulse();
  const name = ensureName("join");
  if (!name) return;
  const code = sanitizeRoomCode(roomCodeInput.value);
  if (code.length < 4) {
    showToast("Lutfen 4-6 haneli kod gir.");
    return;
  }
  roomCodeInput.value = code;
  sendMessage({ type: "join_room", name, roomCode: code });
});

copyCodeBtn.addEventListener("click", async () => {
  pulse();
  if (!client.roomCode) {
    showToast("Once oda olusturmalisin.");
    return;
  }
  try {
    await navigator.clipboard.writeText(client.roomCode);
    showToast("Oda kodu kopyalandi.");
  } catch (error) {
    showToast(`Oda kodu: ${client.roomCode}`);
  }
});

startGameBtn.addEventListener("click", () => {
  pulse();
  sendMessage({ type: "start_game" });
});

roomCodeInput.addEventListener("input", (event) => {
  const clean = sanitizeRoomCode(event.target.value);
  event.target.value = clean;
});

revealWordBtn.addEventListener("click", () => {
  pulse();
  sendMessage({ type: "request_word" });
});

readyBtn.addEventListener("click", () => {
  pulse();
  readyBtn.disabled = true;
  sendMessage({ type: "ready" });
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
  sendMessage({ type: "submit_clue", text: value });
  clueInput.value = "";
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  pulse();
  const value = chatInput.value.trim();
  if (!value) return;
  sendMessage({ type: "chat", text: value });
  chatInput.value = "";
});

startVoteBtn.addEventListener("click", () => {
  pulse();
  startVoteBtn.disabled = true;
  sendMessage({ type: "start_vote" });
});

voteGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".vote-card");
  if (!card) return;
  pulse();
  voteGrid.querySelectorAll(".vote-card").forEach((item) => {
    item.classList.remove("selected");
  });
  card.classList.add("selected");
  sendMessage({
    type: "vote",
    targetId: card.dataset.playerId,
  });
});

showResultBtn.addEventListener("click", () => {
  pulse();
  showResultBtn.disabled = true;
  sendMessage({ type: "show_results" });
});

loadSettings();
loadClient();
updateInputs();
startGameBtn.style.display = "none";
startVoteBtn.disabled = true;
showResultBtn.disabled = true;
connectSocket();
showScreen("home");
