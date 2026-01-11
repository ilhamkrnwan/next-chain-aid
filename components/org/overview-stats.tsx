"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Wallet, TrendingUp, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getOrganizationBlockchainStats, ethToIdr, formatEth } from "@/lib/blockchain-helpers"
import type { Campaign } from "@/lib/types"

export function OrgOverviewStats() {
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: 0,
    availableBalance: 0,
    totalDistributed: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get user profile for wallet address
        const { data: profile } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', user.id)
          .single()

        // Get total campaigns
        const { data: campaigns, count } = await supabase
          .from('campaigns')
          .select('*', { count: 'exact' })
          .eq('creator_id', user.id)

        const totalCampaigns = count || 0

        // Get blockchain stats if wallet connected and has campaigns
        if (profile?.wallet_address && campaigns && campaigns.length > 0) {
          const blockchainStats = await getOrganizationBlockchainStats(
            profile.wallet_address,
            campaigns as Campaign[]
          )

          setStats({
            totalCampaigns,
            totalRaised: blockchainStats.totalRaised,
            availableBalance: blockchainStats.availableBalance,
            totalDistributed: blockchainStats.totalWithdrawn,
          })
        } else {
          setStats({
            totalCampaigns,
            totalRaised: 0,
            availableBalance: 0,
            totalDistributed: 0,
          })
        }
      } catch (error) {
        console.error('Error fetching organization stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Campaign",
      value: loading ? "..." : stats.totalCampaigns.toString(),
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Total Donasi Diterima",
      value: loading ? "..." : ethToIdr(stats.totalRaised),
      subtitle: loading ? "" : formatEth(stats.totalRaised),
      icon: Wallet,
      color: "text-green-600",
    },
    {
      title: "Dana Tersedia",
      value: loading ? "..." : ethToIdr(stats.availableBalance),
      subtitle: loading ? "" : formatEth(stats.availableBalance),
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Total Penyaluran",
      value: loading ? "..." : ethToIdr(stats.totalDistributed),
      subtitle: loading ? "" : formatEth(stats.totalDistributed),
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
