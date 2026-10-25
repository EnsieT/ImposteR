import {
  RoomState,
  RoomSettings,
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
} from '../game/rules';

const STORAGE_PREFIX = 'imposter_room_state_';
const CHANNEL_NAME = 'imposter_static_room_sync';

function loadLocalRoom(code: string): RoomState | null {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${code.toUpperCase()}`);
    if (!raw) return null;
    return JSON.parse(raw) as RoomState;
  } catch {
    return null;
  }
}

function saveLocalRoom(room: RoomState): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${room.code.toUpperCase()}`, JSON.stringify(room));
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'room:updated', room });
      bc.close();
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function subscribeStaticRoom(
  roomCode: string,
  onUpdate: (room: RoomState) => void
): () => void {
  const code = roomCode.toUpperCase();
  let bc: BroadcastChannel | null = null;

  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel(CHANNEL_NAME);
    bc.onmessage = (ev) => {
      if (ev.data?.type === 'room:updated' && ev.data?.room?.code === code) {
        onUpdate(ev.data.room);
      }
    };
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === `${STORAGE_PREFIX}${code}` && e.newValue) {
      try {
        onUpdate(JSON.parse(e.newValue));
      } catch {
        // Ignore parse error
      }
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
    if (bc) bc.close();
  };
}

export function staticCreateRoom(
  playerId: string,
  playerName: string,
  customCode?: string
): RoomState {
  const room = createRoom(playerId, playerName, customCode);
  saveLocalRoom(room);
  return room;
}

export function staticAutostartRoom(
  playerId: string,
  playerName: string
): RoomState {
  let room = createRoom(playerId, playerName || 'Detective Alex', 'NOTE');
  room = addBotToRoom(room);
  room = addBotToRoom(room);
  room = addBotToRoom(room);
  const started = startRound(room);
  room = started.room;
  saveLocalRoom(room);
  return room;
}

export function staticJoinRoom(
  roomCode: string,
  playerId: string,
  playerName: string
): { room?: RoomState; error?: string } {
  const code = roomCode.toUpperCase().trim();
  const existing = loadLocalRoom(code);
  if (!existing) {
    // On static hosts without a shared DB, create/join the room code on demand so players never hit a dead end
    const created = createRoom(playerId, playerName, code);
    saveLocalRoom(created);
    return { room: created };
  }
  const updated = joinRoom(existing, playerId, playerName);
  saveLocalRoom(updated);
  return { room: updated };
}

export function staticPerformAction(
  roomCode: string,
  currentRoom: RoomState,
  action: string,
  playerId: string,
  payload: Record<string, unknown> = {}
): { room: RoomState; error?: string } {
  let room = loadLocalRoom(roomCode) || currentRoom;
  let error: string | undefined;

  switch (action) {
    case 'update_settings':
      room = updateRoomSettings(room, payload as Partial<RoomSettings>);
      break;
    case 'add_bot':
      room = addBotToRoom(room);
      break;
    case 'remove_player':
      if (payload.targetPlayerId) {
        room = removePlayerFromRoom(room, String(payload.targetPlayerId));
      }
      break;
    case 'start_round': {
      const res = startRound(room);
      room = res.room;
      error = res.error;
      if (!error && room.phase === 'CLUE_ROUNDS') {
        room = advanceBotTurnsIfNeeded(room);
      }
      break;
    }
    case 'ready_reveal':
      room = markPlayerReadyInReveal(room, playerId, Boolean(payload.forceAll));
      if (room.phase === 'CLUE_ROUNDS') {
        room = advanceBotTurnsIfNeeded(room);
      }
      break;
    case 'submit_clue': {
      const res = submitClue(
        room,
        playerId,
        String(payload.text || ''),
        Boolean(payload.isSpokenAloud)
      );
      room = res.room;
      error = res.error;
      if (!error && room.phase === 'CLUE_ROUNDS') {
        room = advanceBotTurnsIfNeeded(room);
      }
      break;
    }
    case 'skip_to_voting':
      if (room.phase === 'CLUE_ROUNDS') {
        room = { ...room, updatedAt: Date.now(), phase: 'VOTING' };
      }
      break;
    case 'cast_vote':
      room = castVote(room, playerId, String(payload.targetId || 'SKIP'));
      break;
    case 'force_tally_votes':
      room = tallyVotes(room);
      break;
    case 'imposter_guess':
      room = submitImposterWordGuess(room, playerId, String(payload.guessedWord || ''));
      break;
    case 'back_to_lobby':
      room = {
        ...room,
        updatedAt: Date.now(),
        phase: 'LOBBY',
        clues: [],
        caughtImposterId: null,
      };
      break;
  }

  saveLocalRoom(room);
  return { room, error };
}
