import React, { useState } from 'react';
import { Volume2, VolumeX, HelpCircle, LogOut, Copy, Check, Users } from 'lucide-react';
import { RoomState } from '../game/rules';

interface GameHudBarProps {
  room: RoomState;
  activePlayerId: string;
  muted: boolean;
  onSelectActivePlayerId: (id: string) => void;
  onToggleMute: () => void;
  onOpenRules: () => void;
  onLeaveRoom: () => void;
}

export const GameHudBar: React.FC<GameHudBarProps> = ({
  room,
  activePlayerId,
  muted,
  onSelectActivePlayerId,
  onToggleMute,
  onOpenRules,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteUrl).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const phaseLabel: Record<RoomState['phase'], string> = {
    LOBBY: 'GROUP LOBBY',
    ROLE_REVEAL: 'PEEK STICKY NOTES',
    CLUE_ROUNDS: `CLUE ROUND ${room.currentClueRound}/${room.settings.clueRounds}`,
    VOTING: 'SUSPECT VOTE',
    IMPOSTER_GUESS: 'IMPOSTER LAST CHANCE',
    ROUND_SUMMARY: 'ROUND DOSSIER',
  };

  return (
    <div className="w-full bg-[#1C1F24] border-b border-white/10 px-4 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Perimeter Cluster: Room Code + 1-Click Invite Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#141619] border border-white/10 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider">
              ROOM
            </span>
            <span className="font-mono text-lg font-bold text-[#FDE047] tracking-widest tabular-nums">
              {room.code}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyInvite}
            className="h-9 px-3 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Copy group invite link"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span className="text-[#4ADE80]">Invite Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#FDE047]" />
                <span>Copy Invite Link</span>
              </>
            )}
          </button>
        </div>

        {/* Center Perimeter Readout: Live Phase, Round & Player Count */}
        <div className="hidden md:flex items-center gap-4 text-xs text-[#D4D4D8] font-mono tabular-nums">
          <div>
            <span className="text-[#A1A1AA]">PHASE </span>
            <strong className="text-[#FAF8F5]">{phaseLabel[room.phase]}</strong>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="text-[#A1A1AA]">ROUND </span>
            <strong className="text-[#FAF8F5]">{Math.max(1, room.roundNumber)}</strong>
          </div>
          <span aria-hidden="true">·</span>
          <div>
            <span className="text-[#A1A1AA]">PLAYERS </span>
            <strong className="text-[#FAF8F5]">{room.players.length}</strong>
          </div>
        </div>

        {/* Right Perimeter Utility Cluster: Seat View Switcher + Audio/Rules/Leave */}
        <div className="flex items-center gap-2">
          {/* Seat Perspective Selector (lets users test concurrent phones on 1 screen or switch to their seat) */}
          {room.players.length > 1 && (
            <div className="flex items-center gap-1.5 bg-[#141619] border border-white/10 rounded-xl px-2.5 h-9">
              <Users className="w-3.5 h-3.5 text-[#FDE047] shrink-0" aria-hidden="true" />
              <label htmlFor="seat-perspective-select" className="sr-only">
                Viewing as player
              </label>
              <select
                id="seat-perspective-select"
                value={activePlayerId}
                onChange={(e) => onSelectActivePlayerId(e.target.value)}
                className="bg-transparent text-xs font-medium text-[#FAF8F5] focus:outline-none cursor-pointer pr-1 max-w-[140px] truncate"
                title="Switch device perspective to test multi-phone gameplay"
              >
                {room.players.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#1C1F24] text-[#FAF8F5]">
                    Phone: {p.name} {p.isBot ? '(Bot)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={muted ? 'Unmute audio [M]' : 'Mute audio [M]'}
            title={muted ? 'Unmute audio [M]' : 'Mute audio [M]'}
            className="w-9 h-9 rounded-xl bg-[#252930] hover:bg-[#2F343D] border border-white/10 flex items-center justify-center text-[#D4D4D8] hover:text-[#FAF8F5] transition-colors cursor-pointer shrink-0"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onOpenRules();
            }}
            aria-label="Game Rules and Pause [P]"
            title="Game Rules and Pause [P]"
            className="w-9 h-9 rounded-xl bg-[#252930] hover:bg-[#2F343D] border border-white/10 flex items-center justify-center text-[#D4D4D8] hover:text-[#FAF8F5] transition-colors cursor-pointer shrink-0"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            type="button"
            tabIndex={-1}
            onClick={(e) => {
              e.currentTarget.blur();
              onLeaveRoom();
            }}
            aria-label="Leave Room"
            title="Leave Room"
            className="h-9 px-3 rounded-xl bg-[#252930] hover:bg-[#E11D48]/20 border border-white/10 hover:border-[#E11D48]/40 flex items-center gap-1.5 text-xs font-medium text-[#D4D4D8] hover:text-[#FDA4AF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>
    </div>
  );
};
