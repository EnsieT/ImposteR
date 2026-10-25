import { RoomState, PlayerRole } from '../game/rules';

export type GameSoundEvent =
  | 'PLAYER_JOINED'
  | 'ROLE_REVEAL_DEALT'
  | 'ROLE_REVEALED_CITIZEN'
  | 'ROLE_REVEALED_IMPOSTER'
  | 'CLUE_PHASE_STARTED'
  | 'CLUE_SUBMITTED'
  | 'YOUR_TURN_ALERT'
  | 'VOTING_STARTED'
  | 'VOTE_LOCKED'
  | 'TIMER_TICK'
  | 'VOTING_TIMER_ENDED'
  | 'IMPOSTER_CAUGHT_ALERT'
  | 'ROUND_VICTORY'
  | 'ROUND_DEFEAT';

export const SOUND_EVENT_LABELS: Record<GameSoundEvent, string> = {
  PLAYER_JOINED: 'Player Joined Group',
  ROLE_REVEAL_DEALT: 'Sticky Notes Dealt',
  ROLE_REVEALED_CITIZEN: 'Citizen Word Revealed',
  ROLE_REVEALED_IMPOSTER: 'Imposter Role Revealed',
  CLUE_PHASE_STARTED: 'Corkboard Clue Phase Started',
  CLUE_SUBMITTED: 'New Clue Pinned',
  YOUR_TURN_ALERT: 'Your Turn to Give a Clue',
  VOTING_STARTED: 'Suspect Voting Opened',
  VOTE_LOCKED: 'Suspect Vote Locked',
  TIMER_TICK: 'Voting Timer Countdown',
  VOTING_TIMER_ENDED: 'Voting Timer Ended',
  IMPOSTER_CAUGHT_ALERT: 'Imposter Exposed — Final Guess',
  ROUND_VICTORY: 'Round Victory Fanfare',
  ROUND_DEFEAT: 'Round Defeat Sting',
};

/**
 * Pure helper function that compares previous and next RoomState snapshots
 * and returns the ordered list of GameSoundEvents that occurred on this transition.
 */
export function detectGameAudioEvents(
  prevRoom: RoomState | null,
  nextRoom: RoomState | null,
  activePlayerId: string
): GameSoundEvent[] {
  if (!nextRoom) return [];
  if (!prevRoom || prevRoom.code !== nextRoom.code) {
    if (nextRoom.phase === 'ROLE_REVEAL') {
      return ['ROLE_REVEAL_DEALT'];
    }
    return [];
  }

  const events: GameSoundEvent[] = [];

  // 1. New player joined lobby
  if (
    nextRoom.phase === 'LOBBY' &&
    nextRoom.players.length > prevRoom.players.length
  ) {
    events.push('PLAYER_JOINED');
  }

  // 2. Phase transitions
  if (prevRoom.phase !== nextRoom.phase) {
    if (nextRoom.phase === 'ROLE_REVEAL') {
      events.push('ROLE_REVEAL_DEALT');
    } else if (nextRoom.phase === 'CLUE_ROUNDS') {
      events.push('CLUE_PHASE_STARTED');
      const currentSpeakerId = nextRoom.turnOrder[nextRoom.activeTurnIndex];
      if (currentSpeakerId === activePlayerId) {
        events.push('YOUR_TURN_ALERT');
      }
    } else if (nextRoom.phase === 'VOTING') {
      if (prevRoom.phase === 'CLUE_ROUNDS' && nextRoom.clues.length > prevRoom.clues.length) {
        events.push('CLUE_SUBMITTED');
      }
      events.push('VOTING_STARTED');
    } else if (nextRoom.phase === 'IMPOSTER_GUESS') {
      events.push('IMPOSTER_CAUGHT_ALERT');
    } else if (nextRoom.phase === 'ROUND_SUMMARY' && nextRoom.lastResult) {
      const activePlayer = nextRoom.players.find((p) => p.id === activePlayerId);
      const isCitizenWin = nextRoom.lastResult.winner === 'CITIZENS';
      const amIImposter = activePlayer?.role === 'IMPOSTER';
      const didIWin =
        (isCitizenWin && !amIImposter) || (!isCitizenWin && amIImposter);
      events.push(didIWin ? 'ROUND_VICTORY' : 'ROUND_DEFEAT');
    }
    return events;
  }

  // 3. Same-phase events in CLUE_ROUNDS
  if (nextRoom.phase === 'CLUE_ROUNDS') {
    if (nextRoom.clues.length > prevRoom.clues.length) {
      events.push('CLUE_SUBMITTED');
    }
    const prevSpeakerId = prevRoom.turnOrder[prevRoom.activeTurnIndex];
    const nextSpeakerId = nextRoom.turnOrder[nextRoom.activeTurnIndex];
    if (
      prevSpeakerId !== nextSpeakerId &&
      nextSpeakerId === activePlayerId
    ) {
      events.push('YOUR_TURN_ALERT');
    }
  }

  // 4. Same-phase events in VOTING
  if (nextRoom.phase === 'VOTING') {
    const prevVotes = prevRoom.players.filter((p) => Boolean(p.votedTargetId)).length;
    const nextVotes = nextRoom.players.filter((p) => Boolean(p.votedTargetId)).length;
    if (nextVotes > prevVotes) {
      events.push('VOTE_LOCKED');
    }
  }

  return events;
}

export function getRoleRevealSoundEvent(role?: PlayerRole): GameSoundEvent {
  return role === 'IMPOSTER'
    ? 'ROLE_REVEALED_IMPOSTER'
    : 'ROLE_REVEALED_CITIZEN';
}
