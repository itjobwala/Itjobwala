import ConversationList from '../conversations/ConversationList';
import type { Conversation } from '../../types/chat.types';

interface Props {
  activeId:       number | null;
  onSelect:       (c: Conversation) => void;
  isMobileOpen:   boolean;
  onMobileClose:  () => void;
}

export default function ChatSidebar({ activeId, onSelect, isMobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 sm:hidden" onClick={onMobileClose} />
      )}

      <div
        className={`
          bg-surface border-r border-token flex flex-col
          fixed sm:relative inset-y-0 left-0 z-40 sm:z-auto
          w-[300px] sm:w-[280px] lg:w-[300px]
          transition-transform duration-300 sm:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-token shrink-0">
          <h2 className="text-lg font-extrabold text-heading">Messages</h2>
          <p className="text-micro text-subtle mt-0.5">Your conversations</p>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto py-2">
          <ConversationList activeId={activeId} onSelect={(c) => { onSelect(c); onMobileClose(); }} />
        </div>
      </div>
    </>
  );
}
