'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { backend } from '@/lib/backend';

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
  const router = useRouter();

  const handleOpenChat = async () => {
    setLoading(true);
    try {
      const rooms = await backend.list<any>('chat_rooms');
      let room = rooms.find(
        (r) =>
          (r.data?.artisan_id === artisanId && r.data?.client_id === clientId) ||
          (r.artisan_id === artisanId && r.client_id === clientId)
      );

      if (!room) {
        room = await backend.create<any>('chat_rooms', {
          artisan_id: artisanId,
          client_id: clientId,
        });
      }

      if (room?.id) {
        router.push(`/chat/${room.id}`);
      }
    } catch (err: any) {
      alert('Failed to open chat: ' + (err.message || 'Please sign in first.'));
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
