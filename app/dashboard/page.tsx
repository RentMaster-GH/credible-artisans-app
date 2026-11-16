'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { backend } from '@/lib/backend'
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
  id?: string
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

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>('client')
  const [fullName, setFullName] = useState<string>('User')
  const [profileRecordId, setProfileRecordId] = useState<string | null>(null)

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

      try {
        // 1. Get authenticated user from custom backend
        const { payload } = await backend.getMe()
        const custom = (payload.custom as Record<string, any>) || {}
        const userId = payload.sub as string
        const defaultName = custom.full_name || 'Valued User'
        const defaultRole = custom.account_type || (payload.role as string) || 'client'

        if (!isMounted) return
        setUser({ id: userId, role: defaultRole, full_name: defaultName })

        // 2. Fetch or initialize user profile in custom backend 'profiles' collection
        const profileRecords = await backend.list<any>('profiles')
        let myProfile = profileRecords.find((p) => p.owner_id === userId || p.data?.user_id === userId)

        if (!myProfile) {
          myProfile = await backend.create<any>('profiles', {
            user_id: userId,
            role: defaultRole,
            full_name: defaultName,
          })
        }

        if (!isMounted) return
        setProfileRecordId(myProfile.id)
        const role = myProfile.data?.role || defaultRole
        const resolvedName = myProfile.data?.full_name || defaultName
        setUserRole(role)
        setFullName(resolvedName)

        // 3. Load role-specific records
        if (role === 'artisan') {
          const artisanRecords = await backend.list<any>('artisans')
          let myArtisan = artisanRecords.find((a) => a.owner_id === userId || a.data?.user_id === userId)

          if (!myArtisan) {
            myArtisan = await backend.create<any>('artisans', {
              user_id: userId,
              business_name: `${resolvedName} Services`,
              primary_skill: 'General Artisan',
              rating: null,
              jobs_completed: 0,
              hourly_rate: null,
            })
          }

          if (isMounted) {
            setArtisanProfile({ id: myArtisan.id, ...(myArtisan.data || {}) })
          }

          const allBids = await backend.list<any>('bids')
          const allJobs = await backend.list<any>('jobs')
          const jobMap = new Map(allJobs.map((j) => [j.id, { id: j.id, ...(j.data || {}), created_at: j.created_at }]))

          const myBids: Bid[] = allBids
            .filter((b) => b.owner_id === userId || b.data?.artisan_id === userId)
            .map((b) => ({
              id: b.id,
              ...(b.data || {}),
              created_at: b.created_at,
              jobs: jobMap.get(b.data?.job_id),
            }))

          if (isMounted) {
            setArtisanBids(myBids)
          }
        } else {
          const allJobs = await backend.list<any>('jobs')
          const myJobs: Job[] = allJobs
            .filter((j) => j.owner_id === userId || j.data?.client_id === userId)
            .map((j) => ({
              id: j.id,
              ...(j.data || {}),
              created_at: j.created_at,
            }))

          if (isMounted) {
            setClientJobs(myJobs)
          }

          if (myJobs.length > 0) {
            const jobIds = new Set(myJobs.map((j) => j.id))
            const allBids = await backend.list<any>('bids')
            const grouped: Record<string, any[]> = {}

            allBids.forEach((b) => {
              const jobId = b.data?.job_id
              if (jobId && jobIds.has(jobId)) {
                if (!grouped[jobId]) grouped[jobId] = []
                grouped[jobId].push({
                  id: b.id,
                  ...(b.data || {}),
                  created_at: b.created_at,
                })
              }
            })

            if (isMounted) {
              setBidsByJob(grouped)
            }
          }
        }

        if (isMounted) {
          setLoading(false)
        }
      } catch {
        if (isMounted) {
          router.push('/login')
        }
      }
    }

    fetchDashboardData()

    return () => {
      isMounted = false
    }
  }, [router])

  // Instant Mode Switcher Handler
  const handleSwitchRole = async (newRole: 'client' | 'artisan') => {
    if (!user) return
    setLoading(true)

    try {
      if (profileRecordId) {
        await backend.update('profiles', profileRecordId, {
          role: newRole,
          full_name: fullName,
        })
      } else {
        await backend.create('profiles', {
          user_id: user.id,
          role: newRole,
          full_name: fullName,
        })
      }

      if (newRole === 'artisan') {
        const artisanRecords = await backend.list<any>('artisans')
        const existingArtisan = artisanRecords.find((a) => a.owner_id === user.id || a.data?.user_id === user.id)
        if (!existingArtisan) {
          await backend.create('artisans', {
            user_id: user.id,
            business_name: `${fullName} Trade Services`,
            primary_skill: 'General Artisan',
          })
        }
      }

      window.location.reload()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to switch role.')
      setLoading(false)
    }
  }

  // Open Live Chat directly inside the Portal Page
  const handleOpenLiveChat = async (artisanId: string, artisanName: string) => {
    try {
      const existingRooms = await backend.list<any>('chat_rooms')
      let room = existingRooms.find(
        (r) => r.data?.artisan_id === artisanId && r.data?.client_id === user.id
      )

      if (!room) {
        room = await backend.create<any>('chat_rooms', {
          artisan_id: artisanId,
          artisan_name: artisanName,
          client_id: user.id,
        })
      }

      if (room?.id) {
        setRecipientName(artisanName)
        setActiveRoomId(room.id)
      }
    } catch (err: any) {
      alert('Failed to connect chat: ' + err.message)
    }
  }

  const handleClientBidAction = async (bidId: string, jobId: string, newStatus: 'accepted' | 'rejected') => {
    setActionLoading(bidId)
    setErrorMsg(null)

    try {
      await backend.update('bids', bidId, { status: newStatus })

      if (newStatus === 'accepted') {
        await backend.update('jobs', jobId, { status: 'in_progress' })

        const otherBids = (bidsByJob[jobId] || []).filter((b) => b.id !== bidId)
        for (const other of otherBids) {
          if (other.status === 'pending') {
            await backend.update('bids', other.id, { status: 'rejected' })
          }
        }
      }

      // Update local UI state cleanly
      const updatedJobBids = (bidsByJob[jobId] || []).map((b) => {
        if (b.id === bidId) return { ...b, status: newStatus }
        if (newStatus === 'accepted' && b.status === 'pending') return { ...b, status: 'rejected' }
        return b
      })

      setBidsByJob({ ...bidsByJob, [jobId]: updatedJobBids })

      if (newStatus === 'accepted') {
        setClientJobs(
          clientJobs.map((j) => (j.id === jobId ? { ...j, status: 'in_progress' } : j))
        )
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update proposal.')
    } finally {
      setActionLoading(null)
    }
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
                  href="/artisan/boq"
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
                  <p className="text-gray-400 text-sm">You haven&apos;t submitted any proposals yet.</p>
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
                <p className="text-gray-400 text-sm">You haven&apos;t posted any jobs yet. Create a job request to receive proposals from global artisans.</p>
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
                            const artisanName = bid.artisan_name || profile?.full_name || artisan?.business_name || 'Professional Artisan'

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
