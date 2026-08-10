// components/chat/InPageChatModal.tsx
'use client';

import React from 'react';
import { ChatBox } from './ChatBox';

interface InPageChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  recipientName: string;
}

export const InPageChatModal: React.FC<InPageChatModalProps> = ({
  isOpen,
  onClose,
  roomId,
  currentUserId,
  currentUserName,
  recipientName,
}) => {
  if (!isOpen || !roomId) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] w-full max-w-md shadow-2xl rounded-2xl overflow-hidden border border-gray-300 bg-white transition-all animate-in slide-in-from-bottom-5">
      {/* Floating Header Controls */}
      <div className="bg-gray-900 text-white px-4 py-2.5 flex justify-between items-center text-xs font-bold border-b border-gray-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
          <span>In-Page Live Chat & Video with {recipientName}</span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white font-black text-sm p-1 rounded transition"
          title="Minimize Chat"
        >
          ✕
        </button>
      </div>

      {/* Embedded ChatBox */}
      <div className="p-0 max-h-[520px] overflow-hidden">
        <ChatBox
          roomId={roomId}
          currentUserId={currentUserId}
          currentUserName={currentUserName}
          recipientName={recipientName}
        />
      </div>
    </div>
  );
};