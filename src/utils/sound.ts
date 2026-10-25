import { GameSoundEvent, getRoleRevealSoundEvent } from './soundEvents';
import { PlayerRole } from '../game/rules';

type SoundListener = (event: GameSoundEvent) => void;

class SoundManager {
  private ctx: AudioContext | null = null;
  public muted = false;
  private listeners = new Set<SoundListener>();

  public subscribe(listener: SoundListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(event: GameSoundEvent) {
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    delay = 0
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq !== freq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
    }
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration);
  }

  /**
   * Central helper function that plays a synthesized sound effect for any major game event.
   */
  public playGameSound(event: GameSoundEvent) {
    this.notify(event);
    if (this.muted) return;

    switch (event) {
      case 'PLAYER_JOINED': {
        // Friendly ascending 2-note pop when a player joins the lobby
        this.playTone(392, 440, 0.08, 'sine', 0.07, 0);
        this.playTone(587.33, 659.25, 0.11, 'triangle', 0.08, 0.07);
        break;
      }

      case 'ROLE_REVEAL_DEALT': {
        // Tactile 3-card sticky note deal cascade
        this.playTone(220, 420, 0.06, 'triangle', 0.06, 0);
        this.playTone(260, 480, 0.06, 'triangle', 0.06, 0.06);
        this.playTone(310, 560, 0.08, 'triangle', 0.08, 0.12);
        break;
      }

      case 'ROLE_REVEALED_CITIZEN': {
        // Paper peel + warm reassuring Citizen major interval (C5 -> E5 -> G5)
        this.playTone(280, 540, 0.08, 'triangle', 0.07, 0);
        this.playTone(523.25, 523.25, 0.12, 'sine', 0.08, 0.06);
        this.playTone(659.25, 783.99, 0.18, 'triangle', 0.09, 0.14);
        break;
      }

      case 'ROLE_REVEALED_IMPOSTER': {
        // Paper peel + tense spy minor-second sting (F4 -> E4 -> A3)
        this.playTone(260, 480, 0.07, 'triangle', 0.07, 0);
        this.playTone(349.23, 329.63, 0.16, 'sawtooth', 0.06, 0.06);
        this.playTone(220.0, 196.0, 0.26, 'triangle', 0.09, 0.18);
        break;
      }

      case 'CLUE_PHASE_STARTED': {
        // Crisp corkboard bell chime
        this.playTone(440, 440, 0.1, 'triangle', 0.08, 0);
        this.playTone(659.25, 659.25, 0.16, 'sine', 0.09, 0.08);
        break;
      }

      case 'CLUE_SUBMITTED': {
        // Sticky note slap + thumbtack pin pop
        this.playTone(440, 680, 0.09, 'sine', 0.1, 0);
        this.playTone(880, 520, 0.05, 'triangle', 0.06, 0.05);
        break;
      }

      case 'YOUR_TURN_ALERT': {
        // Clear double-ping alerting the active player it is their turn
        this.playTone(587.33, 587.33, 0.1, 'sine', 0.09, 0);
        this.playTone(880.0, 880.0, 0.16, 'triangle', 0.1, 0.11);
        break;
      }

      case 'VOTING_STARTED': {
        // Detective gavel double-knock + suspense chord
        this.playTone(180, 90, 0.08, 'square', 0.07, 0);
        this.playTone(180, 90, 0.09, 'square', 0.08, 0.11);
        this.playTone(293.66, 440, 0.22, 'triangle', 0.07, 0.2);
        break;
      }

      case 'VOTE_LOCKED': {
        // Mechanical dossier stamp lock
        this.playTone(320, 480, 0.06, 'square', 0.06, 0);
        this.playTone(480, 640, 0.08, 'triangle', 0.06, 0.04);
        break;
      }

      case 'TIMER_TICK': {
        // Short woodblock countdown tick for final seconds
        this.playTone(820, 400, 0.045, 'sine', 0.07, 0);
        break;
      }

      case 'VOTING_TIMER_ENDED': {
        // Dramatic time's-up buzzer / resonant gong when voting timer ends
        this.playTone(220, 146.83, 0.35, 'sawtooth', 0.08, 0);
        this.playTone(110, 73.42, 0.45, 'triangle', 0.1, 0.04);
        break;
      }

      case 'IMPOSTER_CAUGHT_ALERT': {
        // Dramatic spotlight reveal chord when Imposter is caught and gets 1 final word guess
        const freqs = [261.63, 311.13, 392.0, 523.25];
        freqs.forEach((f, idx) => {
          this.playTone(f, f, 0.22, 'triangle', 0.08, idx * 0.06);
        });
        break;
      }

      case 'ROUND_VICTORY': {
        // Triumphant major arpeggio fanfare
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          this.playTone(freq, freq, 0.25, 'triangle', 0.1, i * 0.08);
        });
        break;
      }

      case 'ROUND_DEFEAT': {
        // Descending detective noir sting
        const notes = [392.0, 369.99, 311.13, 261.63];
        notes.forEach((freq, i) => {
          this.playTone(freq, freq, 0.25, 'sawtooth', 0.07, i * 0.1);
        });
        break;
      }
    }
  }

  public playRoleReveal(role?: PlayerRole) {
    this.playGameSound(getRoleRevealSoundEvent(role));
  }

  public playPeel() {
    this.playTone(260, 520, 0.09, 'triangle', 0.08, 0);
  }

  public playPinClue() {
    this.playGameSound('CLUE_SUBMITTED');
  }

  public playVoteLock() {
    this.playGameSound('VOTE_LOCKED');
  }

  public playTimerTick() {
    this.playGameSound('TIMER_TICK');
  }

  public playVotingTimerEnded() {
    this.playGameSound('VOTING_TIMER_ENDED');
  }

  public playVictory() {
    this.playGameSound('ROUND_VICTORY');
  }

  public playImposterSting() {
    this.playGameSound('ROUND_DEFEAT');
  }
}

export const sound = new SoundManager();
export function playGameSoundEffect(event: GameSoundEvent): void {
  sound.playGameSound(event);
}
