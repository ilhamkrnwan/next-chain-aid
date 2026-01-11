"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, BookOpen, TrendingUp, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { getAdminDashboardStats } from "@/lib/api"
import { getBlockchainStats } from "@/lib/admin-blockchain"
import type { AdminDashboardStats } from "@/lib/types"

export function OverviewStats() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [blockchainStats, setBlockchainStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const [dbStats, bcStats] = await Promise.all([
        getAdminDashboardStats(),
        getBlockchainStats(),
      ])
      setStats(dbStats)
      setBlockchainStats(bcStats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatCurrency(amount: number | string): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}M ETH`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M ETH`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K ETH`
    }
    return `${num.toFixed(4)} ETH`
  }

  const statsData = [
    {
      title: "Total Organisasi",
      value: stats?.approvedOrganizations || 0,
      icon: Building2,
      description: `${stats?.pendingOrganizations || 0} pending`,
      color: "text-blue-600",
    },
    {
      title: "Total Campaign",
      value: stats?.totalCampaigns || 0,
      icon: BookOpen,
      description: `${stats?.activeCampaigns || 0} aktif`,
      color: "text-green-600",
    },
    {
      title: "Total Donasi",
      value: blockchainStats?.totalAmount ? formatCurrency(blockchainStats.totalAmount) : '0 ETH',
      icon: TrendingUp,
      description: `${blockchainStats?.totalDonations || 0} transaksi`,
      color: "text-purple-600",
    },
    {
      title: "Total Donatur",
      value: blockchainStats?.totalDonors || 0,
      icon: Users,
      description: `${stats?.totalUsers || 0} total users`,
      color: "text-orange-600",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
