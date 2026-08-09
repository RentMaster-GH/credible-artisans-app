// components/chat/VideoCallOverlay.tsx
'use client';

import React, { useState } from 'react';

interface Props {
  roomId: string;
  userName: string;
  onClose: () => void;
}

export const VideoCallOverlay: React.FC<Props> = ({ roomId, userName, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Generate a private WebRTC video channel tied strictly to this private Chat Room ID
  const uniqueRoomName = `credibleartisans-call-${roomId}`;
  const videoCallUrl = `https://meet.jit.si/${uniqueRoomName}#userInfo.displayName="${encodeURIComponent(
    userName
  )}"&config.prejoinPageEnabled=false&config.disableDeepLinking=true&interfaceConfig.TOOLBAR_BUTTONS=['microphone','camera','desktop','fullscreen','hangup']`;

  return (
    <div
      className={`fixed transition-all duration-300 z-50 bg-black rounded-xl shadow-2xl overflow-hidden border border-gray-700 ${
        isMinimized
          ? 'bottom-4 right-4 w-72 h-44'
          : 'bottom-4 right-4 w-[92vw] max-w-2xl h-[520px] md:bottom-6 md:right-6'
      }`}
    >
      {/* Top Control Bar */}
      <div className="bg-gray-900 text-white px-4 py-2.5 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold tracking-wider text-gray-200">
            IN-APP LIVE VIDEO CALL
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-300 hover:text-white px-2 py-1 text-xs bg-gray-800 rounded border border-gray-700"
          >
            {isMinimized ? '🗖 Expand' : '🗕 Minimize'}
          </button>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-200 px-3 py-1 text-xs bg-red-950 border border-red-800 rounded font-bold"
          >
            End Call
          </button>
        </div>
      </div>

      {/* Embedded WebRTC Frame - Stays 100% inside this screen */}
      <iframe
        src={videoCallUrl}
        allow="camera; microphone; display-capture; autoplay; clipboard-write; microphone"
        className="w-full h-[calc(100%-42px)] border-0"
        title="Live In-App Video Call"
      />
    </div>
  );
};