import { CategoryId, WordEntry, getWordsForCategory } from './words';

export type RoomPhase =
  | 'LOBBY'
  | 'ROLE_REVEAL'
  | 'CLUE_ROUNDS'
  | 'VOTING'
  | 'IMPOSTER_GUESS'
  | 'ROUND_SUMMARY';

export type PlayerRole = 'CITIZEN' | 'IMPOSTER';

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  isHost: boolean;
  isBot: boolean;
  connected: boolean;
  score: number;
  role?: PlayerRole;
  readyInReveal: boolean;
  votedTargetId?: string | null; // null or 'SKIP' or target playerId
}

export interface ClueEntry {
  id: string;
  playerId: string;
  playerName: string;
  roundNumber: number;
  text: string;
  isSpokenAloud: boolean;
  timestamp: number;
}

export interface RoomSettings {
  category: CategoryId;
  imposterCount: number; // 1 or 2
  clueRounds: number; // 1 or 2
  imposterVibeHint: boolean; // give imposter a vague vibe hint so they aren't 100% blind
  imposterSafeFirstTurn: boolean; // prevent imposter from going very first in round 1
  customWords: string[];
}

export type RoundWinner = 'CITIZENS' | 'IMPOSTER_ESCAPED' | 'IMPOSTER_GUESSED';

export interface RoundResult {
  winner: RoundWinner;
  headline: string;
  subheadline: string;
  secretWord: string;
  categoryLabel: string;
  vibeHint: string;
  imposterIds: string[];
  eliminatedPlayerId: string | null;
  imposterGuessText?: string;
  voteBreakdown: Record<string, string>; // voterId -> targetId | 'SKIP'
  scoreDeltas: Record<string, number>; // playerId -> points earned this round
}

export interface RoomState {
  code: string;
  createdAt: number;
  updatedAt: number;
  phase: RoomPhase;
  roundNumber: number;
  settings: RoomSettings;
  players: Player[];
  // Active round state
  currentWord?: WordEntry;
  usedWordIds: string[];
  turnOrder: string[]; // playerIds in speaking order
  activeTurnIndex: number;
  currentClueRound: number;
  clues: ClueEntry[];
  caughtImposterId?: string | null;
  lastResult?: RoundResult | null;
}

export const AVATAR_COLORS = [
  '#FDE047', // Canary Sticky
  '#FB7185', // Coral Pink Sticky
  '#38BDF8', // Sky Blue Sticky
  '#4ADE80', // Mint Green Sticky
  '#C084FC', // Lavender Sticky
  '#FDBA74', // Peach Sticky
  '#2DD4BF', // Teal Sticky
  '#F472B6', // Rose Sticky
];

export const BOT_NAMES = [
  'Agent Maya',
  'Detective Leo',
  'Inspector Sam',
  'Operative Chloe',
  'Sleuth Viktor',
  'Scout Nora',
];

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(rng: () => number = Math.random): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(rng() * ROOM_CODE_CHARS.length);
    code += ROOM_CODE_CHARS[idx];
  }
  return code;
}

export function createRoom(
  hostId: string,
  hostName: string,
  customCode?: string,
  rng: () => number = Math.random
): RoomState {
  const cleanName = hostName.trim().slice(0, 24) || 'Host Player';
  const code = (customCode || generateRoomCode(rng)).toUpperCase();
  const now = Date.now();

  return {
    code,
    createdAt: now,
    updatedAt: now,
    phase: 'LOBBY',
    roundNumber: 0,
    settings: {
      category: 'all',
      imposterCount: 1,
      clueRounds: 1,
      imposterVibeHint: true,
      imposterSafeFirstTurn: true,
      customWords: [],
    },
    players: [
      {
        id: hostId,
        name: cleanName,
        avatarColor: AVATAR_COLORS[0],
        isHost: true,
        isBot: false,
        connected: true,
        score: 0,
        readyInReveal: false,
      },
    ],
    usedWordIds: [],
    turnOrder: [],
    activeTurnIndex: 0,
    currentClueRound: 1,
    clues: [],
    caughtImposterId: null,
    lastResult: null,
  };
}

