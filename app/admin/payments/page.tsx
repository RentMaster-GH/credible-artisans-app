'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

interface PaymentRecord {
  id: string
  job_title: string
  client_name: string
  artisan_name: string
  total_amount: number
  developer_commission: number
  artisan_net: number
  status: string
  paystack_ref: string
  created_at: string
}

const DEVELOPER_EMAIL = 'papastickle@gmail.com' // Replace with your developer login email
const DEVELOPER_COMMISSION_RATE = 0.10 // 10% Developer Fee

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const verifyAndFetchPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || user.email !== DEVELOPER_EMAIL) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      setAuthorized(true)

      // Fetch payment transactions from database
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const formatted: PaymentRecord[] = (data as any[]).map((p) => {
          const total = Number(p.amount) || 0
          const commission = total * DEVELOPER_COMMISSION_RATE
          const net = total - commission

          return {
            id: p.id,
            job_title: p.job_title || 'Contract Payment',
            client_name: p.client_name || 'Client',
            artisan_name: p.artisan_name || 'Artisan',
            total_amount: total,
            developer_commission: commission,
            artisan_net: net,
            status: p.status || 'completed',
            paystack_ref: p.payment_reference || p.reference || 'REF-' + p.id.slice(0, 8),
            created_at: p.created_at,
          }
        })
        setPayments(formatted)
      }

      setLoading(false)
    }

    verifyAndFetchPayments()
  }, [supabase])

  // Calculate Aggregated Metrics
  const totalVolume = payments.reduce((acc, curr) => acc + curr.total_amount, 0)
  const totalDeveloperEarnings = payments.reduce((acc, curr) => acc + curr.developer_commission, 0)
  const totalArtisanPayouts = payments.reduce((acc, curr) => acc + curr.artisan_net, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20 text-gray-500 text-sm">Loading financial reports...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-md mx-auto mt-20 text-center bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 text-sm">Financial records are restricted to the developer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Developer Financial Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track client-to-artisan transactions, Paystack references, and developer commission cuts (10%).
          </p>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Total Transaction Volume</p>
            <p className="text-2xl font-black text-gray-900 mt-2">GHS {totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-gray-400 mt-1">Gross client payments processed</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/30">
            <p className="text-xs text-emerald-700 uppercase font-bold tracking-wider">Developer Commission (10%)</p>
            <p className="text-2xl font-black text-emerald-600 mt-2">GHS {totalDeveloperEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Platform revenue earned</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm bg-indigo-50/30">
            <p className="text-xs text-indigo-700 uppercase font-bold tracking-wider">Net Artisan Earnings (90%)</p>
            <p className="text-2xl font-black text-indigo-600 mt-2">GHS {totalArtisanPayouts.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] text-indigo-600 font-medium mt-1">Payout balance to artisans</p>
          </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">Transaction History ({payments.length})</h2>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              Developer Fee: 10%
            </span>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm">
              No client payments or job transactions processed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-6">Date & Reference</th>
                    <th className="py-3.5 px-6">Job Title</th>
                    <th className="py-3.5 px-6">Client / Artisan</th>
                    <th className="py-3.5 px-6 text-right">Total Paid</th>
                    <th className="py-3.5 px-6 text-right text-emerald-600 font-bold">Dev Fee (10%)</th>
                    <th className="py-3.5 px-6 text-right">Artisan Net (90%)</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{new Date(p.created_at).toLocaleDateString()}</p>
                        <p className="font-mono text-[10px] text-gray-400">{p.paystack_ref}</p>
                      </td>

                      <td className="py-4 px-6 font-bold text-gray-900 max-w-xs truncate">
                        {p.job_title}
                      </td>

                      <td className="py-4 px-6">
                        <p className="text-gray-900">👤 {p.client_name}</p>
                        <p className="text-indigo-600 mt-0.5">🛠️ {p.artisan_name}</p>
                      </td>

                      <td className="py-4 px-6 text-right font-bold text-gray-900">
                        GHS {p.total_amount.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 text-right font-black text-emerald-600">
                        + GHS {p.developer_commission.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 text-right font-bold text-gray-700">
                        GHS {p.artisan_net.toFixed(2)}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}