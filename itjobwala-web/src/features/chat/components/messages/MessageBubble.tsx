import type { Message } from '../../types/chat.types';
import { formatMessageTime } from '../../utils/chatTime';

interface Props {
  message:  Message;
  isMine:   boolean;
  isLast:   boolean;
}

export default function MessageBubble({ message, isMine, isLast }: Props) {
  return (
    <div className={`w-full flex flex-col ${isMine ? 'items-end' : 'items-start'} gap-0.5`}>
      <div
        className={`max-w-[72%] px-4 py-2.5 text-[13.5px] leading-[1.55] break-words ${
          isMine
            ? 'bg-primary text-white rounded-[20px] rounded-br-[4px] shadow-sm shadow-primary/20'
            : 'bg-white text-[#1e293b] border border-gray-100 shadow-sm rounded-[20px] rounded-bl-[4px]'
        }`}
      >
        {message.message}
      </div>
      {isLast && (
        <span className={`text-[10px] text-gray-400 mx-1 flex items-center gap-1 ${isMine ? 'flex-row-reverse' : ''}`}>
          {formatMessageTime(message.created_at)}
          {isMine && (
            message.is_read ? (
              /* Double blue tick — message read */
              <span className="flex items-center" style={{ gap: '-2px' }}>
                <svg width="13" height="10" viewBox="0 0 13 10" fill="none" stroke="#1557FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 5l3 3 5-6" />
                  <path d="M5 5l3 3 5-6" />
                </svg>
              </span>
            ) : (
              /* Single grey tick — sent, not yet read */
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )
          )}
        </span>
      )}
    </div>
  );
}
