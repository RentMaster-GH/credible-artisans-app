'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface Job {
  id: string
  client_id: string
  title: string
  description: string
  category: string
  location: string
  budget_min: number | null
  budget_max: number | null
  currency: string
  status: string
  created_at: string
}

interface Bid {
  id: string
  amount: number
  proposed_timeline: string
  cover_letter: string
  status: string
  created_at: string
  artisan_id: string
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const jobId = resolvedParams.id

  const [job, setJob] = useState<Job | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [submittingBid, setSubmittingBid] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Bid form state
  const [bidForm, setBidForm] = useState({
    amount: '',
    proposed_timeline: '',
    cover_letter: '',
  })

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true)

      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null
      setCurrentUser(user)
      if (user) {
        setUserRole(user.user_metadata?.role || 'client')
      }

      // 2. Fetch Job Details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError) {
        console.error('Error fetching job:', jobError)
      } else {
        setJob(jobData as unknown as Job)
      }

      // 3. Fetch Bids for this Job
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })

      if (!bidsError) {
        setBids((bidsData as unknown as Bid[]) || [])
      }

      setLoading(false)
    }

    fetchJobData()
  }, [jobId, supabase])

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmittingBid(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!currentUser) {
      setErrorMsg('You must be signed in as an artisan to submit a proposal.')
      setSubmittingBid(false)
      return
    }

    const amountNum = parseFloat(bidForm.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMsg('Please enter a valid bid amount.')
      setSubmittingBid(false)
      return
    }

    if (!bidForm.proposed_timeline.trim() || !bidForm.cover_letter.trim()) {
      setErrorMsg('Please complete all proposal fields.')
      setSubmittingBid(false)
      return
    }

    // Insert Bid
    const { error: insertError } = await (supabase.from as any)('bids').insert({
      job_id: jobId,
      artisan_id: currentUser.id,
      amount: amountNum,
      proposed_timeline: bidForm.proposed_timeline.trim(),
      cover_letter: bidForm.cover_letter.trim(),
      status: 'pending',
    })

    if (insertError) {
      console.error('Error submitting bid:', insertError)
      setErrorMsg(insertError.message || 'Failed to submit proposal. Ensure you have an artisan profile setup.')
    } else {
      setSuccessMsg('Your proposal has been submitted successfully!')
      setBidForm({ amount: '', proposed_timeline: '', cover_letter: '' })
      // Refresh bids
      const { data: refreshedBids } = await supabase
        .from('bids')
        .select('*')
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
      if (refreshedBids) setBids(refreshedBids as unknown as Bid[])
    }

    setSubmittingBid(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500">Loading job details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Job Not Found</h1>
          <p className="text-gray-500 mt-2">The requested job listing may have been removed.</p>
          <Link href="/jobs" className="mt-6 inline-block text-indigo-600 font-medium">
            ← Return to Job Board
          </Link>
        </div>
      </div>
    )
  }

  const isJobOwner = currentUser && currentUser.id === job.client_id

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Breadcrumb */}
        <Link href="/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mb-6">
          ← Back to Job Board
        </Link>

        {/* Job Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5 mb-6">
            <div>
              <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-3 py-1 rounded-full">
                {job.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                {job.title}
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-gray-400 uppercase font-medium">Budget</p>
              <p className="text-lg font-bold text-gray-900">
                {job.budget_min !== null || job.budget_max !== null ? (
                  <>
                    {job.currency} {job.budget_min ?? '0'} {job.budget_max ? `- ${job.budget_max}` : '+'}
                  </>
                ) : (
                  'Open Budget'
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 mb-6 bg-gray-50 p-4 rounded-xl">
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Location:</span> {job.location}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">Posted on:</span> {new Date(job.created_at).toLocaleDateString()}
            </p>
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Project Description</h3>
            <p className="text-gray-700 text-sm whitespace-pre-line leading-relaxed">
              {job.description}
            </p>
          </div>
        </div>

        {/* Proposals / Bids Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Proposals Submitted ({bids.length})
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-500 text-sm italic mb-8">No proposals submitted yet. Be the first artisan to bid on this project!</p>
          ) : (
            <div className="space-y-4 mb-8">
              {bids.map((bid) => (
                <div key={bid.id} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-base font-bold text-gray-900">
                      {job.currency} {bid.amount}
                    </p>
                    <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium capitalize">
                      {bid.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">Timeline: {bid.proposed_timeline}</p>
                  <p className="text-sm text-gray-700">{bid.cover_letter}</p>
                </div>
              ))}
            </div>
          )}

          {/* Submit Bid Form (Only for non-owners / artisans) */}
          {!isJobOwner && (
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Submit Your Proposal</h3>

              {errorMsg && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
                  {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Proposed Bid Amount ({job.currency}) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={bidForm.amount}
                      onChange={(e) => setBidForm({ ...bidForm, amount: e.target.value })}
                      placeholder="e.g., 450"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Estimated Timeline <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={bidForm.proposed_timeline}
                      onChange={(e) => setBidForm({ ...bidForm, proposed_timeline: e.target.value })}
                      placeholder="e.g., 3 Days or 2 Weeks"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cover Letter & Relevant Experience <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={bidForm.cover_letter}
                    onChange={(e) => setBidForm({ ...bidForm, cover_letter: e.target.value })}
                    placeholder="Describe why you are qualified for this project, mention past similar work, or specify material breakdowns..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingBid}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm disabled:opacity-50 transition"
                >
                  {submittingBid ? 'Submitting Proposal...' : 'Submit Proposal'}
                </button>
              </form>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}

