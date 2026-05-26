export type MessageType = 'text' | 'file' | 'system';
export type SenderRole  = 'candidate' | 'recruiter';

export interface ChatParty {
  id:       number;
  name:     string;
  subtitle: string | null;
  photo?:   string | null;
  role:     SenderRole;
}

export interface Conversation {
  id:              number;
  last_message:    string | null;
  last_message_at: string | null;
  unread_count:    number;
  other_party:     ChatParty | null;
  created_at:      string;
}

export interface Message {
  id:           number;
  sender_id:    number;
  sender_role:  SenderRole;
  message:      string;
  message_type: MessageType;
  is_read:      boolean;
  created_at:   string;
}

export interface MessagesResponse {
  messages:    Message[];
  has_more:    boolean;
  next_cursor: string | null;
}

export interface ConversationsResponse {
  conversations: Conversation[];
}

// Socket event payloads
export interface SocketMessage extends Message {
  conversation_id: number;
}

export interface TypingPayload {
  conversation_id: number;
  user_id:         number;
  is_typing:       boolean;
}
