import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RoomState, RoomSettings } from './game/rules';
import { TitleScreen } from './components/TitleScreen';
import { GameHudBar } from './components/GameHudBar';
import { LobbyView } from './components/LobbyView';
import { RoleRevealView } from './components/RoleRevealView';
import { ClueBoardView } from './components/ClueBoardView';
import { VotingView } from './components/VotingView';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { RulesModal } from './components/RulesModal';
import { sound } from './utils/sound';
import { useGameSoundEffects } from './hooks/useGameSoundEffects';
import {
  staticCreateRoom,
  staticJoinRoom,
  staticAutostartRoom,
  staticPerformAction,
  subscribeStaticRoom,
} from './utils/clientRoomFallback';

function getOrCreateTabPlayerId(): string {
  try {
    const existing = sessionStorage.getItem('imposter_tab_player_id');
    if (existing) return existing;
    const created = `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    sessionStorage.setItem('imposter_tab_player_id', created);
    return created;
  } catch {
    return `p-${Date.now().toString(36)}`;
  }
}

export default function App() {
  const [myPlayerId] = useState<string>(() => getOrCreateTabPlayerId());
  const [activePlayerId, setActivePlayerId] = useState<string>(() => myPlayerId);
  const [savedName, setSavedName] = useState<string>(() => {
    try {
      return localStorage.getItem('imposter_player_name') || '';
    } catch {
      return '';
    }
  });

  const [initialRoomCode] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('room') || '').toUpperCase().trim();
  });

  const [room, setRoom] = useState<RoomState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [suspicionMap, setSuspicionMap] = useState<
    Record<string, 'suspect' | 'cleared' | undefined>
  >({});

  const wsRef = useRef<WebSocket | null>(null);

  // Sync document.body.dataset.state with game state machine
  useEffect(() => {
    if (rulesOpen) {
      document.body.dataset.state = 'paused';
    } else if (!room) {
      document.body.dataset.state = 'title';
    } else if (room.phase === 'ROUND_SUMMARY') {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [room, rulesOpen]);

  // Keep activePlayerId valid if room roster changes
  useEffect(() => {
    if (!room) return;
    const exists = room.players.some((p) => p.id === activePlayerId);
    if (!exists) {
      const me = room.players.find((p) => p.id === myPlayerId) || room.players[0];
      if (me) setActivePlayerId(me.id);
    }
  }, [room, activePlayerId, myPlayerId]);

  // Clear suspicion notes when a new round begins
  useEffect(() => {
    setSuspicionMap({});
  }, [room?.roundNumber]);

  const updateUrlRoomParam = (code: string | null) => {
    try {
      const url = new URL(window.location.href);
      if (code) {
        url.searchParams.set('room', code);
        url.searchParams.delete('autostart');
      } else {
        url.searchParams.delete('room');
        url.searchParams.delete('autostart');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore history API errors
    }
  };

  const handleQuickStartDemo = useCallback(
    async (playerName: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/rooms/autostart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: myPlayerId,
            playerName: playerName || 'Detective Alex',
          }),
        });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          const fallbackRoom = staticAutostartRoom(
            myPlayerId,
            playerName || 'Detective Alex'
          );
          setRoom(fallbackRoom);
          setActivePlayerId(myPlayerId);
          updateUrlRoomParam(fallbackRoom.code);
          return;
        }
        const data = await res.json();
        if (data.room) {
          setRoom(data.room);
          setActivePlayerId(myPlayerId);
          updateUrlRoomParam(data.room.code);
        }
      } catch {
        const fallbackRoom = staticAutostartRoom(
          myPlayerId,
          playerName || 'Detective Alex'
        );
        setRoom(fallbackRoom);
        setActivePlayerId(myPlayerId);
        updateUrlRoomParam(fallbackRoom.code);
      } finally {
        setLoading(false);
      }
    },
    [myPlayerId]
  );

  // Check ?autostart=1 on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      handleQuickStartDemo(savedName || 'Detective Alex');
    }
  }, [handleQuickStartDemo, savedName]);

  // WebSocket subscription + fallback HTTP sync + static BroadcastChannel sync while in a room
  useEffect(() => {
    const roomCode = room?.code;
    if (!roomCode) return;

    let isDisposed = false;
    const unsubscribeStatic = subscribeStaticRoom(roomCode, (updatedRoom) => {
      if (!isDisposed) {
        setRoom((prev) =>
          !prev || updatedRoom.updatedAt >= prev.updatedAt ? updatedRoom : prev
        );
      }
    });

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const connectWs = () => {
      if (isDisposed) return;
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              type: 'subscribe',
              roomCode,
              playerId: myPlayerId,
            })
          );
        };

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data);
            if (msg.type === 'room:updated' && msg.room) {
              setRoom(msg.room);
            }
          } catch {
            // Ignore parse error
          }
        };

        ws.onclose = () => {
          if (!isDisposed) {
            setTimeout(connectWs, 3500);
          }
        };
      } catch {
        // Fallback poll or static sync handles synchronization if WS is blocked
      }
    };

    connectWs();

    const pollInterval = setInterval(async () => {
      if (isDisposed) return;
      try {
        const res = await fetch(`/api/rooms/${roomCode}`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.room) {
            setRoom((prev) =>
              !prev || data.room.updatedAt >= prev.updatedAt ? data.room : prev
            );
          }
        }
      } catch {
        // Ignore transient network poll error
      }
    }, 2500);

    return () => {
      isDisposed = true;
      unsubscribeStatic();
      clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [room?.code, myPlayerId]);

  // Global keyboard shortcuts (Enter/Space on Title, Esc/P for Pause/Rules, M for Mute)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (isInputFocused) return;

      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setRulesOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setMuted((prev) => {
          const next = !prev;
          sound.muted = next;
          return next;
        });
      } else if (!room && !rulesOpen && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        handleQuickStartDemo(savedName || 'Detective Alex');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [room, rulesOpen, savedName, handleQuickStartDemo]);

  const savePlayerName = (name: string) => {
    setSavedName(name);
    try {
      localStorage.setItem('imposter_player_name', name);
    } catch {
      // Ignore storage error
    }
  };

  const handleCreateRoom = async (playerName: string) => {
    savePlayerName(playerName);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: myPlayerId,
          playerName,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        const fallbackRoom = staticCreateRoom(myPlayerId, playerName);
        setRoom(fallbackRoom);
        setActivePlayerId(myPlayerId);
        updateUrlRoomParam(fallbackRoom.code);
        return;
      }
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
        setActivePlayerId(myPlayerId);
        updateUrlRoomParam(data.room.code);
      }
    } catch {
      const fallbackRoom = staticCreateRoom(myPlayerId, playerName);
      setRoom(fallbackRoom);
      setActivePlayerId(myPlayerId);
      updateUrlRoomParam(fallbackRoom.code);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (roomCode: string, playerName: string) => {
    savePlayerName(playerName);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode,
          playerId: myPlayerId,
          playerName,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.status === 404 && contentType.includes('application/json')) {
        const data = await res.json();
        setError(data.error || 'Room not found.');
        return;
      }
      if (!res.ok || !contentType.includes('application/json')) {
        const fallback = staticJoinRoom(roomCode, myPlayerId, playerName);
        if (fallback.room) {
          setRoom(fallback.room);
          setActivePlayerId(myPlayerId);
          updateUrlRoomParam(fallback.room.code);
        } else if (fallback.error) {
          setError(fallback.error);
        }
        return;
      }
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
        setActivePlayerId(myPlayerId);
        updateUrlRoomParam(data.room.code);
      }
    } catch {
      const fallback = staticJoinRoom(roomCode, myPlayerId, playerName);
      if (fallback.room) {
        setRoom(fallback.room);
        setActivePlayerId(myPlayerId);
        updateUrlRoomParam(fallback.room.code);
      } else if (fallback.error) {
        setError(fallback.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const performRoomAction = async (
    action: string,
    payload: Record<string, unknown> = {},
    actingPlayerId: string = activePlayerId
  ) => {
    if (!room) return;
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${room.code}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          playerId: actingPlayerId,
          payload,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json') || res.status === 404 || res.status === 405) {
        const fallback = staticPerformAction(
          room.code,
          room,
          action,
          actingPlayerId,
          payload
        );
        setRoom(fallback.room);
        if (fallback.error) setError(fallback.error);
        return;
      }
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
      if (!res.ok && data.error) {
        setError(data.error);
      }
    } catch {
      const fallback = staticPerformAction(
        room.code,
        room,
        action,
        actingPlayerId,
        payload
      );
      setRoom(fallback.room);
      if (fallback.error) setError(fallback.error);
    }
  };

  const handleJoinAdditionalSeat = async (friendName: string) => {
    if (!room) return;
    const seatId = `seat-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: room.code,
          playerId: seatId,
          playerName: friendName,
        }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        const fallback = staticJoinRoom(room.code, seatId, friendName);
        if (fallback.room) setRoom(fallback.room);
        return;
      }
      const data = await res.json();
      if (data.room) {
        setRoom(data.room);
      }
    } catch {
      const fallback = staticJoinRoom(room.code, seatId, friendName);
      if (fallback.room) setRoom(fallback.room);
    }
  };

  const handleToggleSuspicion = (targetId: string) => {
    setSuspicionMap((prev) => {
      const current = prev[targetId];
      const next =
        current === undefined
          ? 'suspect'
          : current === 'suspect'
          ? 'cleared'
          : undefined;
      return { ...prev, [targetId]: next };
    });
  };

  const handleLeaveRoom = () => {
    setRoom(null);
    setError(null);
    updateUrlRoomParam(null);
  };

  const { triggerSound } = useGameSoundEffects(room, activePlayerId);

  const activePlayer =
    room?.players.find((p) => p.id === activePlayerId) ||
    room?.players.find((p) => p.id === myPlayerId) ||
    room?.players[0];

  return (
    <div className="min-h-screen corkboard-surface text-[#FAF8F5] flex flex-col">
      {!room || !activePlayer ? (
        <TitleScreen
          initialRoomCode={initialRoomCode}
          savedName={savedName}
          error={error}
          loading={loading}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onQuickStartDemo={handleQuickStartDemo}
          onOpenRules={() => setRulesOpen(true)}
        />
      ) : (
        <>
          <GameHudBar
            room={room}
            activePlayerId={activePlayer.id}
            muted={muted}
            onSelectActivePlayerId={(id) => {
              setActivePlayerId(id);
              setError(null);
            }}
            onToggleMute={() => {
              setMuted((prev) => {
                const next = !prev;
                sound.muted = next;
                return next;
              });
            }}
            onOpenRules={() => setRulesOpen(true)}
            onLeaveRoom={handleLeaveRoom}
          />

          <main className="flex-1">
            {room.phase === 'LOBBY' && (
              <LobbyView
                room={room}
                activePlayerId={activePlayer.id}
                error={error}
                onUpdateSettings={(partial: Partial<RoomSettings>) =>
                  performRoomAction('update_settings', partial)
                }
                onAddBot={() => performRoomAction('add_bot')}
                onJoinAdditionalPlayer={handleJoinAdditionalSeat}
                onRemovePlayer={(targetPlayerId) =>
                  performRoomAction('remove_player', { targetPlayerId })
                }
                onStartRound={() => performRoomAction('start_round')}
              />
            )}

            {room.phase === 'ROLE_REVEAL' && (
              <RoleRevealView
                room={room}
                activePlayer={activePlayer}
                onMarkReady={(forceAll) =>
                  performRoomAction('ready_reveal', { forceAll }, activePlayer.id)
                }
              />
            )}

            {room.phase === 'CLUE_ROUNDS' && (
              <ClueBoardView
                room={room}
                activePlayer={activePlayer}
                error={error}
                suspicionMap={suspicionMap}
                onToggleSuspicion={handleToggleSuspicion}
                onSubmitClue={(text, isSpokenAloud) =>
                  performRoomAction(
                    'submit_clue',
                    { text, isSpokenAloud },
                    activePlayer.id
                  )
                }
                onSwitchToSpeaker={(speakerId) => setActivePlayerId(speakerId)}
                onSkipToVoting={() => performRoomAction('skip_to_voting')}
              />
            )}

            {(room.phase === 'VOTING' || room.phase === 'IMPOSTER_GUESS') && (
              <VotingView
                room={room}
                activePlayer={activePlayer}
                suspicionMap={suspicionMap}
                onCastVote={(targetId) =>
                  performRoomAction('cast_vote', { targetId }, activePlayer.id)
                }
                onForceTallyVotes={() => performRoomAction('force_tally_votes')}
                onSubmitImposterGuess={(guessedWord) =>
                  performRoomAction(
                    'imposter_guess',
                    { guessedWord },
                    activePlayer.id
                  )
                }
                onSwitchActivePlayer={(id) => setActivePlayerId(id)}
              />
            )}

            {room.phase === 'ROUND_SUMMARY' && (
              <RoundSummaryModal
                room={room}
                activePlayer={activePlayer}
                onNextRound={() => performRoomAction('start_round')}
                onBackToLobby={() => performRoomAction('back_to_lobby')}
              />
            )}
          </main>
        </>
      )}

      <RulesModal
        isOpen={rulesOpen}
        isInRoom={Boolean(room)}
        onClose={() => setRulesOpen(false)}
        onRestartRound={
          room ? () => performRoomAction('start_round') : undefined
        }
        onLeaveToTitle={room ? handleLeaveRoom : undefined}
        onPreviewSound={triggerSound}
      />
    </div>
  );
}
