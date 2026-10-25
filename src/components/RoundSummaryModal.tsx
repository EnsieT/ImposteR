import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ShieldAlert, Play, Settings, Award } from 'lucide-react';
import { RoomState, Player } from '../game/rules';
import { sound } from '../utils/sound';

interface RoundSummaryModalProps {
  room: RoomState;
  activePlayer: Player;
  onNextRound: () => void;
  onBackToLobby: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  room,
  activePlayer,
  onNextRound,
  onBackToLobby,
}) => {
  const result = room.lastResult;

  useEffect(() => {
    if (!result) return;
    const isCitizenWin = result.winner === 'CITIZENS';
    const amIImposter = activePlayer.role === 'IMPOSTER';
    const didIWin =
      (isCitizenWin && !amIImposter) || (!isCitizenWin && amIImposter);

    if (didIWin) {
      try {
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.6 },
        });
      } catch {
        // Ignore confetti errors in headless browsers
      }
    }
  }, [result, activePlayer.role]);

  if (!result) return null;

  const isCitizensWin = result.winner === 'CITIZENS';
  const imposters = room.players.filter((p) => result.imposterIds.includes(p.id));
  const sortedLeaderboard = [...room.players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-[#1C1F24] border border-white/15 rounded-2xl p-6 sm:p-8 dossier-card-shadow space-y-8">
        {/* Outcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest">
              {isCitizensWin ? (
                <span className="text-[#4ADE80] flex items-center gap-1.5 font-bold">
                  <Trophy className="w-4 h-4" />
                  Round {room.roundNumber} Complete · Citizens Victory
                </span>
              ) : (
                <span className="text-[#FDA4AF] flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-4 h-4 text-[#E11D48]" />
                  Round {room.roundNumber} Complete · Imposter Victory
                </span>
              )}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#FAF8F5]">
              {result.headline}
            </h2>
            <p className="text-sm sm:text-base text-[#D4D4D8] max-w-2xl">
              {result.subheadline}
            </p>
          </div>

          {/* Primary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              data-start="true"
              onClick={onNextRound}
              className="h-12 px-6 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] font-bold text-sm flex items-center gap-2 transition-transform active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Deal Next Sticky Note</span>
            </button>

            <button
              type="button"
              onClick={onBackToLobby}
              className="h-12 px-4 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Settings className="w-4 h-4 text-[#A1A1AA]" />
              <span>Deck &amp; Lobby Settings</span>
            </button>
          </div>
        </div>

        {/* 3 Tabular Stat Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-[#FDE047] text-[#141619] sticky-note-shadow">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#713F12]">
              THE SECRET WORD ({result.categoryLabel})
            </div>
            <div className="font-display text-3xl font-bold mt-1 tracking-tight">
              {result.secretWord}
            </div>
            {result.imposterGuessText && (
              <div className="text-xs font-mono mt-1.5 text-[#141619]/80">
                Imposter Guessed: &ldquo;{result.imposterGuessText}&rdquo;
              </div>
            )}
          </div>

          <div className="p-5 rounded-xl bg-[#141619] border border-[#E11D48]/40">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FDA4AF]">
              UNMASKED IMPOSTER
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-[#FAF8F5]">
              {imposters.map((i) => i.name).join(' & ') || 'Unknown'}
            </div>
            <div className="text-xs font-mono text-[#A1A1AA] mt-1.5 tabular-nums">
              {result.winner === 'CITIZENS'
                ? 'Caught by group vote'
                : result.winner === 'IMPOSTER_GUESSED'
                ? 'Caught, then guessed the word (+3 pts)'
                : 'Escaped vote undetected (+3 pts)'}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#141619] border border-white/10">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#A1A1AA]">
              ROOM LEADERBOARD #1
            </div>
            <div className="font-display text-2xl sm:text-3xl font-bold mt-1 text-[#FDE047] tabular-nums">
              {sortedLeaderboard[0]?.name} · {sortedLeaderboard[0]?.score || 0} pts
            </div>
            <div className="text-xs font-mono text-[#A1A1AA] mt-1.5 tabular-nums">
              Round {room.roundNumber} · {room.players.length} Concurrent Players
            </div>
          </div>
        </div>

        {/* Full Scoreboard & Vote Dossier */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#FAF8F5]">
            <Award className="w-4 h-4 text-[#FDE047]" />
            <span>Round Dossier: Clues, Votes &amp; Group Standings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedLeaderboard.map((p, idx) => {
              const wasImposter = result.imposterIds.includes(p.id);
              const votedForId = result.voteBreakdown[p.id];
              const votedForName =
                votedForId === 'SKIP'
                  ? 'Skipped'
                  : room.players.find((target) => target.id === votedForId)?.name || 'No Vote';
              const delta = result.scoreDeltas[p.id] || 0;
              const playerClues = room.clues
                .filter((c) => c.playerId === p.id)
                .map((c) => `"${c.text}"`)
                .join(', ');

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                    wasImposter
                      ? 'bg-[#252930] border-[#E11D48]/50'
                      : 'bg-[#141619] border-white/10'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-sm text-[#FAF8F5] truncate">
                        {p.name}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold ${
                          wasImposter ? 'text-[#FDA4AF]' : 'text-[#4ADE80]'
                        }`}
                      >
                        · {wasImposter ? 'IMPOSTER' : 'CITIZEN'}
                      </span>
                    </div>
                    <div className="text-xs text-[#A1A1AA] truncate">
                      Clues: <span className="text-[#FAF8F5]">{playerClues || 'None'}</span> ·
                      Voted: <span className="text-[#FDE047]">{votedForName}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono tabular-nums">
                    <div className="text-base font-bold text-[#FAF8F5]">
                      {p.score} pts
                    </div>
                    <div
                      className={`text-xs font-semibold ${
                        delta > 0 ? 'text-[#4ADE80]' : 'text-[#71717A]'
                      }`}
                    >
                      {delta > 0 ? `+${delta} this round` : '+0'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
