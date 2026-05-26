export default function ChatEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1557FF" strokeWidth="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 className="text-[15px] font-bold text-[#0f172a] mb-1">Select a conversation</h3>
      <p className="text-[13px] text-gray-500 max-w-xs">
        Choose a conversation from the sidebar to start messaging.
      </p>
    </div>
  );
}
