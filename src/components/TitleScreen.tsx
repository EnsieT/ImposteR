import React, { useState } from 'react';
import { Users, ArrowRight, Sparkles, BookOpen, Play, Link2 } from 'lucide-react';

interface TitleScreenProps {
  initialRoomCode: string;
  savedName: string;
  error: string | null;
  loading: boolean;
  onCreateRoom: (playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  onQuickStartDemo: (playerName: string) => void;
  onOpenRules: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  initialRoomCode,
  savedName,
  error,
  loading,
  onCreateRoom,
  onJoinRoom,
  onQuickStartDemo,
  onOpenRules,
}) => {
  const [playerName, setPlayerName] = useState(savedName || '');
  const [joinCode, setJoinCode] = useState(initialRoomCode || '');
  const [activeMode, setActiveMode] = useState<'create' | 'join'>(
    initialRoomCode ? 'join' : 'create'
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const [samplePeeled, setSamplePeeled] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setLocalError('Please enter your name so your group knows who you are.');
      return;
    }

    if (activeMode === 'join') {
      const cleanedCode = joinCode.trim().toUpperCase();
      if (cleanedCode.length < 3) {
        setLocalError('Please enter the 4-letter Room Code shared by your host.');
        return;
      }
      onJoinRoom(cleanedCode, trimmedName);
    } else {
      onCreateRoom(trimmedName);
    }
  };

  return (
    <main className="min-h-screen corkboard-surface text-[#FAF8F5] flex flex-col justify-between px-4 sm:px-8 py-6 sm:py-10">
      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Bespoke SVG Emblem, Headline & Interactive Sticky Note Preview */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          <div className="flex items-center gap-3.5">
            {/* Custom Inline SVG Sticky Note Detective Emblem */}
            <svg
              viewBox="0 0 64 64"
              className="w-12 h-12 sm:w-14 sm:h-14 shrink-0"
              aria-hidden="true"
            >
              <rect
                x="6"
                y="8"
                width="48"
                height="48"
                rx="6"
                fill="#FDE047"
                stroke="#141619"
                strokeWidth="3"
              />
              <path
                d="M42 56 L54 44 L42 44 Z"
                fill="#EAB308"
                stroke="#141619"
                strokeWidth="2"
              />
              <circle cx="30" cy="14" r="4" fill="#E11D48" />
              {/* Detective Eyes Silhouette */}
              <rect x="16" y="26" width="12" height="7" rx="3.5" fill="#141619" />
              <rect x="32" y="26" width="12" height="7" rx="3.5" fill="#141619" />
              <line
                x1="28"
                y1="29.5"
                x2="32"
                y2="29.5"
                stroke="#141619"
                strokeWidth="2.5"
              />
              <path
                d="M18 42 Q30 46 42 41"
                stroke="#141619"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="text-xs font-medium text-[#A1A1AA] tracking-wide">
              <span>Multiplayer Party Deduction</span>
              <span className="mx-2" aria-hidden="true">·</span>
              <span>Play Concurrently on Your Own Phone</span>
            </div>
          </div>

          <h1
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#FAF8F5] leading-[1.12]"
            style={{ textWrap: 'balance' }}
          >
            Everyone gets the secret word on a sticky note.{' '}
            <span className="inline-block whitespace-nowrap text-[#FDE047] underline decoration-[#E11D48] decoration-wavy decoration-2 underline-offset-8">
              Except the Imposter.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#D4D4D8] max-w-2xl leading-relaxed">
            Ditch the paper pads and stop passing a single phone around the couch.
            Create a live group room, share the 4-letter code or invite link, and
            receive your private sticky note on your own screen simultaneously.
          </p>

          {/* Interactive Centerpiece: Try Peeling a Sample Sticky Note */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-5">
            <button
              type="button"
              onClick={() => setSamplePeeled((prev) => !prev)}
              className="group relative text-left bg-[#FDE047] text-[#141619] p-5 rounded-xl sticky-note-shadow transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 sm:w-72 shrink-0 cursor-pointer"
              aria-label="Toggle sample sticky note preview"
            >
              {/* Red Thumbtack SVG */}
              <span
                className="w-3.5 h-3.5 rounded-full bg-[#E11D48] border-2 border-[#141619] block mx-auto -mt-2 mb-2 shadow-sm"
                aria-hidden="true"
              />
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#713F12] border-b border-[#141619]/15 pb-1.5 mb-2">
                <span>CATEGORY: FOOD</span>
                <span>{samplePeeled ? 'IMPOSTER VIEW' : 'CITIZEN VIEW'}</span>
              </div>
              {samplePeeled ? (
                <div>
                  <p className="font-display text-2xl font-bold text-[#E11D48] tracking-tight">
                    YOU ARE THE IMPOSTER
                  </p>
                  <p className="text-xs text-[#141619]/80 mt-1">
                    Blend in with a believable 1-word clue &amp; figure out their word!
                  </p>
                </div>
              ) : (
                <div>
                  <p className="font-display text-2xl font-bold text-[#141619] tracking-tight">
                    CROISSANT
                  </p>
                  <p className="text-xs text-[#141619]/80 mt-1">
                    Tap this note to see what the Imposter receives instead →
                  </p>
                </div>
              )}
            </button>

            <div className="space-y-3 text-sm text-[#D4D4D8] flex flex-col justify-center">
              <div className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-[#FDE047]">01.</span>
                <span>
                  <strong className="text-[#FAF8F5]">Join the Group Link:</strong>{' '}
                  Everyone connects from their own phone or browser in seconds.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-[#FDE047]">02.</span>
                <span>
                  <strong className="text-[#FAF8F5]">Drop One-Word Clues:</strong>{' '}
                  Pin clues on the live corkboard or speak them aloud in the room.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="font-mono font-bold text-[#FDE047]">03.</span>
                <span>
                  <strong className="text-[#FAF8F5]">Vote &amp; Steal:</strong>{' '}
                  Catch the Imposter—or let the caught Imposter guess the secret word to steal the win!
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Actions: Instant Practice Game & Rules */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-start="true"
              onClick={() => onQuickStartDemo(playerName.trim() || 'Detective Alex')}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10 text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Play className="w-4 h-4 text-[#FDE047]" />
              <span>Instant Solo / Practice Table</span>
            </button>

            <button
              type="button"
              onClick={onOpenRules}
              className="px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-[#D4D4D8] text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <BookOpen className="w-4 h-4 text-[#A1A1AA]" />
              <span>How to Play</span>
            </button>
          </div>
        </div>

        {/* Right Column: Concurrent Room Creation / Join Card */}
        <div className="lg:col-span-5">
          <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-6 sm:p-8 dossier-card-shadow">
            {/* Segmented Mode Selector */}
            <div
              className="grid grid-cols-2 gap-1.5 p-1 bg-[#141619] rounded-xl mb-6 border border-white/5"
              role="tablist"
              aria-label="Room connection mode"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'create'}
                onClick={() => {
                  setActiveMode('create');
                  setLocalError(null);
                }}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeMode === 'create'
                    ? 'bg-[#FDE047] text-[#141619]'
                    : 'text-[#A1A1AA] hover:text-[#FAF8F5]'
                }`}
              >
                Create Group Room
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeMode === 'join'}
                onClick={() => {
                  setActiveMode('join');
                  setLocalError(null);
                }}
                className={`py-2.5 px-4 rounded-lg text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeMode === 'join'
                    ? 'bg-[#FDE047] text-[#141619]'
                    : 'text-[#A1A1AA] hover:text-[#FAF8F5]'
                }`}
              >
                Join with Code
              </button>
            </div>

            {initialRoomCode && activeMode === 'join' && (
              <div className="mb-5 p-3.5 rounded-xl bg-[#252930] border border-[#FDE047]/30 flex items-center gap-3 text-sm text-[#FAF8F5]">
                <Link2 className="w-4 h-4 text-[#FDE047] shrink-0" />
                <span>
                  Invite link detected for Room{' '}
                  <strong className="font-mono text-[#FDE047]">{initialRoomCode}</strong>.
                  Enter your name below to join!
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="player-name-input"
                  className="block text-sm font-medium text-[#D4D4D8] mb-2"
                >
                  Your Display Name
                </label>
                <input
                  id="player-name-input"
                  type="text"
                  maxLength={24}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g., Jigar, Alex, Maya..."
                  className="w-full h-12 px-4 rounded-xl bg-[#141619] border border-white/15 text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#FDE047] text-base"
                />
              </div>

              {activeMode === 'join' && (
                <div>
                  <label
                    htmlFor="room-code-input"
                    className="block text-sm font-medium text-[#D4D4D8] mb-2"
                  >
                    4-Letter Group Room Code
                  </label>
                  <input
                    id="room-code-input"
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="e.g., NOTE"
                    className="w-full h-12 px-4 rounded-xl bg-[#141619] border border-white/15 text-[#FDE047] font-mono text-xl tracking-widest uppercase placeholder-[#71717A] focus:outline-none focus:border-[#FDE047]"
                  />
                </div>
              )}

              {(localError || error) && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-[#E11D48]/15 border border-[#E11D48]/40 text-sm text-[#FDA4AF]"
                >
                  {localError || error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] font-bold text-base flex items-center justify-center gap-2 transition-transform active:scale-[0.99] cursor-pointer whitespace-nowrap shrink-0"
              >
                {activeMode === 'create' ? (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>{loading ? 'Creating Room...' : 'Create Concurrent Group'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    <span>
                      {loading
                        ? 'Joining Room...'
                        : `Join Group ${joinCode ? `(${joinCode})` : ''}`}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Supports 3 to 12 players per room</span>
              <span>·</span>
              <span>Instant link &amp; code sharing</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Flat Control Hint Line (per game_title_and_hud.md) */}
      <div className="max-w-6xl w-full mx-auto pt-6 text-center sm:text-left text-xs text-[#71717A]">
        Enter / Space Quick Start Practice Table · Hold Sticky Note to Peek · M Mute Audio · Esc Rules &amp; Controls
      </div>
    </main>
  );
};
