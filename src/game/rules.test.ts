import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRoom,
  joinRoom,
  addBotToRoom,
  startRound,
  markPlayerReadyInReveal,
  submitClue,
  castVote,
  submitImposterWordGuess,
  updateRoomSettings,
} from './rules';
import {
  detectGameAudioEvents,
  getRoleRevealSoundEvent,
} from '../utils/soundEvents';

test('createRoom and concurrent joinRoom maintain idempotent player roster', () => {
  let room = createRoom('p1', 'Alice', 'NOTE');
  assert.equal(room.code, 'NOTE');
  assert.equal(room.players.length, 1);
  assert.equal(room.players[0].isHost, true);

  room = joinRoom(room, 'p2', 'Bob');
  room = joinRoom(room, 'p3', 'Charlie');
  assert.equal(room.players.length, 3);

  // Rejoining with same playerId is idempotent and updates name/connection
  room = joinRoom(room, 'p2', 'Bobby');
  assert.equal(room.players.length, 3);
  assert.equal(room.players[1].name, 'Bobby');
});

test('startRound requires at least 3 players and assigns exactly 1 Imposter with safe first turn', () => {
  let room = createRoom('p1', 'Alice', 'TEST');
  room = joinRoom(room, 'p2', 'Bob');

  const tooFew = startRound(room);
  assert.ok(tooFew.error);
  assert.equal(tooFew.room.phase, 'LOBBY');

  room = joinRoom(room, 'p3', 'Charlie');
  room = joinRoom(room, 'p4', 'Dana');

  // Deterministic RNG
  let seed = 0.15;
  const rng = () => {
    seed = (seed + 0.27) % 1;
    return seed;
  };

  const started = startRound(room, rng);
  assert.equal(started.error, undefined);
  room = started.room;

  assert.equal(room.phase, 'ROLE_REVEAL');
  assert.ok(room.currentWord);

  const imposters = room.players.filter((p) => p.role === 'IMPOSTER');
  const citizens = room.players.filter((p) => p.role === 'CITIZEN');
  assert.equal(imposters.length, 1);
  assert.equal(citizens.length, 3);

  // Because imposterSafeFirstTurn is true by default, the first speaker must be a CITIZEN
  const firstSpeakerId = room.turnOrder[0];
  const firstSpeaker = room.players.find((p) => p.id === firstSpeakerId);
  assert.equal(firstSpeaker?.role, 'CITIZEN');
});

test('full round lifecycle: reveal -> clues -> voting -> imposter guess -> summary', () => {
  let room = createRoom('p1', 'Alice', 'GAME');
  room = joinRoom(room, 'p2', 'Bob');
  room = joinRoom(room, 'p3', 'Charlie');

  const started = startRound(room, () => 0.1);
  room = started.room;

  // Mark all 3 players ready in reveal
  room = markPlayerReadyInReveal(room, 'p1');
  room = markPlayerReadyInReveal(room, 'p2');
  room = markPlayerReadyInReveal(room, 'p3');
  assert.equal(room.phase, 'CLUE_ROUNDS');

  // Reject out-of-turn clue submission
  const wrongPlayerId = room.turnOrder[1];
  const wrongTurnRes = submitClue(room, wrongPlayerId, 'Sneaky');
  assert.ok(wrongTurnRes.error);

  // Reject submitting the exact secret word
  const firstSpeakerId = room.turnOrder[0];
  const exactWordRes = submitClue(
    room,
    firstSpeakerId,
    room.currentWord!.word
  );
  assert.ok(exactWordRes.error);

  // All 3 players submit valid clues in turn order
  for (const speakerId of room.turnOrder) {
    const res = submitClue(room, speakerId, `Clue-${speakerId}`);
    assert.equal(res.error, undefined);
    room = res.room;
  }

  assert.equal(room.phase, 'VOTING');
  assert.equal(room.clues.length, 3);

  const imposter = room.players.find((p) => p.role === 'IMPOSTER')!;
  const citizens = room.players.filter((p) => p.role === 'CITIZEN');

  // Citizens vote for the imposter; imposter votes for citizen 0
  room = castVote(room, citizens[0].id, imposter.id);
  room = castVote(room, citizens[1].id, imposter.id);
  room = castVote(room, imposter.id, citizens[0].id);

  // Since Imposter is caught, phase transitions to IMPOSTER_GUESS
  assert.equal(room.phase, 'IMPOSTER_GUESS');
  assert.equal(room.caughtImposterId, imposter.id);

  // Imposter guesses wrong -> CITIZENS win
  const wrongFinish = submitImposterWordGuess(room, imposter.id, 'WrongGuessWord');
  assert.equal(wrongFinish.phase, 'ROUND_SUMMARY');
  assert.equal(wrongFinish.lastResult?.winner, 'CITIZENS');

  // Imposter guesses exact secret word -> IMPOSTER_GUESSED steal win
  const stealFinish = submitImposterWordGuess(
    room,
    imposter.id,
    room.currentWord!.word
  );
  assert.equal(stealFinish.phase, 'ROUND_SUMMARY');
  assert.equal(stealFinish.lastResult?.winner, 'IMPOSTER_GUESSED');
});

