'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { backend } from '@/lib/backend'
import Navbar from '@/components/Navbar'

interface Profile {
  id: string
  full_name: string
  avatar_url: string | null
  location?: string | null
}

interface Message {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  created_at: string
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const activeReceiverId = (params?.userId || params?.id) as string

  const [currentUser, setCurrentUser] = useState<{ id: string; full_name: string } | null>(null)
  const [conversations, setConversations] = useState<Profile[]>([])
  const [activePartner, setActivePartner] = useState<Profile | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  useEffect(() => {
    const initChat = async () => {
      try {
        const { payload } = await backend.getMe()
        const custom = (payload.custom as Record<string, any>) || {}
        const userObj = {
          id: payload.sub as string,
          full_name: custom.full_name || 'User',
        }
        setCurrentUser(userObj)

        const profileRecords = await backend.list<any>('profiles')
        const formattedProfiles: Profile[] = profileRecords
          .map((rec) => {
            const d = rec.data || rec
            return {
              id: d.user_id || rec.owner_id || rec.id,
              full_name: d.full_name || 'Member',
              avatar_url: d.avatar_url || null,
              location: d.location || 'Cape Coast',
            }
          })
          .filter((p) => p.id !== userObj.id)

        setConversations(formattedProfiles)

        if (activeReceiverId) {
          const partner = formattedProfiles.find((p) => p.id === activeReceiverId)
          if (partner) {
            setActivePartner(partner)
          } else {
            setActivePartner({
              id: activeReceiverId,
              full_name: 'Chat Partner',
              avatar_url: null,
              location: 'Local',
            })
          }
        }
      } catch {
        router.push('/login')
        return
      } finally {
        setLoading(false)
      }
    }

    initChat()
  }, [activeReceiverId, router])

  useEffect(() => {
    if (!currentUser || !activePartner) return

    let isMounted = true

    const fetchMessages = async () => {
      try {
        const allMessages = await backend.list<any>('messages')
        const thread: Message[] = allMessages
          .map((rec) => {
            const d = rec.data || rec
            return {
              id: rec.id,
              sender_id: d.sender_id || rec.owner_id,
              receiver_id: d.receiver_id || d.recipient_id,
              message: d.message || d.content || '',
              created_at: rec.created_at || d.created_at || new Date().toISOString(),
            }
          })
          .filter(
            (m) =>
              (m.sender_id === currentUser.id && m.receiver_id === activePartner.id) ||
              (m.sender_id === activePartner.id && m.receiver_id === currentUser.id)
          )
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

        if (isMounted) {
          setMessages((prev) => {
            if (prev.length !== thread.length) {
              scrollToBottom()
            }
            return thread
          })
        }
      } catch (err) {
        console.error('Error fetching messages:', err)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [currentUser, activePartner])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser || !activePartner) return

    const text = newMessage.trim()
    setNewMessage('')

    try {
      const created = await backend.create<any>('messages', {
        sender_id: currentUser.id,
        receiver_id: activePartner.id,
        recipient_id: activePartner.id,
        message: text,
        content: text,
      })

      const newMsgObj: Message = {
        id: created.id || `temp-${Date.now()}`,
        sender_id: currentUser.id,
        receiver_id: activePartner.id,
        message: text,
        created_at: created.created_at || new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMsgObj])
      scrollToBottom()
    } catch (err: any) {
      alert('Failed to send message: ' + (err.message || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Loading your messages...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full grid grid-cols-1 md:grid-cols-3 overflow-hidden">
          {/* Left Pane: Conversation Threads */}
          <div className="border-r border-gray-200 flex flex-col bg-gray-50/50">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h1 className="text-lg font-bold text-gray-900">Messages</h1>
              <p className="text-xs text-gray-400">Chat with clients and artisans</p>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No profiles available to message yet.
                </div>
              ) : (
                conversations.map((person) => {
                  const isSelected = activePartner?.id === person.id
                  return (
                    <button
                      key={person.id}
                      onClick={() => {
                        setActivePartner(person)
                        router.push(`/messages/${person.id}`)
                      }}
                      className={`w-full p-4 flex items-center gap-3 text-left transition ${
                        isSelected ? 'bg-emerald-50/80 border-l-4 border-emerald-600' : 'hover:bg-gray-100/60'
                      }`}
                    >
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm shrink-0">
                        {person.full_name ? person.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="overflow-hidden">
                        <h2 className="text-sm font-bold text-gray-900 truncate">{person.full_name}</h2>
                        <p className="text-xs text-gray-400 truncate">📍 {person.location || 'Cape Coast'}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Pane: Active Chat Window */}
          <div className="md:col-span-2 flex flex-col bg-white">
            {activePartner ? (
              <>
                <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-sm">
                    {activePartner.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{activePartner.full_name}</h2>
                    <p className="text-xs text-emerald-600 font-medium">● Online / Active</p>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/30 max-h-[60vh] min-h-[50vh]">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-xs">
                      No messages yet. Say hello to start the conversation!
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === currentUser?.id
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-xs sm:max-w-md px-4 py-3 rounded-2xl text-sm shadow-sm ${
                              isMe
                                ? 'bg-emerald-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                            }`}
                          >
                            <p className="break-words">{msg.message}</p>
                            <span
                              className={`block text-[10px] mt-1 text-right ${
                                isMe ? 'text-emerald-100' : 'text-gray-400'
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2 bg-white">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition shadow-sm"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-32 text-gray-400">
                <p className="text-base font-medium">Select a conversation</p>
                <p className="text-xs mt-1">Choose a client or artisan from the left pane to begin chatting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
