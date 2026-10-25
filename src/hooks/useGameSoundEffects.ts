import { useEffect, useRef, useState, useCallback } from 'react';
import { RoomState, PlayerRole } from '../game/rules';
import {
  GameSoundEvent,
  SOUND_EVENT_LABELS,
  detectGameAudioEvents,
} from '../utils/soundEvents';
import { sound } from '../utils/sound';

export interface UseGameSoundEffectsReturn {
  lastSoundEvent: GameSoundEvent | null;
  lastSoundLabel: string | null;
  triggerSound: (event: GameSoundEvent) => void;
  playRoleReveal: (role?: PlayerRole) => void;
  playClueSubmitted: () => void;
  playTimerTick: () => void;
  playVotingTimerEnded: () => void;
}

/**
 * Custom React hook that automatically plays synthesized sound effects when major
 * multiplayer game events occur (new clue submitted, role dealt/revealed, turn alert,
 * voting started, vote locked, voting timer ended, imposter caught, and round summary).
 */
export function useGameSoundEffects(
  room: RoomState | null,
  activePlayerId: string
): UseGameSoundEffectsReturn {
  const prevRoomRef = useRef<RoomState | null>(null);
  const [lastSoundEvent, setLastSoundEvent] = useState<GameSoundEvent | null>(null);

  // Subscribe to any sound event triggered directly or via state transitions
  useEffect(() => {
    const unsubscribe = sound.subscribe((event) => {
      setLastSoundEvent(event);
    });
    return unsubscribe;
  }, []);

  // Automatically detect and play sound effects on room state changes
  useEffect(() => {
    const prevRoom = prevRoomRef.current;
    const events = detectGameAudioEvents(prevRoom, room, activePlayerId);
    prevRoomRef.current = room;

    if (events.length === 0) return;

    const timers: ReturnType<typeof setTimeout>[] = [];
    events.forEach((evt, index) => {
      if (index === 0) {
        sound.playGameSound(evt);
      } else {
        const timer = setTimeout(() => {
          sound.playGameSound(evt);
        }, index * 110);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [room, activePlayerId]);

  const triggerSound = useCallback((event: GameSoundEvent) => {
    sound.playGameSound(event);
  }, []);

  const playRoleReveal = useCallback((role?: PlayerRole) => {
    sound.playRoleReveal(role);
  }, []);

  const playClueSubmitted = useCallback(() => {
    sound.playPinClue();
  }, []);

  const playTimerTick = useCallback(() => {
    sound.playTimerTick();
  }, []);

  const playVotingTimerEnded = useCallback(() => {
    sound.playVotingTimerEnded();
  }, []);

  return {
    lastSoundEvent,
    lastSoundLabel: lastSoundEvent ? SOUND_EVENT_LABELS[lastSoundEvent] : null,
    triggerSound,
    playRoleReveal,
    playClueSubmitted,
    playTimerTick,
    playVotingTimerEnded,
  };
}
