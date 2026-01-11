'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, TrendingUp, Users, Wallet } from 'lucide-react'
import { getOrganizationBlockchainStats, ethToIdr, formatEth } from '@/lib/blockchain-helpers'
import type { Campaign } from '@/lib/types'

interface OrganizationPublicStatsProps {
  organizationId: string
  walletAddress: string
  campaigns: Campaign[]
}

export function OrganizationPublicStats({ 
  organizationId, 
  walletAddress, 
  campaigns 
}: OrganizationPublicStatsProps) {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0,
    availableBalance: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        if (!walletAddress || campaigns.length === 0) {
          setStats({
            totalCampaigns: campaigns.length,
            totalRaised: 0,
            totalDonors: 0,
            availableBalance: 0,
          })
          setLoading(false)
          return
        }

        const blockchainStats = await getOrganizationBlockchainStats(walletAddress, campaigns)
        setStats({
          totalCampaigns: blockchainStats.totalCampaigns,
          totalRaised: blockchainStats.totalRaised,
          totalDonors: blockchainStats.totalDonors,
          availableBalance: blockchainStats.availableBalance,
        })
      } catch (error) {
        console.error('Error fetching organization stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [organizationId, walletAddress, campaigns])

  const statCards = [
    {
      title: 'Total Campaign',
      value: loading ? '...' : stats.totalCampaigns.toString(),
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Donasi Terkumpul',
      value: loading ? '...' : ethToIdr(stats.totalRaised),
      subtitle: loading ? '' : formatEth(stats.totalRaised),
      icon: Wallet,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Donatur',
      value: loading ? '...' : stats.totalDonors.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Dana Tersedia',
      value: loading ? '...' : ethToIdr(stats.availableBalance),
      subtitle: loading ? '' : formatEth(stats.availableBalance),
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                )}
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
