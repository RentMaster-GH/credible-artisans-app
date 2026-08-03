'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface Job {
  id: string
  title: string
  category: string
  location: string
  budget_min: number | null
  budget_max: number | null
  currency: string
  status: string
  created_at: string
  client_id: string
}

interface Bid {
  id: string
  job_id: string
  artisan_id: string
  amount: number
  proposed_timeline: string
  cover_letter: string
  status: string
  created_at: string
  jobs?: Job
}

interface ArtisanProfile {
  business_name: string | null
  primary_skill: string
  rating: number
  jobs_completed: number
  hourly_rate: number | null
  experience_years: number
  verified: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('client')
  const [fullName, setFullName] = useState<string>('User')

  // Client states
  const [clientJobs, setClientJobs] = useState<Job[]>([])
  const [bidsByJob, setBidsByJob] = useState<Record<string, any[]>>({})

  // Artisan states
  const [artisanBids, setArtisanBids] = useState<Bid[]>([])
  const [artisanProfile, setArtisanProfile] = useState<ArtisanProfile | null>(null)

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)

      // 1. Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      setUser(user)

      // 2. Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      const role = profileData?.role || user.user_metadata?.role || 'client'
      setUserRole(role)
      setFullName(profileData?.full_name || 'Valued User')

      // 3. If Artisan, fetch artisan profile and submitted bids
      if (role === 'artisan') {
        const { data: artProfile } = await supabase
          .from('artisans')
          .select('*')
          .eq('id', user.id)
          .single()

        if (artProfile) {
          setArtisanProfile(artProfile)
        }

        const { data: myBids, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            jobs:job_id (*)
          `)
          .eq('artisan_id', user.id)
          .order('created_at', { ascending: false })

        if (!bidsError && myBids) {
          setArtisanBids(myBids)
        }
      } 
      // 4. If Client, fetch posted jobs and incoming proposals
      else {
        const { data: userJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

        if (!jobsError && userJobs) {
          setClientJobs(userJobs)

          if (userJobs.length > 0) {
            const jobIds = userJobs.map((j) => j.id)
            const { data: bidsData } = await supabase
              .from('bids')
              .select(`
                *,
                artisans:artisan_id (
                  business_name,
                  primary_skill,
                  rating,
                  profiles:id (
                    full_name,
                    avatar_url
                  )
                )
              `)
              .in('job_id', jobIds)
              .order('created_at', { ascending: false })

            if (bidsData) {
              const grouped: Record<string, any[]> = {}
              bidsData.forEach((bid: any) => {
                if (!grouped[bid.job_id]) grouped[bid.job_id] = []
                grouped[bid.job_id].push(bid)
              })
              setBidsByJob(grouped)
            }
          }
        }
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [router, supabase])

  const handleClientBidAction = async (bidId: string, jobId: string, newStatus: 'accepted' | 'rejected') => {
    setActionLoading(bidId)
    setErrorMsg(null)

    const { error: updateBidError } = await supabase
      .from('bids')
      .update({ status: newStatus })
      .eq('id', bidId)

    if (updateBidError) {
      setErrorMsg(updateBidError.message || 'Failed to update proposal.')
      setActionLoading(null)
      return
    }

    if (newStatus === 'accepted') {
      await supabase.from('jobs').update({ status: 'in_progress' }).eq('id', jobId)

      const otherBids = (bidsByJob[jobId] || []).filter((b) => b.id !== bidId)
      for (const other of otherBids) {
        if (other.status === 'pending') {
          await supabase.from('bids').update({ status: 'rejected' }).eq('id', other.id)
        }
      }
    }

    // Refresh client bids
    const { data: refreshedBids } = await supabase
      .from('bids')
      .select(`
        *,
        artisans:artisan_id (
          business_name,
          primary_skill,
          rating,
          profiles:id (
            full_name,
            avatar_url
          )
        )
      `)
      .eq('job_id', jobId)

    if (refreshedBids) {
      setBidsByJob({ ...bidsByJob, [jobId]: refreshedBids })
    }

    const { data: refreshedJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (refreshedJobs) setClientJobs(refreshedJobs)
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                Welcome back, {fullName}
              </h1>
              <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-3 py-1 rounded-full uppercase">
                {userRole} Mode
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {userRole === 'artisan' 
                ? 'Manage your active project contracts, review submitted proposals, and update your trade portfolio.' 
                : 'Manage your posted projects, review artisan proposals, and award contracts.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {userRole === 'artisan' ? (
              <Link
                href="/jobs"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition"
              >
                Browse Job Board
              </Link>
            ) : (
              <Link
                href="/jobs/new"
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm transition"
              >
                + Post New Job
              </Link>
            )}
            <Link
              href="/profile"
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
            >
              Account Settings
            </Link>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* ================= ARTISAN DASHBOARD VIEW ================= */}
        {userRole === 'artisan' ? (
          <div className="space-y-8">
            
            {/* Artisan Quick Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-medium">Primary Trade Skill</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{artisanProfile?.primary_skill || 'Not Specified'}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-medium">Artisan Rating</p>
                <p className="text-lg font-bold text-amber-600 mt-1">
                  ★ {artisanProfile?.rating ? artisanProfile.rating.toFixed(1) : 'New'} ({artisanProfile?.jobs_completed || 0} jobs)
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-400 uppercase font-medium">Hourly Rate</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {artisanProfile?.hourly_rate ? `$${artisanProfile.hourly_rate}/hr` : 'Negotiable'}
                </p>
              </div>
            </div>

            {/* Active Assignments / Awarded Contracts */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Active Project Assignments</h2>
              {artisanBids.filter(b => b.status === 'accepted').length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
                  <p className="text-gray-500 text-sm">No active project assignments yet. Browse the job board and submit proposals to win contracts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {artisanBids.filter(b => b.status === 'accepted').map((bid) => (
                    <div key={bid.id} className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm bg-green-50/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
                          Assigned Contract
                        </span>
                        <span className="text-sm font-extrabold text-indigo-600">
                          {bid.jobs?.currency || '$'} {bid.amount}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{bid.jobs?.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">📍 {bid.jobs?.location}</p>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
                        <p><span className="font-semibold">Timeline:</span> {bid.proposed_timeline}</p>
                        <p><span className="font-semibold">Your Proposal:</span> {bid.cover_letter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitted Proposals Tracker */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submitted Proposals ({artisanBids.length})</h2>
              {artisanBids.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                  <p className="text-gray-600 font-medium mb-2">You haven't submitted any proposals yet.</p>
                  <p className="text-gray-400 text-sm mb-6">Explore the global job board to find open client requests.</p>
                  <Link href="/jobs" className="inline-block px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium text-sm transition">
                    Explore Job Board
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {artisanBids.map((bid) => (
                    <div key={bid.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                            bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {bid.status}
                          </span>
                          <span className="text-xs text-gray-400">Submitted on {new Date(bid.created_at).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/jobs/${bid.job_id}`} className="text-base font-bold text-gray-900 hover:text-indigo-600 transition">
                          {bid.jobs?.title || 'Job Listing'}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Timeline: {bid.proposed_timeline}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase font-medium">Bid Amount</p>
                        <p className="text-base font-bold text-indigo-600">{bid.jobs?.currency || '$'} {bid.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* ================= CLIENT DASHBOARD VIEW ================= */
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Your Posted Projects & Proposals</h2>

            {clientJobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                <p className="text-gray-600 font-medium text-base mb-2">You haven't posted any jobs yet.</p>
                <p className="text-gray-400 text-sm mb-6">Create a job request to start receiving proposals from global artisans.</p>
                <Link
                  href="/jobs/new"
                  className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition"
                >
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {clientJobs.map((job) => {
                  const bids = bidsByJob[job.id] || []

                  return (
                    <div key={job.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-full">
                              {job.category}
                            </span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                              job.status === 'open' ? 'bg-green-50 text-green-700' :
                              job.status === 'in_progress' ? 'bg-amber-50 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                          <Link href={`/jobs/${job.id}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition">
                            {job.title}
                          </Link>
                          <p className="text-xs text-gray-400 mt-1">
                            📍 {job.location} • Posted on {new Date(job.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-left md:text-right bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-xs text-gray-400 uppercase font-medium">Budget</p>
                          <p className="text-sm font-bold text-gray-900">
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

                      <div className="pt-6">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">
                          Incoming Proposals ({bids.length})
                        </h3>

                        {bids.length === 0 ? (
                          <p className="text-gray-400 text-sm italic py-2">No artisan proposals received yet for this project.</p>
                        ) : (
                          <div className="space-y-4">
                            {bids.map((bid) => {
                              const artisan = bid.artisans
                              const profile = artisan?.profiles

                              return (
                                <div
                                  key={bid.id}
                                  className={`border rounded-2xl p-5 transition ${
                                    bid.status === 'accepted' ? 'border-green-300 bg-green-50/40' :
                                    bid.status === 'rejected' ? 'border-gray-200 bg-gray-50 opacity-60' :
                                    'border-gray-200 bg-white hover:border-indigo-200 shadow-sm'
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg overflow-hidden border border-indigo-200 flex-shrink-0">
                                        {profile?.avatar_url ? (
                                          <img src={profile.avatar_url} alt={profile?.full_name} className="w-full h-full object-cover" />
                                        ) : (
                                          profile?.full_name?.charAt(0) || 'A'
                                        )}
                                      </div>
                                      <div>
                                        <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                          {profile?.full_name || 'Professional Artisan'}
                                          <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded">
                                            ★ {artisan?.rating ? artisan.rating.toFixed(1) : 'New'}
                                          </span>
                                        </h4>
                                        <p className="text-xs text-gray-500 font-medium">
                                          {artisan?.business_name || artisan?.primary_skill || 'Independent Contractor'}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                      <div className="text-left sm:text-right">
                                        <p className="text-xs text-gray-400 uppercase font-medium">Proposed Bid</p>
                                        <p className="text-lg font-extrabold text-indigo-600">
                                          {job.currency} {bid.amount}
                                        </p>
                                      </div>
                                      <span className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
                                        bid.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        bid.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                        'bg-amber-100 text-amber-800'
                                      }`}>
                                        {bid.status}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm text-gray-700 space-y-2 border border-gray-100">
                                    <p className="text-xs font-semibold text-gray-900">
                                      ⏱️ Proposed Timeline: <span className="font-normal text-gray-600">{bid.proposed_timeline}</span>
                                    </p>
                                    <p className="text-xs leading-relaxed">
                                      <span className="font-semibold text-gray-900">Cover Letter:</span> {bid.cover_letter}
                                    </p>
                                  </div>

                                  {bid.status === 'pending' && (
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                      <button
                                        disabled={actionLoading === bid.id}
                                        onClick={() => handleClientBidAction(bid.id, job.id, 'rejected')}
                                        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 font-medium text-xs hover:bg-gray-100 transition disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                      <button
                                        disabled={actionLoading === bid.id}
                                        onClick={() => handleClientBidAction(bid.id, job.id, 'accepted')}
                                        className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium text-xs shadow-sm transition disabled:opacity-50"
                                      >
                                        {actionLoading === bid.id ? 'Processing...' : 'Accept & Award Project'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}