import React from 'react';
import { X, Play, RotateCcw, Home } from 'lucide-react';
import { GameSoundEvent } from '../utils/soundEvents';

interface RulesModalProps {
  isOpen: boolean;
  isInRoom: boolean;
  onClose: () => void;
  onRestartRound?: () => void;
  onLeaveToTitle?: () => void;
  onPreviewSound?: (event: GameSoundEvent) => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  isInRoom,
  onClose,
  onRestartRound,
  onLeaveToTitle,
  onPreviewSound,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-modal-title"
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
    >
      <div className="bg-[#1C1F24] border border-white/15 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 dossier-card-shadow space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-mono text-[#FDE047] uppercase tracking-wider">
              {isInRoom ? 'Game Paused · Rules & Controls' : 'Official Sticky Note Rules'}
            </div>
            <h2
              id="rules-modal-title"
              className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5]"
            >
              How to Play Sticky Note Imposter
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rules dialog"
            className="w-9 h-9 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#D4D4D8] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-[#D4D4D8] leading-relaxed">
          <div className="p-3.5 rounded-xl bg-[#141619] border border-white/10">
            <strong className="text-[#FDE047] block mb-1">
              1. Concurrent Sticky Notes (No Phone Passing)
            </strong>
            One player creates a Group Room and shares the 4-letter Room Code or Invite Link.
            Every player receives a folded Sticky Note on their own screen simultaneously.
          </div>

          <div className="p-3.5 rounded-xl bg-[#141619] border border-white/10">
            <strong className="text-[#FDE047] block mb-1">
              2. Citizens vs. The Imposter
            </strong>
            All <strong className="text-[#4ADE80]">Citizens</strong> see the Category and the
            exact Secret Word (e.g., <em>&ldquo;Croissant&rdquo;</em>). One secret{' '}
            <strong className="text-[#FDA4AF]">Imposter</strong> only sees the Category (and an
            optional sub-topic vibe hint).
          </div>

          <div className="p-3.5 rounded-xl bg-[#141619] border border-white/10">
            <strong className="text-[#FDE047] block mb-1">
              3. One-Word Clues
            </strong>
            Going in turn order, each player pins a 1-word clue onto the shared corkboard (or
            speaks it out loud). Citizens want their clue to be specific enough that other Citizens
            trust them, but vague enough that the Imposter cannot easily guess the Secret Word!
          </div>

          <div className="p-3.5 rounded-xl bg-[#141619] border border-white/10">
            <strong className="text-[#FDE047] block mb-1">
              4. The Vote &amp; Imposter Steal
            </strong>
            Everyone votes concurrently on who they suspect is the Imposter. If the Imposter escapes
            the vote, the Imposter wins (+3 pts). If the Imposter is caught, they get{' '}
            <strong>one final chance to guess the Secret Word</strong> to steal the victory!
          </div>

          <div className="p-3.5 rounded-xl bg-[#141619] border border-white/10 space-y-2.5">
            <strong className="text-[#FDE047] block text-xs font-mono uppercase tracking-wider">
              Audio Cues Preview (Synthesized Game Events)
            </strong>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => onPreviewSound?.('ROLE_REVEALED_CITIZEN')}
                className="py-2 px-2.5 rounded-lg bg-[#252930] hover:bg-[#2F343D] text-xs font-medium text-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Role Revealed
              </button>
              <button
                type="button"
                onClick={() => onPreviewSound?.('CLUE_SUBMITTED')}
                className="py-2 px-2.5 rounded-lg bg-[#252930] hover:bg-[#2F343D] text-xs font-medium text-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Clue Submitted
              </button>
              <button
                type="button"
                onClick={() => onPreviewSound?.('VOTING_TIMER_ENDED')}
                className="py-2 px-2.5 rounded-lg bg-[#252930] hover:bg-[#2F343D] text-xs font-medium text-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Voting Timer End
              </button>
              <button
                type="button"
                onClick={() => onPreviewSound?.('ROUND_VICTORY')}
                className="py-2 px-2.5 rounded-lg bg-[#252930] hover:bg-[#2F343D] text-xs font-medium text-[#FAF8F5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Victory Fanfare
              </button>
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-end gap-3 border-t border-white/10">
          {isInRoom && onRestartRound && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onRestartRound();
              }}
              className="h-10 px-4 rounded-xl bg-[#252930] hover:bg-[#2F343D] text-[#FAF8F5] border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4 text-[#FDE047]" />
              <span>Deal New Sticky Notes</span>
            </button>
          )}

          {isInRoom && onLeaveToTitle && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLeaveToTitle();
              }}
              className="h-10 px-4 rounded-xl bg-[#252930] hover:bg-[#E11D48]/20 text-[#D4D4D8] hover:text-[#FDA4AF] border border-white/10 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Home className="w-4 h-4" />
              <span>Title Screen</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-[#FDE047] hover:bg-[#FACC15] text-[#141619] text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isInRoom ? 'Resume Game' : 'Got It, Let’s Play'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