export function joinRoom(
  room: RoomState,
  playerId: string,
  playerName: string,
  isBot = false
): RoomState {
  const cleanName = playerName.trim().slice(0, 24) || 'Player';
  const existingIndex = room.players.findIndex((p) => p.id === playerId);

  if (existingIndex !== -1) {
    const updatedPlayers = [...room.players];
    updatedPlayers[existingIndex] = {
      ...updatedPlayers[existingIndex],
      name: cleanName || updatedPlayers[existingIndex].name,
      connected: true,
    };
    return {
      ...room,
      updatedAt: Date.now(),
      players: updatedPlayers,
    };
  }

  // Idempotency / max players guard
  if (room.players.length >= 12) {
    return room;
  }

  const color = AVATAR_COLORS[room.players.length % AVATAR_COLORS.length];
  const newPlayer: Player = {
    id: playerId,
    name: cleanName,
    avatarColor: color,
    isHost: room.players.length === 0,
    isBot,
    connected: true,
    score: 0,
    readyInReveal: isBot,
    role: room.phase !== 'LOBBY' ? 'CITIZEN' : undefined,
  };

  const nextTurnOrder =
    room.phase === 'CLUE_ROUNDS' && !room.turnOrder.includes(playerId)
      ? [...room.turnOrder, playerId]
      : room.turnOrder;

  return {
    ...room,
    updatedAt: Date.now(),
    players: [...room.players, newPlayer],
    turnOrder: nextTurnOrder,
  };
}

export function addBotToRoom(room: RoomState): RoomState {
  if (room.players.length >= 10) return room;
  const existingNames = new Set(room.players.map((p) => p.name));
  const botName =
    BOT_NAMES.find((n) => !existingNames.has(n)) ||
    `Bot Suspect ${room.players.filter((p) => p.isBot).length + 1}`;
  const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return joinRoom(room, botId, botName, true);
}

export function removePlayerFromRoom(room: RoomState, targetPlayerId: string): RoomState {
  const remaining = room.players.filter((p) => p.id !== targetPlayerId);
  if (remaining.length === 0) {
    return {
      ...room,
      players: [],
      updatedAt: Date.now(),
    };
  }

  // Ensure at least one human host exists
  const hasHost = remaining.some((p) => p.isHost);
  if (!hasHost) {
    const firstHuman = remaining.find((p) => !p.isBot) || remaining[0];
    firstHuman.isHost = true;
  }

  return {
    ...room,
    updatedAt: Date.now(),
    players: remaining,
    turnOrder: room.turnOrder.filter((id) => id !== targetPlayerId),
  };
}

export function updateRoomSettings(
  room: RoomState,
  partial: Partial<RoomSettings>
): RoomState {
  const nextSettings: RoomSettings = {
    ...room.settings,
    ...partial,
  };
  nextSettings.imposterCount = Math.max(1, Math.min(2, nextSettings.imposterCount));
  nextSettings.clueRounds = Math.max(1, Math.min(3, nextSettings.clueRounds));

  return {
    ...room,
    updatedAt: Date.now(),
    settings: nextSettings,
  };
}

