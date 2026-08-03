'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface VerificationRequest {
  id: string
  user_id: string
  id_type: string
  id_document_url: string
  status: string
  submitted_at: string
}

const DEVELOPER_EMAIL = 'papastickle@gmail.com' // Replace with your developer email

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<VerificationRequest[]>([])
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
      fetchVerifications()
    }

    verifyAndFetch()
  }, [supabase])

  const fetchVerifications = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('verifications')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (!error && data) {
      setRequests(data)
    }
    setLoading(false)
  }

  const approveUserVerification = async (userId: string, verificationId: string) => {
    // 1. Mark verification request as verified
    await supabase
      .from('verifications')
      .update({ status: 'verified' })
      .eq('id', verificationId)

    // 2. Set is_verified = true on their profiles row
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId)

    if (error) {
      alert('Error updating profile: ' + error.message)
    } else {
      fetchVerifications()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Verifying developer access...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm">This moderation panel is restricted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ID Verification Moderation</h1>
          <p className="text-gray-500 text-sm mt-1">Review user-uploaded IDs and grant verified badges to trusted profiles.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">No verification documents submitted yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req.id} className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <a href={req.id_document_url} target="_blank" rel="noopener noreferrer">
                      <img src={req.id_document_url} alt="ID Document" className="w-24 h-20 rounded-xl object-cover border border-gray-200 hover:opacity-90 transition" />
                    </a>
                    <div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                        {req.id_type}
                      </span>
                      <h2 className="text-xs font-mono text-gray-500 mt-1">User ID: {req.user_id}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted: {new Date(req.submitted_at).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg uppercase ${
                      req.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {req.status}
                    </span>

                    {req.status !== 'verified' && (
                      <button
                        onClick={() => approveUserVerification(req.user_id, req.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm"
                      >
                        ✓ Approve & Verify
                      </button>
                    )}
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