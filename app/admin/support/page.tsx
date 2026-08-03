'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface Ticket {
  id: string
  category: string
  subject: string
  message: string
  status: string
  created_at: string
  user_id: string | null
}

const DEVELOPER_EMAIL = 'your-email@example.com' // Replace with your developer email

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const verifyAndFetch = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.email !== DEVELOPER_EMAIL) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      setAuthorized(true)
      fetchTickets()
    }

    verifyAndFetch()
  }, [supabase])

  const fetchTickets = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTickets(data as Ticket[])
    }
    setLoading(false)
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'resolved' : 'open'
    const { error } = await supabase
      .from('support_tickets')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Verifying developer credentials...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm">This support management portal is restricted to the developer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Support & Feedback Inbox</h1>
          <p className="text-gray-500 text-sm mt-1">Review user complaints, technical support requests, and feature suggestions.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {tickets.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No support tickets or feedback submitted yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                        ticket.category === 'Complaint' ? 'bg-red-50 text-red-700' :
                        ticket.category === 'Suggestion' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {ticket.category}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleString()}</span>
                    </div>

                    <h2 className="text-base font-bold text-gray-900">{ticket.subject}</h2>
                    <p className="text-gray-600 text-xs whitespace-pre-line max-w-2xl">{ticket.message}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleStatus(ticket.id, ticket.status)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                        ticket.status === 'resolved' ? 'bg-gray-100 text-gray-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {ticket.status === 'resolved' ? 'Mark as Open' : 'Mark as Resolved'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}