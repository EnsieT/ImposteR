import express from 'express';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer as createViteServer } from 'vite';
import {
  RoomState,
  createRoom,
  joinRoom,
  addBotToRoom,
  removePlayerFromRoom,
  updateRoomSettings,
  startRound,
  markPlayerReadyInReveal,
  submitClue,
  advanceBotTurnsIfNeeded,
  castVote,
  tallyVotes,
  submitImposterWordGuess,
} from './src/game/rules.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rooms = new Map<string, RoomState>();

interface ClientSubscription {
  ws: WebSocket;
  roomCode: string;
  playerId: string;
}

const subscriptions = new Set<ClientSubscription>();

function broadcastRoom(roomCode: string) {
  const code = roomCode.toUpperCase();
  const room = rooms.get(code);
  if (!room) return;

  const payload = JSON.stringify({
    type: 'room:updated',
    room,
  });

  for (const sub of subscriptions) {
    if (sub.roomCode === code && sub.ws.readyState === WebSocket.OPEN) {
      sub.ws.send(payload);
    }
  }
}

// Helper to ensure a DEMO room starts a clean 4-player round for ?autostart=1 or quick practice
function getOrCreateAutostartRoom(playerId: string, playerName: string): RoomState {
  const code = 'NOTE';
  let room = createRoom(playerId, playerName || 'Detective Alex', code);
  room = addBotToRoom(room);
  room = addBotToRoom(room);
  room = addBotToRoom(room);
  const started = startRound(room);
  room = started.room;
  rooms.set(code, room);
  return room;
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  app.use(express.json());

  // Create a new room
  app.post('/api/rooms/create', (req, res) => {
    const { playerId, playerName, customCode } = req.body || {};
    if (!playerId || !playerName) {
      res.status(400).json({ error: 'Player name is required.' });
      return;
    }

    let code = customCode ? String(customCode).toUpperCase().trim() : undefined;
    if (!code) {
      let attempts = 0;
      do {
        const candidate = createRoom(playerId, playerName).code;
        if (!rooms.has(candidate)) {
          code = candidate;
          break;
        }
        attempts++;
      } while (attempts < 20);
    }

    const room = createRoom(playerId, playerName, code);
    rooms.set(room.code, room);
    broadcastRoom(room.code);
    res.json({ room });
  });

  // Autostart room endpoint for instant ?autostart=1 verification & quick demo
  app.post('/api/rooms/autostart', (req, res) => {
    const { playerId, playerName } = req.body || {};
    const id = playerId || `player-${Date.now()}`;
    const name = playerName || 'Detective Alex';
    const room = getOrCreateAutostartRoom(id, name);
    broadcastRoom(room.code);
    res.json({ room });
  });

  // Join an existing room by code
  app.post('/api/rooms/join', (req, res) => {
    const { roomCode, playerId, playerName } = req.body || {};
    const code = String(roomCode || '').toUpperCase().trim();
    if (!code || code.length < 3) {
      res.status(400).json({ error: 'Please enter a valid 4-letter Room Code.' });
      return;
    }
    if (!playerName || !String(playerName).trim()) {
      res.status(400).json({ error: 'Please enter your name before joining.' });
      return;
    }

    let room = rooms.get(code);
    if (!room) {
      res.status(404).json({
        error: `Room "${code}" was not found. Double-check the 4-letter code or create a new room!`,
      });
      return;
    }

    room = joinRoom(room, playerId, playerName);
    rooms.set(code, room);
    broadcastRoom(code);
    res.json({ room });
  });

  // Fetch current room state
  app.get('/api/rooms/:code', (req, res) => {
    const code = String(req.params.code || '').toUpperCase().trim();
    const room = rooms.get(code);
    if (!room) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }
    res.json({ room });
  });

  // Perform a room action
  app.post('/api/rooms/:code/action', (req, res) => {
    const code = String(req.params.code || '').toUpperCase().trim();
    let room = rooms.get(code);
    if (!room) {
      res.status(404).json({ error: 'Room not found.' });
      return;
    }

    const { action, playerId, payload } = req.body || {};
    let error: string | undefined;

    switch (action) {
      case 'update_settings': {
        room = updateRoomSettings(room, payload || {});
        break;
      }
      case 'add_bot': {
        room = addBotToRoom(room);
        break;
      }
      case 'remove_player': {
        const targetId = payload?.targetPlayerId;
        if (targetId) {
          room = removePlayerFromRoom(room, targetId);
        }
        break;
      }
      case 'start_round': {
        const result = startRound(room);
        room = result.room;
        error = result.error;
        if (!error && room.phase === 'CLUE_ROUNDS') {
          room = advanceBotTurnsIfNeeded(room);
        }
        break;
      }
      case 'ready_reveal': {
        room = markPlayerReadyInReveal(room, playerId, Boolean(payload?.forceAll));
        if (room.phase === 'CLUE_ROUNDS') {
          room = advanceBotTurnsIfNeeded(room);
        }
        break;
      }
      case 'submit_clue': {
        const result = submitClue(
          room,
          playerId,
          String(payload?.text || ''),
          Boolean(payload?.isSpokenAloud)
        );
        room = result.room;
        error = result.error;
        if (!error && room.phase === 'CLUE_ROUNDS') {
          room = advanceBotTurnsIfNeeded(room);
        }
        break;
      }
      case 'skip_to_voting': {
        if (room.phase === 'CLUE_ROUNDS') {
          room = {
            ...room,
            updatedAt: Date.now(),
            phase: 'VOTING',
          };
        }
        break;
      }
      case 'cast_vote': {
        room = castVote(room, playerId, String(payload?.targetId || 'SKIP'));
        break;
      }
      case 'force_tally_votes': {
        room = tallyVotes(room);
        break;
      }
      case 'imposter_guess': {
        room = submitImposterWordGuess(
          room,
          playerId,
          String(payload?.guessedWord || '')
        );
        break;
      }
      case 'back_to_lobby': {
        room = {
          ...room,
          updatedAt: Date.now(),
          phase: 'LOBBY',
          clues: [],
          caughtImposterId: null,
        };
        break;
      }
      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
        return;
    }

    rooms.set(code, room);
    broadcastRoom(code);

    if (error) {
      res.status(400).json({ error, room });
      return;
    }

    res.json({ room });
  });

  // WebSocket setup on /ws for real-time concurrent multi-device sync
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let currentSub: ClientSubscription | null = null;

    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(String(raw));
        if (msg.type === 'subscribe' && msg.roomCode) {
          const code = String(msg.roomCode).toUpperCase().trim();
          const playerId = String(msg.playerId || '');
          if (currentSub) {
            subscriptions.delete(currentSub);
          }
          currentSub = { ws, roomCode: code, playerId };
          subscriptions.add(currentSub);

          const room = rooms.get(code);
          if (room) {
            // Ensure player is marked connected
            const idx = room.players.findIndex((p) => p.id === playerId);
            if (idx !== -1 && !room.players[idx].connected) {
              room.players[idx].connected = true;
              room.updatedAt = Date.now();
              broadcastRoom(code);
            } else {
              ws.send(JSON.stringify({ type: 'room:updated', room }));
            }
          }
        }
      } catch {
        // Ignore malformed WS message
      }
    });

    ws.on('close', () => {
      if (currentSub) {
        subscriptions.delete(currentSub);
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Sticky Note Imposter server running on http://localhost:${PORT}`);
  });
}

startServer();
