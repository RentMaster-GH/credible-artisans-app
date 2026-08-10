'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function SupportPage() {
  const [category, setCategory] = useState('Complaint')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { data: { user } } = await supabase.auth.getUser()

    // Submit to customer_support table
    const { error } = await (supabase.from as any)('customer_support').insert({
      ticket_type: category, // 👈 Required by your database schema!
      category,
      subject,
      message,
      status: 'open',
      user_id: user?.id || null,
    })

    if (error) {
      setErrorMsg('Failed to submit ticket: ' + error.message)
    } else {
      setSubmitted(true)
      setSubject('')
      setMessage('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto pt-10 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Support & Suggestions</h1>
          <p className="text-gray-500 text-sm mt-1">
            Have a complaint, encountered a bug, or have a suggestion? Send a report directly to the platform manager.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Ticket Submitted Successfully</h2>
            <p className="text-gray-500 text-xs mb-6">Our app manager will review your report and investigate.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-emerald-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition"
            >
              Submit Another Report
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Complaint">User Complaint / Abuse</option>
                  <option value="Technical Support">Technical Issue / Bug</option>
                  <option value="Suggestion">Feature Suggestion</option>
                  <option value="Payment">Payment / Billing Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue with bid acceptance button"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Detailed Message</label>
                <textarea
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or suggestion in detail..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
              >
                {loading ? 'Submitting Report...' : 'Submit Report to Manager'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

