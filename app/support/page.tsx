'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function SupportPage() {
  const [category, setCategory] = useState('Support')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase.from('support_tickets').insert({
      user_id: user ? user.id : null,
      category,
      subject,
      message,
      status: 'open',
    })

    if (error) {
      alert('Error submitting ticket: ' + error.message)
    } else {
      setSuccess(true)
      setSubject('')
      setMessage('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-xl mx-auto px-4 pt-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Support, Complaints & Suggestions</h1>
          <p className="text-gray-500 text-sm mb-6">
            Have an issue, complaint, or feature suggestion? Send it directly to our team for review.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
              Ticket submitted successfully! We will review it shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Support">Support Request</option>
                <option value="Complaint">Complaint</option>
                <option value="Suggestion">Feature Suggestion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your message..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Message / Details</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue, complaint, or suggestion in detail..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl text-sm shadow-sm transition"
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}