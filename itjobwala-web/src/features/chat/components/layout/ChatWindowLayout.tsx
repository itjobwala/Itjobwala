'use client';

import { useEffect }   from 'react';
import ChatAvatar      from '../shared/ChatAvatar';
import ChatWindow      from '../messages/ChatWindow';
import ChatInput       from '../input/ChatInput';
import ChatEmptyState  from '../shared/ChatEmptyState';
import { useSocketStore }  from '../../socket/socketStore';
import { safeEmit }        from '../../socket/socketClient';
import { EVENTS }          from '../../socket/socketEvents';
import type { Conversation } from '../../types/chat.types';

interface Props {
  conversation:  Conversation | null;
  myId:          number;
  onOpenSidebar: () => void;
}

function ConnectionStatus() {
  const { isConnected, reconnecting } = useSocketStore();

  if (isConnected) return null;

  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-1.5 text-[11px] font-semibold shrink-0 ${
      reconnecting ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${reconnecting ? 'bg-amber-400 animate-pulse' : 'bg-red-400'}`} />
      {reconnecting ? 'Reconnecting...' : 'Disconnected — messages may be delayed'}
    </div>
  );
}

function TypingBanner({ conversationId, myId }: { conversationId: number; myId: number }) {
  const { typingUsers } = useSocketStore();
  const typers          = typingUsers[conversationId] ?? new Set<number>();
  const othersTyping    = [...typers].filter(id => id !== myId);

  if (othersTyping.length === 0) return null;

  return (
    <div className="px-5 py-1.5 text-[11px] text-gray-500 font-medium flex items-center gap-1.5 shrink-0">
      <span className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1 h-1 rounded-full bg-gray-400"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </span>
      Typing...
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}

export default function ChatWindowLayout({ conversation, myId, onOpenSidebar }: Props) {
  const { onlineUsers } = useSocketStore();

  // Join conversation room when conversation changes
  useEffect(() => {
    if (!conversation) return;
    safeEmit(EVENTS.CONVERSATION_JOIN, { conversation_id: conversation.id });
    return () => {
      safeEmit(EVENTS.CONVERSATION_LEAVE, { conversation_id: conversation.id });
    };
  }, [conversation?.id]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="sm:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
          <button onClick={onOpenSidebar} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <HamburgerIcon />
          </button>
          <span className="text-[15px] font-bold text-[#0f172a]">Messages</span>
        </div>
        <ConnectionStatus />
        <ChatEmptyState />
      </div>
    );
  }

  const party = conversation.other_party;
  const isOtherOnline = party ? onlineUsers.has(party.id) : false;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-5 py-4 bg-white border-b border-gray-100 shrink-0">
        <button onClick={onOpenSidebar}
          className="sm:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors -ml-1">
          <HamburgerIcon />
        </button>

        <ChatAvatar name={party?.name ?? null} photo={party?.photo} size={40} online={isOtherOnline} />

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-[#0f172a] truncate">{party?.name ?? '—'}</p>
          <p className="text-[11px] text-gray-400 truncate">
            {isOtherOnline ? (
              <span className="text-emerald-600 font-medium">● Online</span>
            ) : (
              party?.subtitle ?? ''
            )}
          </p>
        </div>
      </div>

      {/* Connection status banner */}
      <ConnectionStatus />

      {/* Messages */}
      <ChatWindow conversation={conversation} myId={myId} />

      {/* Typing indicator */}
      <TypingBanner conversationId={conversation.id} myId={myId} />

      {/* Input */}
      <ChatInput conversationId={conversation.id} myId={myId} />
    </div>
  );
}

function HamburgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
