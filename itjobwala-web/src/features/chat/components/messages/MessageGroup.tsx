import ChatAvatar  from '../shared/ChatAvatar';
import MessageBubble from './MessageBubble';
import { formatDayLabel } from '../../utils/chatTime';
import type { MessageGroup as MG } from '../../utils/messageGrouping';
import type { ChatParty } from '../../types/chat.types';

interface Props {
  group:      MG;
  myId:       number;
  myRole:     string;
  otherParty: ChatParty | null;
}

export default function MessageGroup({ group, myId, myRole, otherParty }: Props) {
  const isMine = group.senderId === myId && group.senderRole === myRole;

  return (
    <>
      {group.dayStart && (
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-surface-hover" />
          <span className="text-micro font-semibold text-subtle bg-surface px-2">
            {formatDayLabel(group.dayStart)}
          </span>
          <div className="flex-1 h-px bg-surface-hover" />
        </div>
      )}

      <div className={`flex items-end gap-2.5 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar — only show for other party */}
        {!isMine && (
          <ChatAvatar name={otherParty?.name ?? null} photo={otherParty?.photo} size={32} />
        )}

        {/* Bubbles */}
        <div className={`flex-1 min-w-0 flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
          {group.messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMine={isMine}
              isLast={i === group.messages.length - 1}
            />
          ))}
        </div>
      </div>
    </>
  );
}
