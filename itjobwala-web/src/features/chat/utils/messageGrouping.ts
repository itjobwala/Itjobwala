import type { Message } from '../types/chat.types';
import { isSameDay } from './chatTime';

export interface MessageGroup {
  senderId:   number;
  senderRole: string;
  messages:   Message[];
  dayStart?:  string;
}

export function groupMessages(messages: Message[]): MessageGroup[] {
  const groups: MessageGroup[] = [];
  let lastDay: string | null   = null;

  messages.forEach((msg, i) => {
    const isNewDay = !lastDay || !isSameDay(lastDay, msg.created_at);
    const prev     = messages[i - 1];
    const isNewGroup = !prev || prev.sender_id !== msg.sender_id || isNewDay ||
      (new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()) > 5 * 60 * 1000;

    if (isNewDay) {
      lastDay = msg.created_at;
      groups.push({ senderId: msg.sender_id, senderRole: msg.sender_role, messages: [msg], dayStart: msg.created_at });
    } else if (isNewGroup) {
      groups.push({ senderId: msg.sender_id, senderRole: msg.sender_role, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  });

  return groups;
}
