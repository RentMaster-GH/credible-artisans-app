// components/chat/ChatButton.tsx
'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Props {
  artisanId: string;
  clientId: string;
  buttonText?: string;
  className?: string;
}

export const ChatButton: React.FC<Props> = ({
  artisanId,
  clientId,
  buttonText = '💬 Chat & Video Call',
  className = 'bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-lg shadow transition disabled:opacity-50',
}) => {
  const [loading, setLoading] = useState(false);

  const handleOpenChat = async () => {
    setLoading(true);
    try {
      // Automatically creates or finds the private chat room between this artisan and client
      const { data: room, error } = await (supabase.from as any)('chat_rooms')
        .upsert(
          { artisan_id: artisanId, client_id: clientId },
          { onConflict: 'artisan_id,client_id' }
        )
        .select('id')
        .single();

      if (error) throw error;

      if (room) {
        // Automatically redirects the user straight into the chat room
        window.location.href = `/chat/${room.id}`;
      }
    } catch (err: any) {
      alert('Failed to open chat: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleOpenChat}
      disabled={loading}
      className={className}
    >
      {loading ? 'Connecting...' : buttonText}
    </button>
  );
};
