"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { getCampaignDonations } from "@/lib/blockchain"
import { formatAddress, formatTimestamp, weiToEth } from "@/lib/blockchain"
import { ethToIdr } from "@/lib/blockchain-helpers"
import type { Campaign } from "@/lib/types"

interface DonationWithCampaign {
  donor: string
  amount: bigint
  timestamp: number
  message: string
  campaignTitle: string
}

export function RecentDonations() {
  const [donations, setDonations] = useState<DonationWithCampaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDonations() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get all campaigns with contract addresses
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, title, contract_address')
          .eq('creator_id', user.id)
          .not('contract_address', 'is', null)

        if (!campaigns || campaigns.length === 0) {
          setDonations([])
          setLoading(false)
          return
        }

        // Fetch donations from all campaigns
        const allDonationsPromises = campaigns.map(async (campaign) => {
          try {
            const campaignDonations = await getCampaignDonations(campaign.contract_address!)
            return campaignDonations.map(donation => ({
              ...donation,
              campaignTitle: campaign.title,
            }))
          } catch (error) {
            console.error(`Error fetching donations for campaign ${campaign.id}:`, error)
            return []
          }
        })

        const allDonationsArrays = await Promise.all(allDonationsPromises)
        const allDonations = allDonationsArrays.flat()

        // Sort by timestamp (newest first) and take top 10
        const sortedDonations = allDonations
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10)

        setDonations(sortedDonations)
      } catch (error) {
        console.error('Error fetching donations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDonations()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donasi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat donasi...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (donations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Donasi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada donasi</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Donasi Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Donatur</th>
                <th className="text-left py-3 px-4 font-semibold">Jumlah</th>
                <th className="text-left py-3 px-4 font-semibold">Campaign</th>
                <th className="text-left py-3 px-4 font-semibold">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((donation, index) => (
                <tr key={index} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium">{formatAddress(donation.donor)}</p>
                      {donation.message && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {donation.message}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-green-600">
                      {ethToIdr(Number(weiToEth(donation.amount)))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(weiToEth(donation.amount)).toFixed(4)} ETH
                    </p>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {donation.campaignTitle}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">
                    {formatTimestamp(donation.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
