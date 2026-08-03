'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface ArtisanProfile {
  id: string
  full_name: string
  skills?: string[] | string | null
  location?: string | null
  hourly_rate?: number | null
  latitude?: number | null
  longitude?: number | null
  distance?: number
}

// Haversine formula to calculate distance in kilometers between two lat/lng points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

const GHANA_LOCATIONS: { [key: string]: { lat: number; lng: number } } = {
  'Cape Coast': { lat: 5.1053, lng: -1.2466 },
  'Takoradi': { lat: 4.8985, lng: -1.7554 },
  'Accra': { lat: 5.6037, lng: -0.1870 },
  'Kumasi': { lat: 6.6885, lng: -1.6244 },
  'Tamale': { lat: 9.4075, lng: -0.8534 },
  'Koforidua': { lat: 6.0945, lng: -0.2631 },
  'Sunyani': { lat: 7.3399, lng: -2.3290 },
}

export default function NearbyArtisansPage() {
  const [artisans, setArtisans] = useState<ArtisanProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState('Cape Coast')
  const [searchMethod, setSearchMethod] = useState<'gps' | 'district'>('district')

  const supabase = createClient()

  // Default to Cape Coast coordinates on initial load
  useEffect(() => {
    handleDistrictChange('Cape Coast')
  }, [])

  const handleGetGPSLocation = () => {
    setLoading(true)
    setSearchMethod('gps')
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        setUserLocation({ lat, lng })
        fetchAndSortArtisans(lat, lng)
      },
      (error) => {
        alert('Unable to retrieve your location. Please select a district instead.')
        setLoading(false)
      }
    )
  }

  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district)
    setSearchMethod('district')
    const coords = GHANA_LOCATIONS[district]
    if (coords) {
      setUserLocation(coords)
      fetchAndSortArtisans(coords.lat, coords.lng)
    }
  }

  const fetchAndSortArtisans = async (refLat: number, refLng: number) => {
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*')

    if (!error && data) {
      const processed: ArtisanProfile[] = (data as any[]).map((artisan) => {
        let distance = 0
        if (artisan.latitude && artisan.longitude) {
          distance = calculateDistance(refLat, refLng, artisan.latitude, artisan.longitude)
        } else {
          // Mock arbitrary distance if coordinates aren't set yet
          distance = Math.floor(Math.random() * 15) + 1
        }
        return {
          id: artisan.id,
          full_name: artisan.full_name,
          skills: artisan.skills || null,
          location: artisan.location || null,
          hourly_rate: artisan.hourly_rate || null,
          latitude: artisan.latitude,
          longitude: artisan.longitude,
          distance,
        }
      })

      // Sort by closest proximity
      processed.sort((a, b) => (a.distance || 0) - (b.distance || 0))
      setArtisans(processed)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Artisans Near Me</h1>
          <p className="text-gray-500 text-sm mt-1">
            Discover verified local professionals sorted by proximity to your current location.
          </p>
        </div>

        {/* Location Control Toolbar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleGetGPSLocation}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-sm ${
                searchMethod === 'gps'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📍 Use My Current GPS Location
            </button>
          </div>

          <div className="w-full md:w-72 flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 shrink-0">District:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {Object.keys(GHANA_LOCATIONS).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}, Ghana
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-500 text-sm">Calculating nearby distances...</div>
        ) : artisans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-gray-600 font-medium">No nearby artisans found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-700 font-bold rounded-full flex items-center justify-center text-lg">
                        {artisan.full_name ? artisan.full_name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-gray-900">{artisan.full_name}</h2>
                        <p className="text-xs text-gray-400">📍 {artisan.location || 'Local Area'}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {artisan.distance?.toFixed(1)} km away
                    </span>
                  </div>

                  <p className="text-gray-600 text-xs line-clamp-2 mb-4">
                    Professional local artisan ready to assist with your construction or maintenance needs.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-2">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-medium">Rate</p>
                    <p className="text-sm font-bold text-gray-900">
                      {artisan.hourly_rate ? `GHS ${artisan.hourly_rate}/hr` : 'Negotiable'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/messages/${artisan.id}`}
                      className="text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-lg transition"
                    >
                      Chat
                    </Link>
                    <Link
                      href={`/artisans/${artisan.id}`}
                      className="text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-2 rounded-lg transition"
                    >
                      Profile →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}