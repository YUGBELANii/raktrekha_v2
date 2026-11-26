import { supabase } from '../lib/supabase';

export const createOrFetchChatId = async (userId: string, otherUserId: string) => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from('chats')
      .select('id, participants')
      .contains('participants', [userId]);

    if (fetchError) throw fetchError;

    const match = (existing || []).find((chat: any) => Array.isArray(chat.participants) && chat.participants.includes(otherUserId));
    if (match) return match.id;

    const { data: created, error: createError } = await supabase
      .from('chats')
      .insert({ participants: [userId, otherUserId], created_at: new Date().toISOString() })
      .select('id')
      .single();

    if (createError) throw createError;
    return created.id;
  } catch (error) {
    console.error('Error creating/fetching chat:', error);
    throw error;
  }
};
