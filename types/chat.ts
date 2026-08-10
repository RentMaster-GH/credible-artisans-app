// types/chat.ts

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_video_invite?: boolean; // Flag if message is an inline "Join Video Call" invitation
  created_at: string;
  sender?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface ChatRoom {
  id: string;
  artisan_id: string;
  client_id: string;
  boq_id?: string | null;
  created_at: string;
  artisan?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  client?: {
    id: string;
    full_name?: string;
    avatar_url?: string;
  };
  last_message?: ChatMessage;
}

export interface SendMessageInput {
  room_id: string;
  sender_id: string;
  message: string;
  is_video_invite?: boolean;
}

export interface VideoCallState {
  isActive: boolean;
  roomId: string | null;
  roomName: string | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
}
