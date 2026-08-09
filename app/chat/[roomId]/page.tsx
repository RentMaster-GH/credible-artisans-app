// app/chat/[roomId]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ChatBox } from '@/components/chat/ChatBox';
import Link from 'next/link';

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
        // 1. Get currently authenticated user from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          setError('Please sign in to access this private chat.');
          setLoading(false);
          return;
        }

        setUserId(user.id);
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');

        // 2. Fetch Chat Room Details & Participant Info
        const { data: room, error: roomError } = await supabase
          .from('chat_rooms')
          .select(`
            *,
            artisan:artisan_id (id, full_name, email),
            client:client_id (id, full_name, email)
          `)
          .eq('id', roomId)
          .single();

        if (roomError || !room) {
          setError('Chat room not found or you do not have permission to access it.');
          setLoading(false);
          return;
        }

        // Determine recipient name dynamically
        const isArtisan = user.id === room.artisan_id;
        const otherParty = isArtisan ? room.client : room.artisan;
        setRecipientName(otherParty?.full_name || otherParty?.email || 'Chat Partner');

      } catch (err: any) {
        setError(err.message);
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