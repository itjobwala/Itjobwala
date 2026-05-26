import apiClient from '@/src/lib/api/client';
import type { ApiResponse } from '@/src/types/api';
import type { Conversation, ConversationsResponse, Message, MessagesResponse } from '../types/chat.types';

export async function getConversations(): Promise<ConversationsResponse> {
  const res = await apiClient.get<ApiResponse<ConversationsResponse>>('/chat/conversations');
  return res.data.data!;
}

export async function getOrCreateConversation(otherId: number, referralRequestId?: number): Promise<{ conversation_id: number }> {
  const res = await apiClient.post<ApiResponse<{ conversation_id: number }>>('/chat/conversation', {
    other_id:            otherId,
    referral_request_id: referralRequestId,
  });
  return res.data.data!;
}

export async function getMessages(conversationId: number, params: { cursor?: string; limit?: number } = {}): Promise<MessagesResponse> {
  const res = await apiClient.get<ApiResponse<MessagesResponse>>(`/chat/conversation/${conversationId}/messages`, { params });
  return res.data.data!;
}

export async function sendMessage(conversationId: number, message: string, messageType = 'text'): Promise<Message> {
  const res = await apiClient.post<ApiResponse<Message>>('/chat/message', {
    conversation_id: conversationId,
    message,
    message_type:    messageType,
  });
  return res.data.data!;
}
