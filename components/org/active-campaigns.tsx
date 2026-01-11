"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { getCampaignBlockchainData, ethToIdr, formatEth } from "@/lib/blockchain-helpers"
import Image from "next/image"
import Link from "next/link"
import type { Campaign } from "@/lib/types"

interface CampaignWithBlockchain extends Campaign {
  blockchainData?: {
    collectedAmount: number
    progress: number
    donorCount: number
    daysRemaining: number
  } | null
}

export function ActiveCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithBlockchain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get active campaigns
        const { data: campaignsData } = await supabase
          .from('campaigns')
          .select('*')
          .eq('creator_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(3)

        if (!campaignsData || campaignsData.length === 0) {
          setCampaigns([])
          setLoading(false)
          return
        }

        // Fetch blockchain data for each campaign
        const campaignsWithBlockchain = await Promise.all(
          campaignsData.map(async (campaign) => {
            if (!campaign.contract_address) {
              return { ...campaign, blockchainData: null }
            }

            const blockchainData = await getCampaignBlockchainData(campaign.contract_address)
            return {
              ...campaign,
              blockchainData,
            }
          })
        )

        setCampaigns(campaignsWithBlockchain as CampaignWithBlockchain[])
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCampaigns()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Memuat campaign...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campaign Aktif</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Belum ada campaign aktif</p>
            <Link href="/org/campaigns/create">
              <Button className="mt-4">Buat Campaign Pertama</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Aktif</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex flex-col gap-4 border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-40">
                <Image
                  src={campaign.image_url || "/placeholder.svg"}
                  alt={campaign.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm line-clamp-2">{campaign.title}</h3>

                {campaign.blockchainData ? (
                  <>
                    {/* Progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">
                          {campaign.blockchainData.progress}% Terkumpul
                        </span>
                        <span className="text-muted-foreground">
                          {campaign.blockchainData.daysRemaining} hari
                        </span>
                      </div>
                      <Progress value={campaign.blockchainData.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground">Donatur</p>
                        <p className="font-semibold">{campaign.blockchainData.donorCount}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Terkumpul</p>
                        <p className="font-semibold">
                          {ethToIdr(campaign.blockchainData.collectedAmount)}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground">
                    <p>Target: {ethToIdr(campaign.target_amount)}</p>
                  </div>
                )}

                <Link href={`/org/campaigns/${campaign.id}`}>
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    Kelola
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
