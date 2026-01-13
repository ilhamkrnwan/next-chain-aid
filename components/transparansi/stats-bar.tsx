'use client'

import { useEffect, useState } from 'react'
import { getBlockchainStats } from '@/lib/admin-blockchain'

export function TransparencyStatsBar() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalCampaigns: 0,
    totalWithdrawals: 0,
    totalTransactions: 0,
    totalVolume: '0',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const blockchainStats = await getBlockchainStats()
      setStats({
        totalDonations: blockchainStats.totalDonations,
        totalCampaigns: blockchainStats.totalCampaigns,
        totalWithdrawals: blockchainStats.totalWithdrawals,
        totalTransactions: blockchainStats.totalDonations + blockchainStats.totalWithdrawals,
        totalVolume: blockchainStats.totalAmount, // totalAmount from blockchain stats
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsDisplay = [
    {
      label: 'Total Donasi',
      value: loading ? '...' : `${stats.totalVolume} ETH`,
    },
    {
      label: 'Campaign Aktif',
      value: loading ? '...' : stats.totalCampaigns.toString(),
    },
    {
      label: 'Total Penyaluran',
      value: loading ? '...' : stats.totalWithdrawals.toString(),
    },
    {
      label: 'Transaksi Blockchain',
      value: loading ? '...' : stats.totalTransactions.toLocaleString('id-ID'),
    },
  ]

  return (
    <section className="bg-white border-y border-slate-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {statsDisplay.map((stat, index) => (
            <div key={index} className="flex flex-col items-center sm:items-start space-y-2">
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">{stat.value}</p>
              <p className="text-sm sm:text-base text-slate-600 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
