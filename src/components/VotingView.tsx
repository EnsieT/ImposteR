import React, { useState, useEffect, useRef } from 'react';
import {
  Vote,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Send,
  Clock,
} from 'lucide-react';
import { RoomState, Player } from '../game/rules';
import { sound } from '../utils/sound';

interface VotingViewProps {
  room: RoomState;
  activePlayer: Player;
  suspicionMap: Record<string, 'suspect' | 'cleared' | undefined>;
  onCastVote: (targetId: string) => void;
  onForceTallyVotes: () => void;
  onSubmitImposterGuess: (guessedWord: string) => void;
  onSwitchActivePlayer: (id: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  room,
  activePlayer,
  suspicionMap,
  onCastVote,
  onForceTallyVotes,
  onSubmitImposterGuess,
  onSwitchActivePlayer,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>(
    activePlayer.votedTargetId || ''
  );
  const [customGuess, setCustomGuess] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number>(45);
  const tallyCallbackRef = useRef(onForceTallyVotes);
  tallyCallbackRef.current = onForceTallyVotes;

  // Reset countdown timer when entering VOTING phase for a round
  useEffect(() => {
    if (room.phase !== 'VOTING') return;
    setSecondsLeft(45);
  }, [room.phase, room.roundNumber]);

  // Live Voting Countdown Timer with tick & time-up sound effects
  useEffect(() => {
    if (room.phase !== 'VOTING') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          sound.playVotingTimerEnded();
          tallyCallbackRef.current();
          return 0;
        }
        const next = prev - 1;
        if (next <= 5 && next > 0) {
          sound.playTimerTick();
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [room.phase, room.roundNumber]);

  // If we are in IMPOSTER_GUESS phase, render the high-stakes Last Chance Word Steal UI!
  if (room.phase === 'IMPOSTER_GUESS') {
    const caughtImposter =
      room.players.find((p) => p.id === room.caughtImposterId) ||
      room.players.find((p) => p.role === 'IMPOSTER');
    const isMeCaught = caughtImposter?.id === activePlayer.id;
    const decoyOptions = room.currentWord?.decoyOptions || [];

    const handleCustomGuessSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!customGuess.trim()) return;
      onSubmitImposterGuess(customGuess.trim());
    };

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="bg-[#1C1F24] border-2 border-[#E11D48] rounded-2xl p-6 sm:p-8 text-center space-y-4 dossier-card-shadow">
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[#FDA4AF]">
            <ShieldAlert className="w-4 h-4 text-[#E11D48]" />
            <span>Imposter Exposed by the Group Vote!</span>
          </div>

          <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF8F5]">
            {caughtImposter?.name} Was Caught as the Imposter!
          </h2>

          <p className="text-sm sm:text-base text-[#D4D4D8] max-w-xl mx-auto">
            Wait—the round isn&apos;t over yet! In Sticky Note Imposter, a caught Imposter gets{' '}
            <strong className="text-[#FDE047]">one final guess</strong> at the Secret Word based on
            everyone&apos;s clues to steal the victory.
          </p>

          {/* All Pinned Clues Recap */}
          <div className="pt-2">
            <div className="text-xs font-mono text-[#A1A1AA] uppercase mb-2.5">
              Clues Pinned in Category: {room.currentWord?.categoryLabel}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {room.clues.map((c) => (
                <div
                  key={c.id}
                  className="px-3.5 py-2 rounded-xl bg-[#FDE047] text-[#141619] text-xs font-bold sticky-note-shadow"
                >
                  {c.playerName}: &ldquo;{c.text}&rdquo;
                </div>
              ))}
            </div>
          </div>

          {isMeCaught ? (
            <div className="pt-6 border-t border-white/10 space-y-5 text-left">
              <div className="flex items-center gap-2 text-sm font-bold text-[#FDE047]">
                <Sparkles className="w-4 h-4" />
                <span>Your Final Shot, {activePlayer.name}: What was their Secret Word?</span>
              </div>

              {decoyOptions.length > 0 && (
                <div>
                  <div className="text-xs text-[#A1A1AA] mb-2.5">
                    Tap a candidate word below or type your exact guess:
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {decoyOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => onSubmitImposterGuess(option)}
                        className="p-3.5 rounded-xl bg-[#252930] hover:bg-[#FDE047] text-[#FAF8F5] hover:text-[#141619] border border-white/10 font-semibold text-sm transition-colors cursor-pointer text-center"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleCustomGuessSubmit} className="flex gap-2.5">
                <label htmlFor="imposter-word-guess-input" className="sr-only">
                  Guess the Secret Word
                </label>
                <input
                  id="imposter-word-guess-input"
                  type="text"
                  value={customGuess}
                  onChange={(e) => setCustomGuess(e.target.value)}
                  placeholder="Or type the exact Secret Word..."
                  className="flex-1 h-12 px-4 rounded-xl bg-[#141619] border border-white/20 text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#FDE047] text-base"
                />
                <button
                  type="submit"
                  className="h-12 px-5 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-[#FAF8F5] font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Lock Final Guess</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-[#D4D4D8]">
                Waiting for <strong className="text-[#FDE047]">{caughtImposter?.name}</strong> to
                submit their final Secret Word guess...
              </div>
              {caughtImposter && (
                <button
                  type="button"
                  onClick={() => onSwitchActivePlayer(caughtImposter.id)}
                  className="h-10 px-4 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FDE047] border border-[#FDE047]/30 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Switch to {caughtImposter.name}&apos;s Phone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Standard VOTING phase
  const votedCount = room.players.filter((p) => Boolean(p.votedTargetId)).length;
  const myLockedVote = activePlayer.votedTargetId;

  const handleLockVote = (targetId: string) => {
    setSelectedTarget(targetId);
    onCastVote(targetId);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Voting Phase Header */}
      <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs font-mono text-[#E11D48] uppercase tracking-wider">
            Social Deduction Accusation · Category: {room.currentWord?.categoryLabel}
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5]">
            Who Has the Imposter Sticky Note?
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            Discuss everyone&apos;s clues out loud, then tap a suspect below to lock in your vote on your own screen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Live Voting Timer Readout */}
          <div
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-mono tabular-nums flex items-center gap-2 ${
              secondsLeft <= 10
                ? 'bg-[#E11D48]/15 border-[#E11D48] text-[#FDA4AF] font-bold'
                : 'bg-[#141619] border-white/10 text-[#D4D4D8]'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-[#FDE047]" />
            <span>Timer: {secondsLeft}s</span>
            <button
              type="button"
              onClick={() => setSecondsLeft((s) => s + 15)}
              className="ml-1 text-[11px] text-[#FDE047] hover:underline cursor-pointer"
              title="Add 15 seconds to discussion timer"
            >
              +15s
            </button>
          </div>

          <div className="px-4 py-2.5 rounded-xl bg-[#141619] border border-white/10 text-xs font-mono tabular-nums text-[#D4D4D8]">
            Votes Locked: <strong className="text-[#FDE047]">{votedCount}</strong> /{' '}
            {room.players.length}
          </div>

          {votedCount > 0 && (
            <button
              type="button"
              onClick={() => {
                sound.playVotingTimerEnded();
                onForceTallyVotes();
              }}
              className="h-10 px-4 rounded-xl bg-[#E11D48] hover:bg-[#BE123C] text-[#FAF8F5] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Vote className="w-4 h-4" />
              <span>Reveal Votes Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Suspect Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {room.players.map((suspect) => {
          const isMe = suspect.id === activePlayer.id;
          const isChosen = (myLockedVote || selectedTarget) === suspect.id;
          const suspectClues = room.clues.filter((c) => c.playerId === suspect.id);
          const suspicion = suspicionMap[suspect.id];

          return (
            <div
              key={suspect.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isChosen
                  ? 'bg-[#252930] border-[#E11D48] ring-2 ring-[#E11D48]'
                  : 'bg-[#1C1F24] border-white/10 hover:border-white/25'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm text-[#141619] shrink-0"
                      style={{ backgroundColor: suspect.avatarColor }}
                    >
                      {suspect.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-base text-[#FAF8F5] truncate">
                        {suspect.name} {isMe ? '(You)' : ''}
                      </div>
                      <div className="text-xs font-mono text-[#A1A1AA]">
                        {suspect.votedTargetId ? (
                          <span className="text-[#4ADE80]">Vote Locked</span>
                        ) : (
                          <span className="text-[#F59E0B]">Deliberating...</span>
                        )}
                        {suspicion === 'suspect' ? ' · Marked Suspect' : ''}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clues this suspect gave */}
                <div className="space-y-2 mb-5">
                  <div className="text-[11px] font-mono text-[#A1A1AA] uppercase">
                    Pinned Clues:
                  </div>
                  {suspectClues.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suspectClues.map((c) => (
                        <div
                          key={c.id}
                          className="px-3 py-1.5 rounded-lg bg-[#FDE047] text-[#141619] font-display font-bold text-sm"
                        >
                          &ldquo;{c.text}&rdquo;
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#71717A] italic">No written clues</div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleLockVote(suspect.id)}
                className={`w-full h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isChosen
                    ? 'bg-[#E11D48] text-[#FAF8F5]'
                    : 'bg-[#252930] hover:bg-[#E11D48] text-[#FAF8F5] border border-white/10'
                }`}
              >
                {isChosen ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Voted Against {suspect.name}</span>
                  </>
                ) : (
                  <>
                    <Vote className="w-4 h-4" />
                    <span>Vote {suspect.name} as Imposter</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Option: Vote Skip / Tie */}
      <div className="flex items-center justify-between bg-[#1C1F24] border border-white/10 rounded-2xl p-4">
        <div className="text-xs text-[#A1A1AA]">
          Not sure yet? You can change your vote at any time before everyone locks in, or vote to skip elimination.
        </div>
        <button
          type="button"
          onClick={() => handleLockVote('SKIP')}
          className={`h-10 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            myLockedVote === 'SKIP'
              ? 'bg-[#FDE047] text-[#141619]'
              : 'bg-[#252930] hover:bg-[#2F343D] text-[#D4D4D8] border border-white/10'
          }`}
        >
          {myLockedVote === 'SKIP' ? 'Voted to Skip Elimination' : 'Vote Skip / No Elimination'}
        </button>
      </div>
    </div>
  );
};