test('custom word pack and bot suspect auto-advances turns', () => {
  let room = createRoom('p1', 'HostUser', 'BOTS');
  room = addBotToRoom(room);
  room = addBotToRoom(room);
  room = updateRoomSettings(room, {
    category: 'custom',
    customWords: ['Lava Lamp', 'Disco Ball', 'Roller Skates'],
  });

  const started = startRound(room, () => 0.4);
  room = started.room;
  assert.equal(room.currentWord?.category, 'custom');

  // Host marks ready; bots are already ready -> enters CLUE_ROUNDS
  room = markPlayerReadyInReveal(room, 'p1');
  assert.equal(room.phase, 'CLUE_ROUNDS');
});

test('detectGameAudioEvents emits specific sound events for major game transitions', () => {
  const r0 = createRoom('p1', 'Alice', 'SND1');
  const r1 = joinRoom(r0, 'p2', 'Bob');
  assert.deepEqual(detectGameAudioEvents(r0, r1, 'p1'), ['PLAYER_JOINED']);

  const r2 = joinRoom(r1, 'p3', 'Charlie');
  const started = startRound(r2, () => 0.2).room;
  assert.deepEqual(detectGameAudioEvents(r2, started, 'p1'), ['ROLE_REVEAL_DEALT']);

  assert.equal(getRoleRevealSoundEvent('CITIZEN'), 'ROLE_REVEALED_CITIZEN');
  assert.equal(getRoleRevealSoundEvent('IMPOSTER'), 'ROLE_REVEALED_IMPOSTER');

  const firstSpeaker = started.turnOrder[0];
  const secondSpeaker = started.turnOrder[1];
  const thirdSpeaker = started.turnOrder[2];

  const cluePhaseRoom = markPlayerReadyInReveal(started, 'p1', true);
  assert.deepEqual(detectGameAudioEvents(started, cluePhaseRoom, firstSpeaker), [
    'CLUE_PHASE_STARTED',
    'YOUR_TURN_ALERT',
  ]);

  const afterClue1 = submitClue(cluePhaseRoom, firstSpeaker, 'Crispy').room;
  assert.deepEqual(detectGameAudioEvents(cluePhaseRoom, afterClue1, secondSpeaker), [
    'CLUE_SUBMITTED',
    'YOUR_TURN_ALERT',
  ]);

  const afterClue2 = submitClue(afterClue1, secondSpeaker, 'Golden').room;
  const votingRoom = submitClue(afterClue2, thirdSpeaker, 'Warm').room;
  assert.deepEqual(detectGameAudioEvents(afterClue2, votingRoom, 'p1'), [
    'CLUE_SUBMITTED',
    'VOTING_STARTED',
  ]);
});
