import React, { useState } from 'react';
import {
  UserPlus,
  Trash2,
  Play,
  Copy,
  Check,
  Plus,
  Sparkles,
  ShieldAlert,
  Share2,
} from 'lucide-react';
import { RoomState, RoomSettings } from '../game/rules';
import { CATEGORIES, CategoryId } from '../game/words';

interface LobbyViewProps {
  room: RoomState;
  activePlayerId: string;
  error: string | null;
  onUpdateSettings: (partial: Partial<RoomSettings>) => void;
  onAddBot: () => void;
  onJoinAdditionalPlayer: (name: string) => void;
  onRemovePlayer: (targetId: string) => void;
  onStartRound: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  activePlayerId,
  error,
  onUpdateSettings,
  onAddBot,
  onJoinAdditionalPlayer,
  onRemovePlayer,
  onStartRound,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [customWordInput, setCustomWordInput] = useState('');
  const [quickJoinName, setQuickJoinName] = useState('');

  const shareUrl = `${window.location.origin}${window.location.pathname}?room=${room.code}`;

  const handleCopyShareUrl = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddCustomWord = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = customWordInput.trim();
    if (!cleaned) return;
    const nextWords = Array.from(new Set([...room.settings.customWords, cleaned]));
    onUpdateSettings({
      category: 'custom',
      customWords: nextWords,
    });
    setCustomWordInput('');
  };

  const handleRemoveCustomWord = (wordToRemove: string) => {
    const nextWords = room.settings.customWords.filter((w) => w !== wordToRemove);
    onUpdateSettings({ customWords: nextWords });
  };

  const handleQuickAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickJoinName.trim();
    if (!trimmed) return;
    onJoinAdditionalPlayer(trimmed);
    setQuickJoinName('');
  };

  const canStart = room.players.length >= 3;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Top Invite & Room Code Banner */}
      <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-5 sm:p-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="text-xs font-mono text-[#FDE047] tracking-wider uppercase">
            Concurrent Group Room Ready · No Phone Passing Needed
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5]">
            Share Code{' '}
            <span className="font-mono text-[#FDE047] underline decoration-[#FDE047]/40 underline-offset-4">
              {room.code}
            </span>{' '}
            with Your Group
          </h2>
          <p className="text-sm text-[#A1A1AA]">
            Friends can open this link on their own phones to receive their sticky note simultaneously.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="px-3.5 py-2.5 rounded-xl bg-[#141619] border border-white/10 font-mono text-xs text-[#D4D4D8] max-w-[260px] sm:max-w-xs truncate">
            {shareUrl}
          </div>
          <button
            type="button"
            onClick={handleCopyShareUrl}
            className="h-10 px-4 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Copy Group Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-xl bg-[#E11D48]/15 border border-[#E11D48]/40 text-sm text-[#FDA4AF]"
        >
          {error}
        </div>
      )}

      {/* Main 2-Column Lobby Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Connected Players Roster & Seat Controls */}
        <div className="lg:col-span-5 bg-[#1C1F24] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#FAF8F5]">
                Players in Group ({room.players.length}/12)
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Minimum 3 players required to deal sticky notes
              </p>
            </div>
            <button
              type="button"
              onClick={onAddBot}
              className="px-3 py-2 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FDE047] border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add AI Suspect</span>
            </button>
          </div>

          {/* Player List */}
          <div className="space-y-2.5">
            {room.players.map((player, index) => {
              const isMe = player.id === activePlayerId;
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isMe
                      ? 'bg-[#252930] border-[#FDE047]/40'
                      : 'bg-[#141619] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-sm text-[#141619] shrink-0"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#FAF8F5] truncate">
                          {player.name}
                        </span>
                        <span className="text-xs text-[#A1A1AA]">
                          {isMe ? '· You' : ''}
                          {player.isHost ? ' · Host' : ''}
                          {player.isBot ? ' · AI Bot' : ''}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[#A1A1AA] tabular-nums">
                        Score: {player.score} pts
                      </div>
                    </div>
                  </div>

                  {room.players.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemovePlayer(player.id)}
                      aria-label={`Remove ${player.name}`}
                      className="w-8 h-8 rounded-lg hover:bg-[#E11D48]/20 text-[#71717A] hover:text-[#FDA4AF] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Local Seat / Simulate Friend Joining */}
          <form onSubmit={handleQuickAddFriend} className="pt-2 border-t border-white/10">
            <label
              htmlFor="quick-add-friend-input"
              className="block text-xs font-medium text-[#A1A1AA] mb-2"
            >
              Add a Friend Seat Directly (or let them join via Room Code {room.code})
            </label>
            <div className="flex gap-2">
              <input
                id="quick-add-friend-input"
                type="text"
                maxLength={24}
                value={quickJoinName}
                onChange={(e) => setQuickJoinName(e.target.value)}
                placeholder="Friend's name (e.g., Priya)..."
                className="flex-1 h-10 px-3.5 rounded-xl bg-[#141619] border border-white/15 text-sm text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#FDE047]"
              />
              <button
                type="submit"
                className="h-10 px-3.5 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Seat</span>
              </button>
            </div>
          </form>

          {/* Primary Deal Sticky Notes Button */}
          <div className="pt-2">
            <button
              type="button"
              data-start="true"
              onClick={onStartRound}
              className={`w-full h-13 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                canStart
                  ? 'bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] shadow-lg'
                  : 'bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/15'
              }`}
            >
              <Play className="w-5 h-5 fill-current" />
              <span>
                {canStart
                  ? `Deal Sticky Notes (${room.players.length} Players)`
                  : `Need ${3 - room.players.length} More Player${3 - room.players.length === 1 ? '' : 's'} to Start`}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column (7 cols): Sticky Note Word Packs & Round Rules */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Selection Grid */}
          <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="font-display text-xl font-bold text-[#FAF8F5]">
                01. Choose Sticky Note Word Deck
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Everyone sees the Category name—only Citizens get the exact Secret Word
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = room.settings.category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onUpdateSettings({ category: cat.id as CategoryId })}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#252930] border-[#FDE047] ring-1 ring-[#FDE047]'
                        : 'bg-[#141619] border-white/10 hover:border-white/25'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-semibold text-sm text-[#FAF8F5]">
                        {cat.label}
                      </span>
                      <span className="text-xs font-mono text-[#FDE047]">
                        {cat.countLabel}
                      </span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] line-clamp-1">
                      {cat.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Group Words Builder */}
            {room.settings.category === 'custom' && (
              <div className="p-4 rounded-xl bg-[#141619] border border-[#FDE047]/30 space-y-3">
                <form onSubmit={handleAddCustomWord} className="flex gap-2">
                  <label htmlFor="custom-word-input" className="sr-only">
                    Add custom secret word
                  </label>
                  <input
                    id="custom-word-input"
                    type="text"
                    maxLength={32}
                    value={customWordInput}
                    onChange={(e) => setCustomWordInput(e.target.value)}
                    placeholder="Add custom word (e.g., Goa Trip, Chai Tapri, Boss's Car)..."
                    className="flex-1 h-10 px-3.5 rounded-xl bg-[#1C1F24] border border-white/15 text-sm text-[#FAF8F5] placeholder-[#71717A] focus:outline-none focus:border-[#FDE047]"
                  />
                  <button
                    type="submit"
                    className="h-10 px-4 rounded-xl bg-[#FDE047] text-[#141619] font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Word</span>
                  </button>
                </form>

                {room.settings.customWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {room.settings.customWords.map((word) => (
                      <div
                        key={word}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#252930] text-xs text-[#FAF8F5]"
                      >
                        <span>{word}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomWord(word)}
                          aria-label={`Delete custom word ${word}`}
                          className="text-[#A1A1AA] hover:text-[#FDA4AF] cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#A1A1AA]">
                    Add at least 1 custom word above, or we will draw from Shuffle All Packs.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* House Rules Configuration */}
          <div className="bg-[#1C1F24] border border-white/10 rounded-2xl p-6 space-y-5">
            <div>
              <h3 className="font-display text-xl font-bold text-[#FAF8F5]">
                02. Sticky Note House Rules
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                Tune deduction difficulty for your group
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clue Rounds Selector */}
              <div className="p-4 rounded-xl bg-[#141619] border border-white/10 space-y-2">
                <div className="text-sm font-semibold text-[#FAF8F5]">
                  Clue Rounds Before Vote
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  How many sticky-note clues each player gives before voting
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[1, 2].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => onUpdateSettings({ clueRounds: count })}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        room.settings.clueRounds === count
                          ? 'bg-[#FDE047] text-[#141619]'
                          : 'bg-[#252930] text-[#D4D4D8] hover:text-[#FAF8F5]'
                      }`}
                    >
                      {count} {count === 1 ? 'Clue Round' : 'Clue Rounds'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Imposter Vibe Hint Toggle */}
              <div className="p-4 rounded-xl bg-[#141619] border border-white/10 space-y-2">
                <div className="text-sm font-semibold text-[#FAF8F5]">
                  Imposter Vibe Hint
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Gives the Imposter a subtle sub-topic hint (e.g., &ldquo;Kitchen Counter&rdquo;)
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ imposterVibeHint: true })}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      room.settings.imposterVibeHint
                        ? 'bg-[#FDE047] text-[#141619]'
                        : 'bg-[#252930] text-[#D4D4D8] hover:text-[#FAF8F5]'
                    }`}
                  >
                    Vibe Hint ON
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ imposterVibeHint: false })}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      !room.settings.imposterVibeHint
                        ? 'bg-[#E11D48] text-[#FAF8F5]'
                        : 'bg-[#252930] text-[#D4D4D8] hover:text-[#FAF8F5]'
                    }`}
                  >
                    Hardcore (Blind)
                  </button>
                </div>
              </div>
            </div>

            {/* Safe First Turn Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#141619] border border-white/10">
              <div className="pr-4">
                <div className="text-sm font-semibold text-[#FAF8F5] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#FDE047]" />
                  <span>Protect Imposter from Going First</span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Ensures a Citizen always gives the 1st clue so the Imposter has at least one clue to go off of.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={room.settings.imposterSafeFirstTurn}
                onClick={() =>
                  onUpdateSettings({
                    imposterSafeFirstTurn: !room.settings.imposterSafeFirstTurn,
                  })
                }
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  room.settings.imposterSafeFirstTurn
                    ? 'bg-[#4ADE80] text-[#141619]'
                    : 'bg-[#252930] text-[#A1A1AA]'
                }`}
              >
                {room.settings.imposterSafeFirstTurn ? 'Enabled' : 'Random 1st'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
