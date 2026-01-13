"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { notFound } from "next/navigation"
import { getCampaignById } from "@/lib/api"
import { getCampaignSummary, getCampaignDonations, weiToEth } from "@/lib/blockchain"
import { CampaignDetailContent } from "@/components/campaigns/campaign-detail-content"
import { Loader2 } from "lucide-react"
import type { Campaign, Donation } from "@/lib/types"
import { toast } from "sonner"

export default function CampaignDetailPage() {
  const params = useParams()
  const id = params?.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadCampaign()
    }
  }, [id])

  const loadCampaign = async () => {
    try {
      const campaignData = await getCampaignById(id)
      
      if (!campaignData) {
        notFound()
        return
      }

      // Fetch blockchain data if contract exists
      if (campaignData.contract_address) {
        try {
          const [summary, donations] = await Promise.all([
            getCampaignSummary(campaignData.contract_address),
            getCampaignDonations(campaignData.contract_address)
          ])

          // Enrich campaign with blockchain data
          const enrichedCampaign = {
            ...campaignData,
            collected_amount: summary.collectedAmount ? parseFloat(weiToEth(summary.collectedAmount)) : 0,
            donor_count: summary.donorCount || 0,
            target_amount_eth: summary.targetAmount ? parseFloat(weiToEth(summary.targetAmount)) : 0,
            balance: summary.balance ? parseFloat(weiToEth(summary.balance)) : 0,
            blockchain_donations: donations,
          }

          setCampaign(enrichedCampaign)
        } catch (error) {
          console.error('Failed to fetch blockchain data:', error)
          // Still show campaign even if blockchain fetch fails
          setCampaign(campaignData)
        }
      } else {
        setCampaign(campaignData)
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
      toast.error("Gagal memuat detail campaign")
      notFound()
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat detail campaign...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    notFound()
    return null
  }

  return <CampaignDetailContent campaign={campaign} />
}
