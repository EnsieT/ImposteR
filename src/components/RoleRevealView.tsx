import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, CheckCircle2, ArrowRight, ShieldAlert } from 'lucide-react';
import { RoomState, Player } from '../game/rules';
import { sound } from '../utils/sound';

interface RoleRevealViewProps {
  room: RoomState;
  activePlayer: Player;
  onMarkReady: (forceAll?: boolean) => void;
}

export const RoleRevealView: React.FC<RoleRevealViewProps> = ({
  room,
  activePlayer,
  onMarkReady,
}) => {
  const [isPeeking, setIsPeeking] = useState(false);

  // Reset peek state when switching activePlayerId (so switching phone view doesn't accidentally spoil another seat's role)
  useEffect(() => {
    setIsPeeking(false);
  }, [activePlayer.id, room.roundNumber]);

  const togglePeek = () => {
    setIsPeeking((prev) => {
      const next = !prev;
      if (next) {
        sound.playRoleReveal(activePlayer.role);
      } else {
        sound.playPeel();
      }
      return next;
    });
  };

  const isImposter = activePlayer.role === 'IMPOSTER';
  const categoryLabel = room.currentWord?.categoryLabel || 'General';
  const secretWord = room.currentWord?.word || 'Mystery';
  const vibeHint = room.currentWord?.vibeHint || 'Everyday';
  const firstSpeaker = room.players.find((p) => p.id === room.turnOrder[0]);

  const readyCount = room.players.filter((p) => p.readyInReveal).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col items-center">
      {/* Phase Header */}
      <div className="text-center max-w-xl mb-6 space-y-2">
        <div className="text-xs font-mono text-[#FDE047] uppercase tracking-wider">
          Round {room.roundNumber} · Private Sticky Note Dealt to {activePlayer.name}
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF8F5]">
          Check Your Secret Sticky Note
        </h2>
        <p className="text-sm text-[#A1A1AA]">
          Keep your phone angled toward you. Tap the sticky note below to peel it open,
          memorize your word or role, then fold it back down.
        </p>
      </div>

      {/* Tactile Sticky Note Centerpiece */}
      <div className="w-full max-w-md my-2">
        {!isPeeking ? (
          <button
            type="button"
            onClick={togglePeek}
            className="w-full min-h-[290px] rounded-2xl bg-[#252930] hover:bg-[#2E333D] border-2 border-dashed border-[#FDE047]/50 p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer dossier-card-shadow group"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#FDE047]/15 border border-[#FDE047]/40 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Eye className="w-8 h-8 text-[#FDE047]" />
            </div>
            <span className="font-display text-2xl font-bold text-[#FAF8F5] mb-2">
              Tap to Peel Sticky Note
            </span>
            <span className="text-xs font-mono text-[#FDE047] uppercase tracking-wider">
              Viewing as {activePlayer.name} · Anti-Peek Privacy Cover
            </span>
            <p className="text-xs text-[#A1A1AA] mt-4 max-w-xs">
              Category for this round: <strong className="text-[#FAF8F5]">{categoryLabel}</strong>
            </p>
          </button>
        ) : (
          <div
            className={`w-full min-h-[290px] rounded-2xl p-7 flex flex-col justify-between sticky-note-shadow transition-all ${
              isImposter
                ? 'bg-[#FDE047] text-[#141619] ring-4 ring-[#E11D48]'
                : 'bg-[#FDE047] text-[#141619]'
            }`}
          >
            {/* Top Thumbtack & Category Header */}
            <div>
              <div className="w-4 h-4 rounded-full bg-[#E11D48] border-2 border-[#141619] mx-auto -mt-3 mb-3 shadow-sm" />
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#713F12] border-b border-[#141619]/15 pb-2">
                <span>CATEGORY: {categoryLabel.toUpperCase()}</span>
                <span>{activePlayer.name.toUpperCase()}</span>
              </div>
            </div>

            {/* Secret Content */}
            {isImposter ? (
              <div className="my-5 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-widest text-[#E11D48]">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Secret Assignment</span>
                </div>
                <div className="font-display text-3xl sm:text-4xl font-bold text-[#E11D48] tracking-tight leading-tight">
                  YOU ARE THE IMPOSTER
                </div>
                {room.settings.imposterVibeHint && (
                  <div className="text-xs font-mono font-semibold text-[#141619] pt-1">
                    Sub-Topic Vibe Hint: <span className="underline">{vibeHint}</span>
                  </div>
                )}
                <p className="text-xs text-[#141619]/80 pt-1 max-w-xs mx-auto leading-relaxed">
                  Everyone else sees the exact Secret Word in <strong>{categoryLabel}</strong>.
                  Listen to their clues, blend in, and deduce the word!
                </p>
              </div>
            ) : (
              <div className="my-5 text-center space-y-2">
                <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#713F12]">
                  Citizen · Your Secret Word Is
                </div>
                <div className="font-display text-4xl sm:text-5xl font-bold text-[#141619] tracking-tight">
                  {secretWord}
                </div>
                <p className="text-xs text-[#141619]/80 pt-2 max-w-xs mx-auto leading-relaxed">
                  Give a clever 1-word clue that proves to other Citizens you know{' '}
                  <strong>{secretWord}</strong> without making it too obvious for the Imposter!
                </p>
              </div>
            )}

            {/* Hide Note Button */}
            <button
              type="button"
              onClick={togglePeek}
              className="w-full py-2.5 px-4 rounded-xl bg-[#141619] text-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#252930] transition-colors cursor-pointer"
            >
              <EyeOff className="w-4 h-4 text-[#FDE047]" />
              <span>Fold Note Back Down (Hide Screen)</span>
            </button>
          </div>
        )}
      </div>

      {/* Confirm Ready & Group Readiness Status */}
      <div className="w-full max-w-md mt-6 space-y-5">
        {!activePlayer.readyInReveal ? (
          <button
            type="button"
            onClick={() => onMarkReady(false)}
            className="w-full h-12 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] font-bold text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>I&apos;ve Memorized My Sticky Note (Ready)</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-[#1C1F24] border border-[#4ADE80]/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-[#4ADE80] font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>You are ready! Waiting for group ({readyCount}/{room.players.length})</span>
            </div>
            <button
              type="button"
              onClick={() => onMarkReady(true)}
              className="px-3 py-1.5 rounded-lg bg-[#252930] hover:bg-[#2F343D] text-xs font-semibold text-[#FAF8F5] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Begin Clues Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Who is ready in the room */}
        <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
            <span>Group Readiness ({readyCount} of {room.players.length} Ready)</span>
            {firstSpeaker && (
              <span>
                1st Speaker: <strong className="text-[#FDE047]">{firstSpeaker.name}</strong>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {room.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#141619] border border-white/5 text-xs"
              >
                <span className="truncate font-medium text-[#FAF8F5]">{p.name}</span>
                <span
                  className={`font-mono text-[11px] shrink-0 ml-2 ${
                    p.readyInReveal ? 'text-[#4ADE80]' : 'text-[#F59E0B]'
                  }`}
                >
                  {p.readyInReveal ? 'Ready' : 'Peeking'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
