import ChatAvatar from '../shared/ChatAvatar';
import type { Conversation } from '../../types/chat.types';
import { formatChatTime } from '../../utils/chatTime';

interface Props {
  conversation: Conversation;
  active:       boolean;
  onClick:      () => void;
}

export default function ConversationCard({ conversation, active, onClick }: Props) {
  const party = conversation.other_party;
  const hasUnread = conversation.unread_count > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all ${
        active
          ? 'bg-primary/10 border border-primary/20 shadow-sm'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <ChatAvatar name={party?.name ?? null} photo={party?.photo} size={44} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[13px] truncate ${hasUnread ? 'font-extrabold text-[#0f172a]' : 'font-semibold text-gray-700'}`}>
            {party?.name ?? 'Unknown'}
          </span>
          {conversation.last_message_at && (
            <span className="text-[10px] text-gray-400 shrink-0">
              {formatChatTime(conversation.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={`text-[12px] truncate ${hasUnread ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
            {conversation.last_message ?? party?.subtitle ?? '—'}
          </span>
          {hasUnread && (
            <span className="shrink-0 bg-primary text-white text-[9px] font-black w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
