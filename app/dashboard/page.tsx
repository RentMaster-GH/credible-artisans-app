// app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { InPageChatModal } from '@/components/chat/InPageChatModal'

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
  business_name?: string | null
  primary_skill?: string | null
  rating?: number | null
  jobs_completed?: number | null
  hourly_rate?: number | null
  experience_years?: number | null
  verified?: boolean | null
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

  // In-Page Chat State
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [recipientName, setRecipientName] = useState<string>('User')

  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchDashboardData = async () => {
      setLoading(true)

      // 1. Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        if (isMounted) {
          router.push('/login')
        }
        return
      }

      if (!isMounted) return
      setUser(user)

      // 2. Fetch user profile
      let { data: profileData } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', user.id)
        .single()

      // ✅ FIX FOR GOOGLE OAUTH: If profile row doesn't exist, create it automatically!
      if (!profileData) {
        const googleName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split('@')[0] ||
          'Valued User'
        const googleRole = user.user_metadata?.role || 'client'

        await (supabase.from as any)('profiles').upsert({
          id: user.id,
          full_name: googleName,
          role: googleRole,
        } as any)

        profileData = { role: googleRole, full_name: googleName }
      }

      const role = profileData?.role || user.user_metadata?.role || 'client'
      setUserRole(role)
      setFullName(profileData?.full_name || 'Valued User')

      // 3. If Artisan, fetch artisan profile and submitted bids
      if (role === 'artisan') {
        let { data: artProfile } = await supabase
          .from('artisans')
          .select('*')
          .eq('id', user.id)
          .single()

        // If Google user switched to Artisan, auto-create artisans table row if missing
        if (!artProfile) {
          await (supabase.from as any)('artisans').upsert({
            id: user.id,
            business_name: (profileData?.full_name || 'Artisan') + ' Services',
            primary_skill: 'General Artisan',
          } as any)

          const { data: newArtProfile } = await supabase
            .from('artisans')
            .select('*')
            .eq('id', user.id)
            .single()

          artProfile = newArtProfile
        }

        if (artProfile && isMounted) {
          setArtisanProfile(artProfile as unknown as ArtisanProfile)
        }

        const { data: myBids, error: bidsError } = await supabase
          .from('bids')
          .select(`
            *,
            jobs:job_id (*)
          `)
          .eq('artisan_id', user.id)
          .order('created_at', { ascending: false })

        if (!bidsError && myBids && isMounted) {
          setArtisanBids(myBids as unknown as Bid[])
        }
      } 
      // 4. If Client, fetch posted jobs and incoming proposals
      else {
        const { data: userJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false })

        if (!jobsError && userJobs && isMounted) {
          setClientJobs(userJobs as unknown as Job[])

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

            if (bidsData && isMounted) {
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

      if (isMounted) {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [router, supabase])

  // Instant Mode Switcher Handler
  const handleSwitchRole = async (newRole: 'client' | 'artisan') => {
    setLoading(true)

    await (supabase.from as any)('profiles').upsert({
      id: user.id,
      role: newRole,
      full_name: fullName,
    } as any)

    if (newRole === 'artisan') {
      await (supabase.from as any)('artisans').upsert({
        id: user.id,
        business_name: fullName + ' Trade Services',
        primary_skill: 'General Artisan',
      } as any)
    }

    await supabase.auth.updateUser({
      data: { role: newRole }
    })

    window.location.reload()
  }

  // Open Live Chat directly inside the Portal Page
  const handleOpenLiveChat = async (artisanId: string, artisanName: string) => {
    try {
      const { data: room, error } = await (supabase.from as any)('chat_rooms')
        .upsert(
          { artisan_id: artisanId, client_id: user.id },
          { onConflict: 'artisan_id,client_id' }
        )
        .select('id')
        .single()

      if (error) throw error

      if (room) {
        setRecipientName(artisanName)
        setActiveRoomId(room.id) // Opens floating in-page chat modal
      }
    } catch (err: any) {
      alert('Failed to connect chat: ' + err.message)
    }
  }

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
      await (supabase.from as any)('jobs').update({ status: 'in_progress' }).eq('id', jobId)

      const otherBids = (bidsByJob[jobId] || []).filter((b) => b.id !== bidId)
      for (const other of otherBids) {
        if (other.status === 'pending') {
          await (supabase.from as any)('bids').update({ status: 'rejected' }).eq('id', other.id)
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

    if (refreshedJobs) setClientJobs(refreshedJobs as unknown as Job[])
    setActionLoading(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center">
        <Navbar />
        <div className="my-auto flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-xs font-semibold tracking-wider uppercase">Loading your Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* HERO ROLE SWITCHER BANNER */}
        <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-400/20">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-black/30 backdrop-blur-md text-amber-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-widest border border-amber-300/30">
                Active Portal: {userRole === 'artisan' ? '🛠️ Artisan Work Portal' : '👤 Client Hiring Portal'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
                Welcome back, {fullName}!
              </h1>
              <p className="text-amber-100 text-sm mt-1 max-w-xl">
                {userRole === 'artisan'
                  ? 'Manage your active project contracts, review submitted proposals, and generate BOQ estimates.'
                  : 'Manage your posted projects, review artisan proposals, and award contracts.'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => handleSwitchRole(userRole === 'client' ? 'artisan' : 'client')}
                className="bg-white text-gray-900 hover:bg-amber-100 font-black text-xs px-5 py-3 rounded-2xl shadow-xl transition transform hover:-translate-y-0.5"
              >
                Switch to {userRole === 'client' ? '🛠️ Artisan Mode' : '👤 Client Mode'}
              </button>

              {userRole === 'artisan' ? (
                <Link
                  href="/artisans/boq"
                  className="bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow transition"
                >
                  📐 Generate BOQ Estimate
                </Link>
              ) : (
                <Link
                  href="/jobs/new"
                  className="bg-black/40 hover:bg-black/60 border border-white/20 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow transition"
                >
                  + Post New Job Request
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* PORTAL METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Account Status</p>
            <p className="text-xl font-black text-green-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
              Verified User
            </p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {userRole === 'artisan' ? 'Submitted Proposals' : 'Posted Projects'}
            </p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {userRole === 'artisan' ? artisanBids.length : clientJobs.length}
            </p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Live Video & Messaging</p>
            <p className="text-xl font-black text-blue-400 mt-1">100% In-App</p>
          </div>

          <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl backdrop-blur-md shadow-lg">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              {userRole === 'artisan' ? 'Trade Skill' : 'Active Contracts'}
            </p>
            <p className="text-lg font-black text-white mt-1">
              {userRole === 'artisan' ? (artisanProfile?.primary_skill || 'General Artisan') : 'Instant Award'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-900/50 border border-red-500/50 text-red-200 text-sm rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* ================= ARTISAN PORTAL CONTENT ================= */}
        {userRole === 'artisan' ? (
          <div className="space-y-8">
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl">
                <p className="text-xs text-gray-400 uppercase font-bold">Primary Skill</p>
                <p className="text-lg font-bold text-white mt-1">{artisanProfile?.primary_skill || 'General Artisan'}</p>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl">
                <p className="text-xs text-gray-400 uppercase font-bold">Rating</p>
                <p className="text-lg font-bold text-amber-400 mt-1">
                  ★ {artisanProfile?.rating ? artisanProfile.rating.toFixed(1) : 'New'} ({artisanProfile?.jobs_completed || 0} jobs)
                </p>
              </div>
              <div className="bg-gray-900/80 border border-gray-800 p-5 rounded-2xl">
                <p className="text-xs text-gray-400 uppercase font-bold">Rate</p>
                <p className="text-lg font-bold text-white mt-1">
                  {artisanProfile?.hourly_rate ? `$${artisanProfile.hourly_rate}/hr` : 'Negotiable'}
                </p>
              </div>
            </div>

            {/* Active Assignments */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Active Contracts</h2>
              {artisanBids.filter(b => b.status === 'accepted').length === 0 ? (
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center text-gray-400 text-xs">
                  No active project assignments yet. Browse the job board and submit proposals to win contracts.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {artisanBids.filter(b => b.status === 'accepted').map((bid) => (
                    <div key={bid.id} className="bg-green-900/20 border border-green-500/30 p-6 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border border-green-500/30">
                          Assigned Contract
                        </span>
                        <span className="text-sm font-black text-amber-400">{bid.jobs?.currency || 'GH₵'} {bid.amount}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white">{bid.jobs?.title}</h3>
                      <p className="text-xs text-gray-400">📍 {bid.jobs?.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submitted Proposals Tracker */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Your Submitted Proposals ({artisanBids.length})</h2>
              {artisanBids.length === 0 ? (
                <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-10 text-center space-y-3">
                  <p className="text-gray-400 text-sm">You haven't submitted any proposals yet.</p>
                  <Link href="/jobs" className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition">
                    Explore Job Board
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {artisanBids.map((bid) => (
                    <div key={bid.id} className="bg-gray-900/90 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            bid.status === 'accepted' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            bid.status === 'rejected' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {bid.status}
                          </span>
                          <span className="text-xs text-gray-400">Submitted {new Date(bid.created_at).toLocaleDateString()}</span>
                        </div>
                        <Link href={`/jobs/${bid.job_id}`} className="text-base font-bold text-white hover:text-amber-400 transition">
                          {bid.jobs?.title || 'Job Listing'}
                        </Link>
                        <p className="text-xs text-gray-400 mt-1">Timeline: {bid.proposed_timeline}</p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 uppercase font-bold">Bid Amount</p>
                        <p className="text-base font-black text-amber-400">{bid.jobs?.currency || 'GH₵'} {bid.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* ================= CLIENT PORTAL CONTENT ================= */
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-white">Your Posted Projects & Incoming Proposals</h2>

            {clientJobs.length === 0 ? (
              <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-10 text-center space-y-3">
                <p className="text-gray-400 text-sm">You haven't posted any jobs yet. Create a job request to receive proposals from global artisans.</p>
                <Link href="/jobs/new" className="inline-block bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-3 rounded-xl transition">
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {clientJobs.map((job) => {
                  const bids = bidsByJob[job.id] || []

                  return (
                    <div key={job.id} className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
                        <div>
                          <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase">
                            {job.category}
                          </span>
                          <h3 className="text-2xl font-black text-white mt-2">{job.title}</h3>
                          <p className="text-xs text-gray-400 mt-1">📍 {job.location} • Posted {new Date(job.created_at).toLocaleDateString()}</p>
                        </div>

                        <div className="bg-gray-800/80 p-3 rounded-xl border border-gray-700/60 text-left md:text-right">
                          <p className="text-[10px] text-gray-400 uppercase font-bold">Estimated Budget</p>
                          <p className="text-base font-black text-amber-400">
                            {job.currency} {job.budget_min || '0'} {job.budget_max ? `- ${job.budget_max}` : '+'}
                          </p>
                        </div>
                      </div>

                      {/* Proposals List */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                          Incoming Proposals ({bids.length})
                        </h4>

                        {bids.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">No proposals received yet.</p>
                        ) : (
                          bids.map((bid) => {
                            const artisan = bid.artisans
                            const profile = artisan?.profiles
                            const artisanName = profile?.full_name || artisan?.business_name || 'Professional Artisan'

                            return (
                              <div key={bid.id} className="bg-gray-800/50 border border-gray-700/60 rounded-xl p-4 sm:p-5 space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div>
                                    <h5 className="font-bold text-sm text-white flex items-center gap-2">
                                      {artisanName}
                                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                                        ★ {artisan?.rating ? artisan.rating.toFixed(1) : 'New'}
                                      </span>
                                    </h5>
                                    <p className="text-xs text-gray-400">Timeline: {bid.proposed_timeline}</p>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="text-base font-black text-amber-400">{job.currency} {bid.amount}</span>

                                    {/* In-Page Live Chat Button */}
                                    <button
                                      onClick={() => handleOpenLiveChat(bid.artisan_id, artisanName)}
                                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow transition flex items-center gap-1"
                                    >
                                      💬 Chat & Video Call
                                    </button>
                                  </div>
                                </div>

                                <p className="text-xs text-gray-300 bg-gray-900/60 p-3 rounded-lg border border-gray-800">{bid.cover_letter}</p>

                                {bid.status === 'pending' && (
                                  <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                      disabled={actionLoading === bid.id}
                                      onClick={() => handleClientBidAction(bid.id, job.id, 'rejected')}
                                      className="px-4 py-1.5 rounded-lg border border-gray-700 text-gray-300 font-bold text-xs hover:bg-gray-800 transition disabled:opacity-50"
                                    >
                                      Reject
                                    </button>
                                    <button
                                      disabled={actionLoading === bid.id}
                                      onClick={() => handleClientBidAction(bid.id, job.id, 'accepted')}
                                      className="px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white font-black text-xs shadow-md transition disabled:opacity-50"
                                    >
                                      {actionLoading === bid.id ? 'Processing...' : 'Accept & Award Contract'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* FLOATING IN-PAGE CHAT & VIDEO CALL DRAWER */}
      {activeRoomId && user && (
        <InPageChatModal
          isOpen={!!activeRoomId}
          onClose={() => setActiveRoomId(null)}
          roomId={activeRoomId}
          currentUserId={user.id}
          currentUserName={fullName}
          recipientName={recipientName}
        />
      )}
    </div>
  )
}