'use client'

import { useEffect, useState } from 'react'
import { backend } from '@/lib/backend'
import Navbar from '@/components/Navbar'

interface Ad {
  id: string
  business_name: string
  creative_url: string
  destination_url: string
  ad_slot: string
  status: string
  created_at: string
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [placement, setPlacement] = useState('sidebar')
  const [submitting, setSubmitting] = useState(false)

  const fetchAds = async () => {
    setLoading(true)
    try {
      const records = await backend.list<any>('ads')
      const formatted: Ad[] = records.map((rec) => ({
        id: rec.id,
        business_name: rec.data?.business_name || rec.data?.shop_name || 'Sponsored Ad',
        creative_url: rec.data?.creative_url || rec.data?.image_url || '',
        destination_url: rec.data?.destination_url || '',
        ad_slot: rec.data?.ad_slot || 'sidebar',
        status: rec.data?.status || 'active',
        created_at: rec.created_at,
      }))
      setAds(formatted)
    } catch (err) {
      console.error('Failed to fetch ads:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkUserAndFetchAds = async () => {
      try {
        await backend.getMe()
        setAuthorized(true)
        await fetchAds()
      } catch {
        setAuthorized(false)
        setLoading(false)
      }
    }

    checkUserAndFetchAds()
  }, [])

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await backend.create('ads', {
        business_name: title,
        shop_name: title,
        creative_url: imageUrl,
        image_url: imageUrl,
        destination_url: targetUrl,
        ad_slot: placement,
        status: 'active',
      })
      setTitle('')
      setImageUrl('')
      setTargetUrl('')
      await fetchAds()
    } catch (err: any) {
      alert('Error creating ad: ' + (err.message || 'Failed to publish ad'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleAdStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active'
    try {
      await backend.update('ads', id, { status: newStatus })
      setAds(ads.map((ad) => (ad.id === id ? { ...ad, status: newStatus } : ad)))
    } catch (err: any) {
      alert('Failed to update ad status: ' + err.message)
    }
  }

  const deleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return

    try {
      await backend.remove('ads', id)
      setAds(ads.filter((ad) => ad.id !== id))
    } catch (err: any) {
      alert('Failed to delete ad: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Verifying access...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm">Please log in to access the management panel.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Developer Ad Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Upload, manage, and toggle paid ads banners across the platform.</p>
        </div>

        {/* Create Ad Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Post a New Ad</h2>

          <form onSubmit={handleCreateAd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ad Title / Brand Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bosch Power Tools Promo"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Placement Location</label>
              <select
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sidebar">Sidebar</option>
                <option value="banner">Banner / Feed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Link (Website / WhatsApp / Promo URL)</label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://wa.me/233..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-sm transition"
              >
                {submitting ? 'Publishing Ad...' : 'Publish Ad'}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Ads Management Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-base font-bold text-gray-900">Active & Past Ads</h2>
          </div>

          {ads.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">No ads created yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {ads.map((ad) => {
                const isActive = ad.status === 'active'
                return (
                  <div key={ad.id} className="p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img src={ad.creative_url} alt={ad.business_name} className="w-16 h-16 rounded-lg object-cover border border-gray-200" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{ad.business_name}</h3>
                        <p className="text-xs text-gray-400">Placement: <span className="uppercase">{ad.ad_slot}</span></p>
                        <a href={ad.destination_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:underline truncate max-w-xs block">
                          {ad.destination_url}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => toggleAdStatus(ad.id, ad.status)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                          isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {isActive ? 'Active (Click to Pause)' : 'Paused (Click to Activate)'}
                      </button>
                      <button
                        onClick={() => deleteAd(ad.id)}
                        className="text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
