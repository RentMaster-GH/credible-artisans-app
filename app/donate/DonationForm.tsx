'use client'

import { useState } from 'react'
import { usePaystackPayment } from 'react-paystack'

const PRESET_AMOUNTS = [20, 50, 100, 200, 500]

export default function DonationForm() {
  const [amount, setAmount] = useState<number | string>(50)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [donorMessage, setDonorMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const numericAmount = Number(amount) || 0
  const paystackAmountPesewas = numericAmount * 100

  const paystackConfig = {
    reference: `donate_${new Date().getTime()}`,
    email: email,
    amount: paystackAmountPesewas,
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
    metadata: {
      custom_fields: [
        {
          display_name: 'Donor Name',
          variable_name: 'donor_name',
          value: name || 'Anonymous Supporter',
        },
        {
          display_name: 'Support Message',
          variable_name: 'support_message',
          value: donorMessage || 'No message provided',
        },
      ],
    },
  }

  const initializePayment = usePaystackPayment(paystackConfig)

  const handlePaystackSuccess = () => {
    setSuccess(true)
    setEmail('')
    setName('')
    setDonorMessage('')
  }

  const handlePaystackClose = () => {
    console.log('Payment modal closed')
  }

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      alert('Please enter a valid email address.')
      return
    }

    if (numericAmount < 5) {
      alert('Minimum donation amount is GHS 5.')
      return
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      alert('Paystack public key is not configured in environment variables.')
      return
    }

    initializePayment({
      onSuccess: handlePaystackSuccess,
      onClose: handlePaystackClose,
    })
  }

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
          ❤️
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You for Your Support!</h2>
        <p className="text-gray-600 text-sm mb-6">
          Your donation has been processed successfully. We deeply appreciate your support.
        </p>
        <button
          onClick={() => setSuccess(false)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition"
        >
          Make Another Donation
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-10 shadow-sm">
      <form onSubmit={handleDonateSubmit} className="space-y-6">
        
        {/* Amount Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
            Select Donation Amount (GHS)
          </label>
          
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset)}
                className={`py-3 rounded-xl font-bold text-sm transition border ${
                  numericAmount === preset
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100'
                }`}
              >
                GHS {preset}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
              GHS
            </span>
            <input
              type="number"
              min="5"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Custom amount"
              className="w-full pl-14 pr-4 py-3 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kwame Mensah"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kwame@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Message for the Developers (Optional)
          </label>
          <textarea
            rows={3}
            value={donorMessage}
            onChange={(e) => setDonorMessage(e.target.value)}
            placeholder="Keep up the good work!"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base py-3.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2"
        >
          💳 Donate GHS {numericAmount || 0} via Paystack
        </button>

        <p className="text-center text-xs text-gray-500">
          🔒 Secured by Paystack. Supports Bank Cards (Visa & Mastercard), Bank Transfer, and Mobile Money.
        </p>

      </form>
    </div>
  )
}