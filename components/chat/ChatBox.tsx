// components/chat/ChatBox.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ChatMessage } from '@/types/chat';
import { VideoCallOverlay } from './VideoCallOverlay';

interface Props {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  recipientName: string;
}

export const ChatBox: React.FC<Props> = ({
  roomId,
  currentUserId,
  currentUserName,
  recipientName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch initial message history
  useEffect(() => {
    async function fetchMessages() {
      const { data, error } = await (supabase.from as any)('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data as ChatMessage[]);
      }
      setLoading(false);
      scrollToBottom();
    }

    fetchMessages();
  }, [roomId]);

  // 2. Subscribe to Supabase Realtime WebSocket changes
  useEffect(() => {
    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload: any) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  // 3. Send Message function
  const handleSendMessage = async (e?: React.FormEvent, isVideoCallInvite = false) => {
    if (e) e.preventDefault();
    const content = isVideoCallInvite
      ? `📹 Started a live video call. Click "Join Video Call" to connect!`
      : text.trim();

    if (!content) return;

    if (!isVideoCallInvite) setText('');

    const { error } = await (supabase.from as any)('chat_messages').insert({
      room_id: roomId,
      sender_id: currentUserId,
      message: content,
      is_video_invite: isVideoCallInvite,
    });

    if (error) {
      console.error('Failed to send message:', error.message);
    }
  };

  // 4. Start Video Call
  const startVideoCall = () => {
    setIsVideoActive(true);
    handleSendMessage(undefined, true); // Post video invitation in chat
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg">{recipientName}</h3>
          <p className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
            Real-time Connected
          </p>
        </div>

        {/* Start Video Call Button */}
        <button
          onClick={startVideoCall}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          📹 Start Video Call
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {loading ? (
          <p className="text-center text-sm text-gray-400 pt-10">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 pt-10">
            No messages yet. Send a message to start communicating.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    msg.is_video_invite
                      ? 'bg-blue-50 border border-blue-300 text-blue-900 font-medium'
                      : isMe
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p>{msg.message}</p>
                  
                  {/* Join Video Call Button inside invite messages */}
                  {msg.is_video_invite && (
                    <button
                      onClick={() => setIsVideoActive(true)}
                      className="mt-2 w-full bg-blue-600 text-white py-1.5 px-3 rounded text-xs font-bold hover:bg-blue-700"
                    >
                      Join Video Call Now
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={handleSendMessage} className="p-3 bg-white border-t flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition"
        >
          Send
        </button>
      </form>

      {/* Floating In-Screen Video Call Overlay */}
      {isVideoActive && (
        <VideoCallOverlay
          roomId={roomId}
          userName={currentUserName}
          onClose={() => setIsVideoActive(false)}
        />
      )}
    </div>
  );
};
