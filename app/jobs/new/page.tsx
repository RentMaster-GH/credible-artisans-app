'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Carpentry & Woodwork',
  'Welding & Fabrication',
  'Plumbing & Piping',
  'Electrical Installation',
  'Masonry & Construction',
  'Painting & Decorating',
  'Roofing & Ceiling',
  'Solar & Inverter Setup',
  'Tiling & Flooring',
  'General Maintenance',
]

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
]

export default function PostNewJobPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    location: '',
    budget_min: '',
    budget_max: '',
    currency: 'USD',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // 1. Get authenticated client session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setErrorMsg('You must be signed in to post a job request.')
      setLoading(false)
      return
    }

    // 2. Validate inputs
    if (!formData.title.trim() || !formData.description.trim() || !formData.location.trim()) {
      setErrorMsg('Please fill in all required fields.')
      setLoading(false)
      return
    }

    const minBudget = formData.budget_min ? parseFloat(formData.budget_min) : null
    const maxBudget = formData.budget_max ? parseFloat(formData.budget_max) : null

    if (minBudget && maxBudget && minBudget > maxBudget) {
      setErrorMsg('Minimum budget cannot exceed maximum budget.')
      setLoading(false)
      return
    }

    // 3. Insert job into Supabase
    const { error: insertError } = await supabase
      .from('jobs')
      .insert({
        client_id: user.id,
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        location: formData.location.trim(),
        budget_min: minBudget,
        budget_max: maxBudget,
        currency: formData.currency,
        status: 'open',
      })

    if (insertError) {
      console.error('Error posting job:', insertError)
      setErrorMsg(insertError.message || 'Failed to submit job posting. Please try again.')
      setLoading(false)
      return
    }

    // 4. Redirect to Dashboard
    router.push(`/dashboard`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Form Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
          <div className="border-b border-gray-100 pb-5 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Post a Job Request</h1>
            <p className="text-gray-500 text-sm mt-1">
              Describe your project or maintenance need to receive competitive quotes from verified global artisans.
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Custom Hardwood Workbench & Wall Storage Unit"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
              />
            </div>

            {/* Category Select */}
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-1">
                Trade Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none bg-white transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Global Location Input */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
                Project Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Austin, TX, USA or London, UK or Remote / Global"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
              />
              <p className="text-xs text-gray-400 mt-1">Specify city, state/region, and country, or indicate if remote work is accepted.</p>
            </div>

            {/* Budget Configuration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Estimated Budget Range
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="number"
                  name="budget_min"
                  value={formData.budget_min}
                  onChange={handleChange}
                  placeholder="Min Amount"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                />
                <input
                  type="number"
                  name="budget_max"
                  value={formData.budget_max}
                  onChange={handleChange}
                  placeholder="Max Amount"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none bg-white transition"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-gray-400 mt-1">Leave budget blank if open to competitive proposals.</p>
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                Job Details & Requirements <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide details about specifications, dimensions, materials needed, timeline expectations, or site access conditions..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm outline-none transition"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end space-x-4 border-t border-gray-100">
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm shadow-sm disabled:opacity-50 transition"
              >
                {loading ? 'Submitting...' : 'Post Job Request'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
