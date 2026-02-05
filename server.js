const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json",
};

const rooms = new Map();

function createId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return crypto.randomBytes(8).toString("hex");
}

function generateCode() {
  let code = "";
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (rooms.has(code));
  return code;
}

function sanitizeName(name) {
  return String(name || "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 16);
}

function getWordPair(category) {
  const pairs = {
    sehirler: ["Istanbul", "Izmir"],
    film: ["Marvel", "DC"],
    spor: ["Futbol", "Basketbol"],
    yemek: ["Pizza", "Lahmacun"],
    marka: ["Nike", "Adidas"],
  };
  return pairs[category] || ["Plaj", "Sahil"];
}

function serializeRoom(room) {
  return {
    code: room.code,
    settings: room.settings,
    state: room.state,
    hostId: room.hostId,
    clues: room.clues || [],
    chat: room.chat || [],
    result: room.result || null,
    players: Array.from(room.players.values()).map((player) => ({
      id: player.id,
      name: player.name,
      connected: player.connected,
      isHost: player.id === room.hostId,
      ready: Boolean(player.ready),
    })),
  };
}

function broadcast(room, payload) {
  const message = JSON.stringify(payload);
  room.players.forEach((player) => {
    if (player.socket && player.socket.readyState === player.socket.OPEN) {
      player.socket.send(message);
    }
  });
}

function updateRoom(room) {
  broadcast(room, { type: "room_updated", room: serializeRoom(room) });
}

function startCluePhase(room) {
  room.state = "clue";
  room.clues = [];
  room.readyCount = 0;
  room.clueStartedAt = Date.now();
  const duration = room.settings.roundTime * 1000;
  broadcast(room, {
    type: "clue_started",
    startedAt: room.clueStartedAt,
    duration,
  });
  updateRoom(room);

  if (room.clueTimeout) {
    clearTimeout(room.clueTimeout);
  }
  room.clueTimeout = setTimeout(() => {
    if (room.state === "clue") {
      room.state = "chat";
      broadcast(room, { type: "phase_changed", phase: "chat" });
      updateRoom(room);
    }
  }, duration);
}

function computeResults(room) {
  const voteCounts = new Map();
  room.votes.forEach((targetId) => {
    voteCounts.set(targetId, (voteCounts.get(targetId) || 0) + 1);
  });
  let topId = null;
  let topVotes = 0;
  voteCounts.forEach((count, id) => {
    if (count > topVotes) {
      topVotes = count;
      topId = id;
    }
  });

  const impostor = room.players.get(room.impostorId);
  const winner = topId === room.impostorId ? "Masumlar" : "Impostor";

  return {
    winner,
    impostorName: impostor ? impostor.name : "Bilinmiyor",
    secretWord: room.wordPair.main,
    impostorWord: room.wordPair.impostor,
  };
}

const server = http.createServer((req, res) => {
  const reqPath = req.url.split("?")[0];
  let filePath = path.join(__dirname, reqPath === "/" ? "index.html" : reqPath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "text/plain" });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket) => {
  let currentRoom = null;
  let currentPlayer = null;

  function send(payload) {
    socket.send(JSON.stringify(payload));
  }

  function leaveRoom() {
    if (!currentRoom || !currentPlayer) return;
    currentRoom.players.delete(currentPlayer.id);
    if (currentRoom.players.size === 0) {
      rooms.delete(currentRoom.code);
    } else {
      if (currentRoom.hostId === currentPlayer.id) {
        const nextHost = Array.from(currentRoom.players.values()).find(
          (player) => player.connected
        );
        currentRoom.hostId = nextHost ? nextHost.id : currentRoom.hostId;
      }
      updateRoom(currentRoom);
    }
    currentRoom = null;
    currentPlayer = null;
  }

  socket.on("message", (message) => {
    let payload = null;
    try {
      payload = JSON.parse(message);
    } catch (error) {
      return;
    }
    if (!payload || !payload.type) return;

    switch (payload.type) {
      case "create_room": {
        const name = sanitizeName(payload.name);
        if (!name) {
          send({ type: "error", message: "Isim gerekli." });
          return;
        }
        const settings = payload.settings || {};
        const roomCode = generateCode();
        const playerId = createId();
        const room = {
          code: roomCode,
          settings: {
            playerCount: Number(settings.playerCount) || 6,
            category: settings.category || "sehirler",
            roundTime: Number(settings.roundTime) || 60,
          },
          hostId: playerId,
          state: "lobby",
          players: new Map(),
          clues: [],
          chat: [],
          votes: new Map(),
          wordPair: null,
          impostorId: null,
          result: null,
          clueStartedAt: null,
          clueTimeout: null,
        };
        const player = {
          id: playerId,
          name,
          socket,
          connected: true,
          ready: false,
          role: null,
          word: null,
          wordRevealed: false,
        };
        room.players.set(playerId, player);
        rooms.set(roomCode, room);
        currentRoom = room;
        currentPlayer = player;
        send({
          type: "room_created",
          roomCode,
          playerId,
          isHost: true,
          room: serializeRoom(room),
        });
        updateRoom(room);
        break;
      }
      case "join_room": {
        const name = sanitizeName(payload.name);
        const roomCode = String(payload.roomCode || "");
        if (!name || !roomCode) {
          send({ type: "error", message: "Isim ve oda kodu gerekli." });
          return;
        }
        const room = rooms.get(roomCode);
        if (!room) {
          send({ type: "error", message: "Oda bulunamadi." });
          return;
        }
        if (room.state !== "lobby") {
          send({ type: "error", message: "Oyun basladi, katilim kapali." });
          return;
        }
        if (room.players.size >= room.settings.playerCount) {
          send({ type: "error", message: "Oda dolu." });
          return;
        }
        const playerId = createId();
        const player = {
          id: playerId,
          name,
          socket,
          connected: true,
          ready: false,
          role: null,
          word: null,
          wordRevealed: false,
        };
        room.players.set(playerId, player);
        currentRoom = room;
        currentPlayer = player;
        send({
          type: "room_joined",
          roomCode,
          playerId,
          isHost: room.hostId === playerId,
          room: serializeRoom(room),
        });
        updateRoom(room);
        break;
      }
      case "reconnect": {
        const room = rooms.get(payload.roomCode);
        if (!room) {
          send({ type: "error", message: "Oda bulunamadi." });
          return;
        }
        const player = room.players.get(payload.playerId);
        if (!player) {
          send({ type: "error", message: "Oyuncu bulunamadi." });
          return;
        }
        player.socket = socket;
        player.connected = true;
        currentRoom = room;
        currentPlayer = player;
        send({
          type: "reconnected",
          roomCode: room.code,
          playerId: player.id,
          isHost: room.hostId === player.id,
          room: serializeRoom(room),
        });
        if (room.state === "clue") {
          send({
            type: "clue_started",
            startedAt: room.clueStartedAt,
            duration: room.settings.roundTime * 1000,
          });
        }
        updateRoom(room);
        break;
      }
      case "start_game": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.hostId !== currentPlayer.id) {
          send({ type: "error", message: "Sadece host baslatabilir." });
          return;
        }
        if (currentRoom.state !== "lobby") {
          send({ type: "error", message: "Oyun zaten basladi." });
          return;
        }
        if (currentRoom.players.size < currentRoom.settings.playerCount) {
          send({ type: "error", message: "Yeterli oyuncu yok." });
          return;
        }
        const players = Array.from(currentRoom.players.values());
        const impostorIndex = Math.floor(Math.random() * players.length);
        const impostor = players[impostorIndex];
        const [mainWord, impostorWord] = getWordPair(
          currentRoom.settings.category
        );
        currentRoom.wordPair = { main: mainWord, impostor: impostorWord };
        currentRoom.impostorId = impostor.id;
        currentRoom.state = "secret";
        currentRoom.result = null;
        currentRoom.players.forEach((player) => {
          player.role = player.id === impostor.id ? "impostor" : "civilian";
          player.word = player.role === "impostor" ? impostorWord : mainWord;
          player.wordRevealed = false;
          player.ready = false;
        });
        broadcast(currentRoom, { type: "game_started" });
        updateRoom(currentRoom);
        break;
      }
      case "request_word": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.state !== "secret") {
          send({ type: "error", message: "Kelime su an kapali." });
          return;
        }
        if (currentPlayer.wordRevealed) {
          send({ type: "error", message: "Kelimeyi zaten gordun." });
          return;
        }
        currentPlayer.wordRevealed = true;
        send({
          type: "secret_word",
          word: currentPlayer.word,
          role: currentPlayer.role,
        });
        updateRoom(currentRoom);
        break;
      }
      case "ready": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.state !== "secret") return;
        currentPlayer.ready = true;
        const allReady = Array.from(currentRoom.players.values()).every(
          (player) => player.ready
        );
        updateRoom(currentRoom);
        if (allReady) {
          startCluePhase(currentRoom);
        }
        break;
      }
      case "submit_clue": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.state !== "clue") return;
        const text = String(payload.text || "").trim().slice(0, 120);
        if (!text) return;
        currentRoom.clues.push({
          id: createId(),
          text,
          by: currentPlayer.name,
        });
        if (currentRoom.clues.length > 50) {
          currentRoom.clues.shift();
        }
        broadcast(currentRoom, {
          type: "clue_added",
          text,
          by: currentPlayer.name,
        });
        break;
      }
      case "chat": {
        if (!currentRoom || !currentPlayer) return;
        const text = String(payload.text || "").trim().slice(0, 200);
        if (!text) return;
        currentRoom.chat.push({
          id: createId(),
          text,
          by: currentPlayer.name,
          playerId: currentPlayer.id,
        });
        if (currentRoom.chat.length > 50) {
          currentRoom.chat.shift();
        }
        broadcast(currentRoom, {
          type: "chat_message",
          text,
          by: currentPlayer.name,
          playerId: currentPlayer.id,
        });
        break;
      }
      case "start_vote": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.hostId !== currentPlayer.id) {
          send({ type: "error", message: "Sadece host oylamayi baslatir." });
          return;
        }
        if (currentRoom.state !== "chat") {
          send({ type: "error", message: "Oylama icin tartisma bitmeli." });
          return;
        }
        currentRoom.state = "vote";
        currentRoom.votes = new Map();
        broadcast(currentRoom, { type: "phase_changed", phase: "vote" });
        updateRoom(currentRoom);
        break;
      }
      case "vote": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.state !== "vote") return;
        const targetId = payload.targetId;
        if (!currentRoom.players.has(targetId)) return;
        currentRoom.votes.set(currentPlayer.id, targetId);
        send({ type: "vote_locked" });
        if (currentRoom.votes.size === currentRoom.players.size) {
          const result = computeResults(currentRoom);
          currentRoom.result = result;
          currentRoom.state = "result";
          broadcast(currentRoom, { type: "results", ...result });
          updateRoom(currentRoom);
        }
        break;
      }
      case "show_results": {
        if (!currentRoom || !currentPlayer) return;
        if (currentRoom.hostId !== currentPlayer.id) {
          send({ type: "error", message: "Sadece host sonuc gosterir." });
          return;
        }
        const result = computeResults(currentRoom);
        currentRoom.result = result;
        currentRoom.state = "result";
        broadcast(currentRoom, { type: "results", ...result });
        updateRoom(currentRoom);
        break;
      }
      case "leave_room": {
        leaveRoom();
        break;
      }
      default:
        break;
    }
  });

  socket.on("close", () => {
    if (!currentRoom || !currentPlayer) return;
    currentPlayer.connected = false;
    currentPlayer.socket = null;
    if (currentRoom.hostId === currentPlayer.id) {
      const nextHost = Array.from(currentRoom.players.values()).find(
        (player) => player.connected
      );
      currentRoom.hostId = nextHost ? nextHost.id : currentRoom.hostId;
    }
    updateRoom(currentRoom);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
