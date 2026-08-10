'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

export default function VerificationUploadPage() {
  const [idType, setIdType] = useState('National ID / Ghana Card')
  const [documentUrl, setDocumentUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await (supabase.from as any)('verifications').insert({
      user_id: user.id,
      id_type: idType,
      id_document_url: documentUrl,
      status: 'pending',
    } as any)

    if (error) {
      setErrorMsg('Failed to submit verification request: ' + error.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-2xl mx-auto pt-10 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Identity Verification</h1>
          <p className="text-gray-500 text-sm mt-1">
            Upload your government-issued ID card to get the verified badge on your profile.
          </p>
        </div>

        {submitted ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Verification Documents Submitted</h2>
            <p className="text-gray-500 text-xs mb-6">Our admin team will review your ID and update your account badge shortly.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-indigo-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm">
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmitVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Document ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="National ID / Ghana Card">National ID / Ghana Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Voter ID">Voter ID</option>
                  <option value="Driver's License">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">ID Document Image URL</label>
                <input
                  type="url"
                  required
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  placeholder="https://example.com/my-id-card.jpg"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-400 mt-1">Provide a direct URL link to a clear photo of your ID card.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition shadow-sm"
              >
                {loading ? 'Submitting Documents...' : 'Submit ID for Verification'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

