// app/chat/[roomId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { backend } from '@/lib/backend';
import { ChatBox } from '@/components/chat/ChatBox';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('User');
  const [recipientName, setRecipientName] = useState<string>('Participant');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadRoomAndUser() {
      try {
        let me: any;
        try {
          me = await backend.getMe();
        } catch {
          setError('Please sign in to access this private chat.');
          setLoading(false);
          return;
        }

        const payload = me.payload || {};
        const currentId = payload.sub;
        const custom = (payload.custom as Record<string, any>) || {};
        setUserId(currentId);
        setUserName(custom.full_name || payload.email?.split('@')[0] || 'User');

        const rooms = await backend.list<any>('chat_rooms');
        const roomRecord = rooms.find((r: any) => r.id === roomId);

        if (!roomRecord) {
          setError('Chat room not found or you do not have permission to access it.');
          setLoading(false);
          return;
        }

        const room = roomRecord.data || roomRecord;
        const isArtisan = currentId === room.artisan_id;
        setRecipientName(
          isArtisan
            ? room.client_name || 'Client'
            : room.artisan_name || 'Artisan'
        );
      } catch (err: any) {
        setError(err.message || 'Unable to load chat room.');
      } finally {
        setLoading(false);
      }
    }

    if (roomId) loadRoomAndUser();
  }, [roomId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
        Connecting to secure chat room...
      </div>
    );
  }

  if (error || !userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg max-w-md text-center shadow mb-4">
          {error || 'Unable to load chat.'}
        </div>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto mb-4">
        <button
          onClick={() => window.history.back()}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>
      </div>

      <ChatBox
        roomId={roomId}
        currentUserId={userId}
        currentUserName={userName}
        recipientName={recipientName}
      />
    </div>
  );
}
