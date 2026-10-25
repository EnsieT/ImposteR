import React, { useState } from 'react';
import {
  Send,
  Mic,
  Eye,
  EyeOff,
  Vote,
  HelpCircle,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { RoomState, Player } from '../game/rules';
import { sound } from '../utils/sound';

interface ClueBoardViewProps {
  room: RoomState;
  activePlayer: Player;
  error: string | null;
  suspicionMap: Record<string, 'suspect' | 'cleared' | undefined>;
  onToggleSuspicion: (targetPlayerId: string) => void;
  onSubmitClue: (text: string, isSpokenAloud: boolean) => void;
  onSwitchToSpeaker: (speakerId: string) => void;
  onSkipToVoting: () => void;
}

export const ClueBoardView: React.FC<ClueBoardViewProps> = ({
  room,
  activePlayer,
  error,
  suspicionMap,
  onToggleSuspicion,
  onSubmitClue,
  onSwitchToSpeaker,
  onSkipToVoting,
}) => {
  const [clueInput, setClueInput] = useState('');
  const [peekOwnNote, setPeekOwnNote] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const currentSpeakerId = room.turnOrder[room.activeTurnIndex];
  const currentSpeaker = room.players.find((p) => p.id === currentSpeakerId);
  const isMyTurn = currentSpeakerId === activePlayer.id;

  const isImposter = activePlayer.role === 'IMPOSTER';
  const categoryLabel = room.currentWord?.categoryLabel || 'General';
  const secretWord = room.currentWord?.word || '';
  const vibeHint = room.currentWord?.vibeHint || '';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const trimmed = clueInput.trim();
    if (!trimmed) {
      setLocalError('Type a 1-word clue to pin on the corkboard, or click Spoken Out Loud.');
      return;
    }
    if (!isImposter && trimmed.toLowerCase() === secretWord.toLowerCase()) {
      setLocalError('Hold on! Do not write the exact Secret Word—give a related clue instead.');
      return;
    }
    onSubmitClue(trimmed, false);
    setClueInput('');
  };

  const handleSpokenAloud = () => {
    setLocalError(null);
    onSubmitClue('(Spoken Out Loud)', true);
    setClueInput('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Bar: Category Info & Private Sticky Note Reminder */}
      <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider">
            Clue Round {room.currentClueRound} of {room.settings.clueRounds} · Turn{' '}
            {room.activeTurnIndex + 1} of {room.turnOrder.length}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-[#FAF8F5]">
              Category: <span className="text-[#FDE047]">{categoryLabel}</span>
            </h2>
          </div>
        </div>

        {/* Private Pocket Sticky Note Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPeekOwnNote((prev) => !prev)}
            className={`h-10 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              peekOwnNote
                ? 'bg-[#FDE047] text-[#141619]'
                : 'bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10'
            }`}
          >
            {peekOwnNote ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#FDE047]" />}
            <span>
              {peekOwnNote
                ? isImposter
                  ? `ROLE: IMPOSTER ${room.settings.imposterVibeHint ? `(${vibeHint})` : ''}`
                  : `WORD: ${secretWord.toUpperCase()}`
                : `Peek ${activePlayer.name}'s Sticky Note`}
            </span>
          </button>

          {room.clues.length >= 2 && (
            <button
              type="button"
              onClick={onSkipToVoting}
              className="h-10 px-3.5 rounded-xl bg-[#252930] hover:bg-[#E11D48]/20 border border-white/10 hover:border-[#E11D48]/40 text-xs font-semibold text-[#D4D4D8] hover:text-[#FDA4AF] flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Jump to Vote Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Turn Input Banner */}
      <div
        className={`rounded-2xl p-5 sm:p-6 border transition-all ${
          isMyTurn
            ? 'bg-[#1C1F24] border-[#FDE047] ring-1 ring-[#FDE047]/50 dossier-card-shadow'
            : 'bg-[#1C1F24] border-white/10'
        }`}
      >
        {isMyTurn ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FDE047]" />
                <h3 className="font-display text-xl font-bold text-[#FAF8F5]">
                  Your Turn, {activePlayer.name}! Pin a 1-Word Sticky Note Clue
                </h3>
              </div>
              <span className="text-xs font-mono text-[#FDE047]">
                {isImposter
                  ? 'Blend in! Pick a safe word that fits the category & prior clues.'
                  : 'Be subtle! Prove you know the word without giving it away.'}
              </span>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row gap-3">
              <label htmlFor="clue-word-input" className="sr-only">
                Your 1-word clue
              </label>
              <input
                id="clue-word-input"
                type="text"
                maxLength={36}
                value={clueInput}
                onChange={(e) => setClueInput(e.target.value)}
                placeholder="Type your 1-word clue (e.g., Flaky, Morning, Crispy)..."
                className="flex-1 h-12 px-4 rounded-xl bg-[#141619] border border-white/20 text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#FDE047] text-base"
              />
              <div className="flex items-center gap-2.5">
                <button
                  type="submit"
                  className="h-12 px-5 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] font-bold text-sm flex items-center gap-2 transition-transform active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Pin Clue Note</span>
                </button>
                <button
                  type="button"
                  onClick={handleSpokenAloud}
                  className="h-12 px-4 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  title="Use this if your group is saying clues out loud in the room"
                >
                  <Mic className="w-4 h-4 text-[#FDE047]" />
                  <span>Spoken Aloud</span>
                </button>
              </div>
            </form>

            {(localError || error) && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-[#E11D48]/15 border border-[#E11D48]/40 text-xs text-[#FDA4AF]"
              >
                {localError || error}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-[#F59E0B] uppercase tracking-wider">
                Active Turn on the Corkboard
              </div>
              <h3 className="font-display text-xl font-bold text-[#FAF8F5]">
                Waiting for{' '}
                <span className="text-[#FDE047]">{currentSpeaker?.name || 'Next Player'}</span>{' '}
                to pin their sticky-note clue...
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Watch their clue closely and tap the suspicion toggle on any player card below to take private notes.
              </p>
            </div>

            {currentSpeaker && !currentSpeaker.isBot && (
              <button
                type="button"
                onClick={() => onSwitchToSpeaker(currentSpeaker.id)}
                className="h-10 px-4 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FDE047] border border-[#FDE047]/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Switch to {currentSpeaker.name}&apos;s Phone</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Shared Corkboard Grid: Players & Their Pinned Sticky Notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {room.turnOrder.map((playerId, turnIdx) => {
          const player = room.players.find((p) => p.id === playerId);
          if (!player) return null;

          const playerClues = room.clues.filter((c) => c.playerId === player.id);
          const isSpeakingNow = room.activeTurnIndex === turnIdx;
          const suspicion = suspicionMap[player.id];

          return (
            <div
              key={player.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isSpeakingNow
                  ? 'bg-[#252930] border-[#FDE047] ring-1 ring-[#FDE047]/40'
                  : 'bg-[#1C1F24] border-white/10'
              }`}
            >
              <div>
                {/* Player Header + Private Suspicion Notepad Button */}
                <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-white/10">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-[#141619] shrink-0"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      #{turnIdx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-[#FAF8F5] truncate">
                        {player.name}
                        {player.id === activePlayer.id ? ' (You)' : ''}
                      </div>
                      <div className="text-[11px] font-mono text-[#A1A1AA]">
                        {isSpeakingNow ? 'WRITING CLUE NOW...' : `Speaker #${turnIdx + 1}`}
                      </div>
                    </div>
                  </div>

                  {player.id !== activePlayer.id && (
                    <button
                      type="button"
                      onClick={() => onToggleSuspicion(player.id)}
                      className={`h-8 px-2.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        suspicion === 'suspect'
                          ? 'bg-[#E11D48]/20 text-[#FDA4AF] border border-[#E11D48]/40'
                          : suspicion === 'cleared'
                          ? 'bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/40'
                          : 'bg-[#141619] text-[#A1A1AA] hover:text-[#FAF8F5] border border-white/10'
                      }`}
                      title="Private detective note (only visible on your screen)"
                    >
                      {suspicion === 'suspect' ? (
                        <>
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Suspect</span>
                        </>
                      ) : suspicion === 'cleared' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Trust</span>
                        </>
                      ) : (
                        <span>Note ?</span>
                      )}
                    </button>
                  )}
                </div>

                {/* Pinned Sticky Note Clues for This Player */}
                {playerClues.length > 0 ? (
                  <div className="space-y-3">
                    {playerClues.map((clue) => (
                      <div
                        key={clue.id}
                        className="p-3.5 rounded-xl bg-[#FDE047] text-[#141619] sticky-note-shadow"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-[#713F12] mb-1">
                          <span>CLUE #{clue.roundNumber}</span>
                          <span>PINNED NOTE</span>
                        </div>
                        <div className="font-display text-xl font-bold tracking-tight text-[#141619]">
                          &ldquo;{clue.text}&rdquo;
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-24 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-xs text-[#71717A] font-mono">
                    {isSpeakingNow ? 'Thinking of a clue...' : 'Waiting for turn...'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
