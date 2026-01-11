'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getCampaignBlockchainData, ethToIdr, formatEth } from '@/lib/blockchain-helpers'
import Image from 'next/image'
import Link from 'next/link'
import type { Campaign } from '@/lib/types'

interface OrganizationPublicCampaignListProps {
  campaigns: Campaign[]
}

interface CampaignWithBlockchain extends Campaign {
  blockchainData?: {
    collectedAmount: number
    progress: number
    donorCount: number
    daysRemaining: number
  } | null
}

export function OrganizationPublicCampaignList({ campaigns }: OrganizationPublicCampaignListProps) {
  const [campaignsWithData, setCampaignsWithData] = useState<CampaignWithBlockchain[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCampaignData() {
      try {
        const campaignsWithBlockchain = await Promise.all(
          campaigns.map(async (campaign) => {
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

        setCampaignsWithData(campaignsWithBlockchain)
      } catch (error) {
        console.error('Error fetching campaign data:', error)
        setCampaignsWithData(campaigns.map(c => ({ ...c, blockchainData: null })))
      } finally {
        setLoading(false)
      }
    }

    fetchCampaignData()
  }, [campaigns])

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">
          Organisasi ini belum memiliki campaign aktif
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">
        Campaign Aktif ({campaigns.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaignsWithData.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Campaign Image */}
            <div className="relative w-full h-48">
              <Image
                src={campaign.image_url || '/placeholder.svg'}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>

            <CardContent className="p-6">
              {/* Title */}
              <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                {campaign.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {campaign.description}
              </p>

              {loading ? (
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-2 bg-muted rounded animate-pulse" />
                </div>
              ) : campaign.blockchainData ? (
                <>
                  {/* Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
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
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Terkumpul</p>
                      <p className="font-semibold text-sm">
                        {ethToIdr(campaign.blockchainData.collectedAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatEth(campaign.blockchainData.collectedAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Donatur</p>
                      <p className="font-semibold text-sm">
                        {campaign.blockchainData.donorCount} orang
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Target: {ethToIdr(campaign.target_amount)}
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Link href={`/campaigns/${campaign.id}`}>
                <Button className="w-full">
                  Lihat Detail & Donasi
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
