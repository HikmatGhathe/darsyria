import { apiRequest, ApiError } from './api';

// ---------- Types ----------

export type ConversationParticipant = {
  id: string;
  name: string | null;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ConversationListItem = {
  id: string;
  property_id: string;
  property_title: string;
  property_cover_url: string | null;
  other_party: ConversationParticipant;
  last_message_preview: string | null;
  last_message_at: string;
  has_unread: boolean;
  created_at: string;
};

export type Conversation = {
  id: string;
  property_id: string;
  property_title: string;
  buyer_id: string;
  seller_id: string;
  buyer_revealed_at: string | null;
  seller_revealed_at: string | null;
  both_revealed: boolean;
  buyer_phone: string | null;
  seller_phone: string | null;
  messages: Message[];
  created_at: string;
  last_message_at: string;
};

// ---------- API calls ----------

export async function listConversations(): Promise<ConversationListItem[]> {
  return apiRequest<ConversationListItem[]>('/conversations', {
    method: 'GET',
    authenticated: true,
  });
}

export async function getConversation(id: string): Promise<Conversation> {
  return apiRequest<Conversation>(`/conversations/${id}`, {
    method: 'GET',
    authenticated: true,
  });
}

export async function startConversation(
  propertyId: string,
  body: string
): Promise<Conversation> {
  return apiRequest<Conversation>('/conversations', {
    method: 'POST',
    body: { property_id: propertyId, body },
    authenticated: true,
  });
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<Message> {
  return apiRequest<Message>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { body },
    authenticated: true,
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  await apiRequest<void>(`/conversations/${conversationId}/read`, {
    method: 'POST',
    authenticated: true,
  });
}

export async function revealContact(conversationId: string): Promise<Conversation> {
  return apiRequest<Conversation>(`/conversations/${conversationId}/reveal`, {
    method: 'POST',
    authenticated: true,
  });
}

/**
 * Look up the current user's existing conversation about a property.
 * Returns null if no conversation exists yet, or if the user is the owner.
 * Returns null (instead of throwing) on 401 — caller treats as "no conversation".
 */
export async function getMyConversationForProperty(
  propertyId: string
): Promise<Conversation | null> {
  try {
    const result = await apiRequest<Conversation | null>(
      `/conversations/by-property/${propertyId}`,
      { method: 'GET', authenticated: true }
    );
    return result;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    throw err;
  }
}
