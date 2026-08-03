'use client'

import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'

// Disable Server-Side Rendering for the Paystack payment gateway component
const DonationForm = dynamic(() => import('./DonationForm'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 text-sm shadow-sm">
      Loading Paystack payment gateway...
    </div>
  ),
})

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Support Our Platform
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
            Help Us Grow Credible Artisans
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-xl mx-auto leading-relaxed">
            Your generous contribution helps us maintain server infrastructure, improve artisan verification, and connect more local skilled workers with opportunities.
          </p>
        </div>

        {/* Dynamic Client-Side Only Donation Form */}
        <DonationForm />

      </div>
    </div>
  )
}