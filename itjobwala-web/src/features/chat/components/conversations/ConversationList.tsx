import { useConversationsQuery }  from '../../hooks';
import ConversationCard           from './ConversationCard';
import { useAuthStore }           from '@/src/features/auth/session/auth.store';
import type { Conversation }      from '../../types/chat.types';

interface Props {
  activeId:  number | null;
  onSelect:  (c: Conversation) => void;
}

export default function ConversationList({ activeId, onSelect }: Props) {
  const { data, isLoading } = useConversationsQuery();
  const conversations       = data?.conversations ?? [];
  const isRecruiter         = useAuthStore(s => s.isRecruiter());

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
            <div className="w-11 h-11 rounded-full bg-surface-hover shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-surface-hover rounded-full w-3/4" />
              <div className="h-3 bg-surface-hover rounded-full w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-12 px-6 text-center">
        <div className="w-12 h-12 bg-surface-hover rounded-2xl flex items-center justify-center mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-subtle">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-muted">No conversations yet</p>
        <p className="text-micro text-subtle mt-1 max-w-[180px]">
          {isRecruiter
            ? 'Message a candidate from their applicant profile'
            : 'Recruiters who reach out will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-3">
      {conversations.map(c => (
        <ConversationCard
          key={c.id}
          conversation={c}
          active={c.id === activeId}
          onClick={() => onSelect(c)}
        />
      ))}
    </div>
  );
}