function shuffleArray<T>(items: T[], rng: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function startRound(
  room: RoomState,
  rng: () => number = Math.random
): { room: RoomState; error?: string } {
  if (room.players.length < 3) {
    return {
      room,
      error: 'At least 3 players are needed to play Imposter. Invite friends or add a Bot Suspect!',
    };
  }

  const candidateWords = getWordsForCategory(
    room.settings.category,
    room.settings.customWords
  );
  const unused = candidateWords.filter((w) => !room.usedWordIds.includes(w.id));
  const pool = unused.length > 0 ? unused : candidateWords;
  const chosenWord = pool[Math.floor(rng() * pool.length)];

  // Determine number of imposters (1 for 3-5 players, up to 2 for 6+ players if selected)
  const actualImposterCount =
    room.players.length >= 6 ? Math.min(room.settings.imposterCount, 2) : 1;

  const shuffledPlayerIds = shuffleArray(
    room.players.map((p) => p.id),
    rng
  );
  const imposterSet = new Set(shuffledPlayerIds.slice(0, actualImposterCount));

  // Build speaking turn order
  let turnOrder = shuffleArray(
    room.players.map((p) => p.id),
    rng
  );

  // If imposterSafeFirstTurn is enabled, make sure the very first speaker isn't an imposter
  if (room.settings.imposterSafeFirstTurn && turnOrder.length >= 2) {
    if (imposterSet.has(turnOrder[0])) {
      const firstCitizenIdx = turnOrder.findIndex((id) => !imposterSet.has(id));
      if (firstCitizenIdx > 0) {
        [turnOrder[0], turnOrder[firstCitizenIdx]] = [
          turnOrder[firstCitizenIdx],
          turnOrder[0],
        ];
      }
    }
  }

  const updatedPlayers: Player[] = room.players.map((p) => ({
    ...p,
    role: imposterSet.has(p.id) ? 'IMPOSTER' : 'CITIZEN',
    readyInReveal: p.isBot, // Bots automatically mark ready
    votedTargetId: null,
  }));

  const allReady = updatedPlayers.every((p) => p.readyInReveal);

  return {
    room: {
      ...room,
      updatedAt: Date.now(),
      phase: allReady ? 'CLUE_ROUNDS' : 'ROLE_REVEAL',
      roundNumber: room.roundNumber + 1,
      currentWord: chosenWord,
      usedWordIds: [...room.usedWordIds.slice(-30), chosenWord.id],
      players: updatedPlayers,
      turnOrder,
      activeTurnIndex: 0,
      currentClueRound: 1,
      clues: [],
      caughtImposterId: null,
      lastResult: null,
    },
  };
}

export function markPlayerReadyInReveal(
  room: RoomState,
  playerId: string,
  forceAll = false
): RoomState {
  if (room.phase !== 'ROLE_REVEAL') return room;

  const updatedPlayers = room.players.map((p) =>
    forceAll || p.id === playerId ? { ...p, readyInReveal: true } : p
  );

  const allReady = updatedPlayers.every((p) => p.readyInReveal || !p.connected);

  return {
    ...room,
    updatedAt: Date.now(),
    players: updatedPlayers,
    phase: allReady ? 'CLUE_ROUNDS' : 'ROLE_REVEAL',
  };
}

export function generateBotClue(room: RoomState, botPlayer: Player): string {
  const wordEntry = room.currentWord;
  if (!wordEntry) return 'Hmm';

  const existingClueTexts = new Set(
    room.clues.map((c) => c.text.toLowerCase().trim())
  );

  const pool =
    botPlayer.role === 'IMPOSTER'
      ? wordEntry.imposterClues
      : wordEntry.citizenClues;

  const available = pool.filter((c) => !existingClueTexts.has(c.toLowerCase()));
  if (available.length > 0) {
    return available[room.clues.length % available.length];
  }
  return botPlayer.role === 'IMPOSTER' ? 'Familiar' : 'Classic';
}

export function submitClue(
  room: RoomState,
  playerId: string,
  clueText: string,
  isSpokenAloud = false
): { room: RoomState; error?: string } {
  if (room.phase !== 'CLUE_ROUNDS') {
    return { room, error: 'Not currently in the clue phase.' };
  }

  const expectedPlayerId = room.turnOrder[room.activeTurnIndex];
  if (expectedPlayerId !== playerId) {
    return { room, error: 'Wait for your turn on the sticky board!' };
  }

  const player = room.players.find((p) => p.id === playerId);
  if (!player) {
    return { room, error: 'Player not found.' };
  }

  const cleanedText = isSpokenAloud
    ? '(Spoken Out Loud)'
    : clueText.trim().slice(0, 40);

  if (!cleanedText) {
    return { room, error: 'Please enter a 1-word clue or mark Spoken Out Loud.' };
  }

  // Prevent accidentally typing the exact secret word if Citizen
  if (
    !isSpokenAloud &&
    room.currentWord &&
    cleanedText.toLowerCase() === room.currentWord.word.toLowerCase()
  ) {
    return {
      room,
      error: 'You cannot write the exact Secret Word on your clue note!',
    };
  }

  const newClue: ClueEntry = {
    id: `clue-${room.roundNumber}-${room.currentClueRound}-${room.clues.length + 1}`,
    playerId: player.id,
    playerName: player.name,
    roundNumber: room.currentClueRound,
    text: cleanedText,
    isSpokenAloud,
    timestamp: Date.now(),
  };

  const nextClues = [...room.clues, newClue];
  let nextTurnIndex = room.activeTurnIndex + 1;
  let nextClueRound = room.currentClueRound;
  let nextPhase: RoomPhase = 'CLUE_ROUNDS';

  if (nextTurnIndex >= room.turnOrder.length) {
    if (nextClueRound < room.settings.clueRounds) {
      nextClueRound += 1;
      nextTurnIndex = 0;
    } else {
      nextPhase = 'VOTING';
      nextTurnIndex = 0;
    }
  }

  return {
    room: {
      ...room,
      updatedAt: Date.now(),
      clues: nextClues,
      activeTurnIndex: nextTurnIndex,
      currentClueRound: nextClueRound,
      phase: nextPhase,
    },
  };
}

export function advanceBotTurnsIfNeeded(room: RoomState): RoomState {
  let current = room;
  let safetyCounter = 0;

  while (current.phase === 'CLUE_ROUNDS' && safetyCounter < 24) {
    safetyCounter++;
    const activePlayerId = current.turnOrder[current.activeTurnIndex];
    const activePlayer = current.players.find((p) => p.id === activePlayerId);
    if (!activePlayer || !activePlayer.isBot) {
      break;
    }
    const botClue = generateBotClue(current, activePlayer);
    const res = submitClue(current, activePlayer.id, botClue, false);
    if (res.error) break;
    current = res.room;
  }

  return current;
}

export function castVote(
  room: RoomState,
  voterId: string,
  targetId: string // playerId or 'SKIP'
): RoomState {
  if (room.phase !== 'VOTING') return room;

  // Update the voter's choice
  let updatedPlayers = room.players.map((p) =>
    p.id === voterId ? { ...p, votedTargetId: targetId } : p
  );

  // Also let bots cast intelligent votes once at least one human has voted
  const imposters = updatedPlayers.filter((p) => p.role === 'IMPOSTER');
  const citizens = updatedPlayers.filter((p) => p.role === 'CITIZEN');

  updatedPlayers = updatedPlayers.map((p) => {
    if (!p.isBot || p.votedTargetId) return p;
    if (p.role === 'IMPOSTER') {
      // Bot imposter votes for a random citizen to deflect blame
      const target = citizens.find((c) => c.id !== p.id) || updatedPlayers[0];
      return { ...p, votedTargetId: target.id };
    } else {
      // Bot citizen has a ~65% chance of spotting the imposter, or votes another suspect
      const suspectPool =
        imposters.length > 0 && p.name.length % 3 !== 0
          ? imposters
          : updatedPlayers.filter((other) => other.id !== p.id);
      const chosen = suspectPool[0] || updatedPlayers[0];
      return { ...p, votedTargetId: chosen.id };
    }
  });

  const allVoted = updatedPlayers.every(
    (p) => Boolean(p.votedTargetId) || !p.connected
  );

  const nextRoom: RoomState = {
    ...room,
    updatedAt: Date.now(),
    players: updatedPlayers,
  };

  if (allVoted) {
    return tallyVotes(nextRoom);
  }

  return nextRoom;
}

export function tallyVotes(room: RoomState): RoomState {
  if (room.phase !== 'VOTING') return room;

  const counts: Record<string, number> = {};
  const voteBreakdown: Record<string, string> = {};

  for (const player of room.players) {
    const choice = player.votedTargetId || 'SKIP';
    voteBreakdown[player.id] = choice;
    counts[choice] = (counts[choice] || 0) + 1;
  }

  // Find highest vote recipient (excluding SKIP unless SKIP is highest)
  let topTarget: string | null = null;
  let topVotes = 0;
  let isTie = false;

  for (const [targetId, count] of Object.entries(counts)) {
    if (count > topVotes) {
      topVotes = count;
      topTarget = targetId;
      isTie = false;
    } else if (count === topVotes) {
      isTie = true;
    }
  }

  const eliminatedId =
    !topTarget || topTarget === 'SKIP' || isTie ? null : topTarget;
  const eliminatedPlayer = room.players.find((p) => p.id === eliminatedId);

  const imposterIds = room.players
    .filter((p) => p.role === 'IMPOSTER')
    .map((p) => p.id);

  // Did the group catch an Imposter?
  if (eliminatedPlayer && eliminatedPlayer.role === 'IMPOSTER') {
    // If the caught imposter is a bot, auto-resolve their final word guess right away
    if (eliminatedPlayer.isBot) {
      const botGuess =
        room.currentWord?.decoyOptions.find(
          (opt) => opt.toLowerCase() !== room.currentWord?.word.toLowerCase()
        ) || 'Umbrella';
      return submitImposterWordGuess(
        {
          ...room,
          phase: 'IMPOSTER_GUESS',
          caughtImposterId: eliminatedPlayer.id,
        },
        eliminatedPlayer.id,
        botGuess
      );
    }

    return {
      ...room,
      updatedAt: Date.now(),
      phase: 'IMPOSTER_GUESS',
      caughtImposterId: eliminatedPlayer.id,
    };
  }

  // Otherwise, the Imposter escaped undetected!
  return finalizeRoundSummary(
    room,
    'IMPOSTER_ESCAPED',
    eliminatedId,
    undefined
  );
}

export function submitImposterWordGuess(
  room: RoomState,
  imposterId: string,
  guessedWord: string
): RoomState {
  if (room.phase !== 'IMPOSTER_GUESS') return room;

  const secretWord = room.currentWord?.word || '';
  const cleanGuess = guessedWord.trim();
  const isCorrect =
    cleanGuess.toLowerCase() === secretWord.trim().toLowerCase();

  return finalizeRoundSummary(
    room,
    isCorrect ? 'IMPOSTER_GUESSED' : 'CITIZENS',
    room.caughtImposterId || imposterId,
    cleanGuess
  );
}

function finalizeRoundSummary(
  room: RoomState,
  winner: RoundWinner,
  eliminatedPlayerId: string | null,
  imposterGuessText?: string
): RoomState {
  const imposterIds = room.players
    .filter((p) => p.role === 'IMPOSTER')
    .map((p) => p.id);
  const imposterNames = room.players
    .filter((p) => p.role === 'IMPOSTER')
    .map((p) => p.name)
    .join(' & ');

  const voteBreakdown: Record<string, string> = {};
  for (const p of room.players) {
    if (p.votedTargetId) {
      voteBreakdown[p.id] = p.votedTargetId;
    }
  }

  const scoreDeltas: Record<string, number> = {};
  for (const p of room.players) {
    let delta = 0;
    if (p.role === 'CITIZEN') {
      // +1 accuracy bonus if Citizen voted for an actual Imposter
      if (p.votedTargetId && imposterIds.includes(p.votedTargetId)) {
        delta += 1;
      }
      if (winner === 'CITIZENS') {
        delta += 2;
      }
    } else if (p.role === 'IMPOSTER') {
      if (winner === 'IMPOSTER_ESCAPED' || winner === 'IMPOSTER_GUESSED') {
        delta += 3;
      }
    }
    scoreDeltas[p.id] = delta;
  }

  let headline = '';
  let subheadline = '';

  if (winner === 'CITIZENS') {
    headline = 'Citizens Caught the Imposter!';
    subheadline = `${imposterNames} was exposed and guessed "${imposterGuessText || 'wrong'}" instead of "${room.currentWord?.word}".`;
  } else if (winner === 'IMPOSTER_GUESSED') {
    headline = 'Imposter Stole the Win!';
    subheadline = `${imposterNames} was caught in the vote, but deduced the secret word "${room.currentWord?.word}" from your clues!`;
  } else {
    const eliminatedName =
      room.players.find((p) => p.id === eliminatedPlayerId)?.name || 'Nobody';
    headline = 'The Imposter Blended In!';
    subheadline =
      eliminatedPlayerId
        ? `The group voted out ${eliminatedName} (an innocent Citizen) while ${imposterNames} slipped away!`
        : `The vote ended in a tie/skip, allowing ${imposterNames} to escape undetected!`;
  }

  const updatedPlayers = room.players.map((p) => ({
    ...p,
    score: p.score + (scoreDeltas[p.id] || 0),
  }));

  const result: RoundResult = {
    winner,
    headline,
    subheadline,
    secretWord: room.currentWord?.word || 'Unknown',
    categoryLabel: room.currentWord?.categoryLabel || 'General',
    vibeHint: room.currentWord?.vibeHint || '',
    imposterIds,
    eliminatedPlayerId,
    imposterGuessText,
    voteBreakdown,
    scoreDeltas,
  };

  return {
    ...room,
    updatedAt: Date.now(),
    phase: 'ROUND_SUMMARY',
    players: updatedPlayers,
    lastResult: result,
  };
}
