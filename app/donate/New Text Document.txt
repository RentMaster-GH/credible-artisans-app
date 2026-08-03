'use client'

import { useState } from 'react'
import { usePaystackPayment } from 'react-paystack'
import Navbar from '@/components/Navbar'

const PRESET_AMOUNTS = [20, 50, 100, 200, 500]

export default function DonatePage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [success, setSuccess] = useState(false)

  const finalAmount = isCustom ? parseFloat(customAmount) || 0 : amount

  // Paystack expects amount in Pesewas (GHS 1 = 100 Pesewas)
  const config = {
    reference: `donate_${new Date().getTime()}`,
    email: email || 'supporter@credibleartisans.com',
    amount: Math.round(finalAmount * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
    metadata: {
      custom_fields: [
        {
          display_name: 'Donor Name',
          variable_name: 'donor_name',
          value: name || 'Anonymous Supporter',
        },
      ],
    },
  }

  const initializePayment = usePaystackPayment(config)

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      alert('Please enter your email address so we can send a digital receipt.')
      return
    }

    if (finalAmount < 1) {
      alert('Please enter a valid donation amount (minimum GHS 1).')
      return
    }

    // Trigger Paystack Popup
    initializePayment({
      onSuccess: (reference: any) => {
        setSuccess(true)
      },
      onClose: () => {
        console.log('Donation payment modal closed.')
      },
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            Support Credible Artisans
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-3">
            Support Platform Development
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mt-2 max-w-xl mx-auto">
            Your generous contributions help us maintain servers, expand access for local artisans across Ghana, and continuously build new features.
          </p>
        </div>

        {/* Donation Card */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-10 shadow-sm">
          {success ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thank You for Your Support!</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                Your donation of <span className="font-bold text-emerald-600">GHS {finalAmount}</span> has been received successfully. A receipt has been sent to <span className="font-semibold text-gray-800">{email}</span>.
              </p>
              <button
                onClick={() => {
                  setSuccess(false)
                  setEmail('')
                  setName('')
                }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition"
              >
                Make Another Donation
              </button>
            </div>
          ) : (
            <form onSubmit={handleDonate} className="space-y-6">
              
              {/* Preset Amounts */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                  Select Donation Amount (GHS)
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt)
                        setIsCustom(false)
                      }}
                      className={`py-3 rounded-2xl text-sm font-bold border transition ${
                        !isCustom && amount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      GHS {amt}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Option */}
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`text-xs font-semibold ${
                      isCustom ? 'text-emerald-700 underline' : 'text-gray-500 hover:text-emerald-600'
                    }`}
                  >
                    + Enter Custom Amount
                  </button>

                  {isCustom && (
                    <div className="mt-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter amount in GHS"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        className="w-full px-4 py-2.5 border border-emerald-500 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Donor Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Your Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kwame Mensah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="kwame@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base py-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 mt-4"
              >
                💳 Donate GHS {finalAmount || 0} via Paystack
              </button>

              <p className="text-center text-xs text-gray-400 mt-2">
                🔒 Secured by Paystack. Accepts Mobile Money (MTN, Telecel, AT) & Visa/Mastercard.
              </p>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}