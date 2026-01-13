"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import { ExternalLink, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAllTransactionsFromBlockchain } from "@/lib/admin-blockchain"
import { getCampaigns } from "@/lib/api"
import { createClient } from "@/lib/supabase/client"
import type { BlockchainTransaction, Campaign } from "@/lib/types"

interface CampaignUpdate {
  id: string
  campaign_id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  images: { image_url: string }[]
}

export function DistributionGrid() {
  const [withdrawals, setWithdrawals] = useState<BlockchainTransaction[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [updates, setUpdates] = useState<CampaignUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<string[] | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      const [txData, campaignsResponse, updatesResponse] = await Promise.all([
        getAllTransactionsFromBlockchain(),
        getCampaigns({}, { limit: 1000 }),
        supabase
          .from('campaign_updates')
          .select(`
            *,
            images:campaign_update_images(image_url)
          `)
          .order('created_at', { ascending: false })
      ])
      
      // Filter only withdrawals
      const withdrawalTxs = txData.filter(tx => tx.to && tx.description)
      setWithdrawals(withdrawalTxs)
      setCampaigns(campaignsResponse.data)
      setUpdates(updatesResponse.data || [])
    } catch (error) {
      console.error('Error loading distributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCampaignByAddress = (contractAddress: string) => {
    return campaigns.find(c => c.contract_address?.toLowerCase() === contractAddress.toLowerCase())
  }

  const getUpdateForWithdrawal = (withdrawal: BlockchainTransaction) => {
    const campaign = getCampaignByAddress(withdrawal.contractAddress)
    if (!campaign) return null
    
    // Find update that matches the withdrawal timestamp (within 1 day)
    return updates.find(update => {
      if (update.campaign_id !== campaign.id) return false
      const updateTime = new Date(update.created_at).getTime() / 1000
      const withdrawalTime = withdrawal.timestamp
      const timeDiff = Math.abs(updateTime - withdrawalTime)
      return timeDiff < 86400 // 1 day in seconds
    })
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="aspect-video w-full" />
            <div className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
        <p className="text-slate-600">Belum ada penyaluran dana</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {withdrawals.map((withdrawal, idx) => {
          const campaign = getCampaignByAddress(withdrawal.contractAddress)
          const update = getUpdateForWithdrawal(withdrawal)
          const proofImages = update?.images?.map(img => img.image_url) || []
          
          return (
            <Card key={idx} className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
              {/* Campaign Image */}
              <div className="relative aspect-video overflow-hidden bg-slate-200">
                <Image
                  src={campaign?.image_url || update?.image_url || "/placeholder.svg"}
                  alt={campaign?.title || "Campaign"}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-blue-950 line-clamp-2">
                    {campaign?.title || 'Campaign tidak ditemukan'}
                  </h3>
                  <p className="text-sm text-slate-600">{formatDate(withdrawal.timestamp)}</p>
                </div>

                {/* Amount & Recipient */}
                <div className="space-y-3 border-y border-slate-200 py-4">
                  <div>
                    <p className="text-sm text-slate-600">Jumlah Penyaluran</p>
                    <p className="text-2xl font-bold text-blue-600">{withdrawal.amount} ETH</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-600">Penerima</p>
                    <p className="font-semibold text-slate-900 font-mono text-sm">
                      {withdrawal.to?.slice(0, 10)}...{withdrawal.to?.slice(-8)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-700 leading-relaxed flex-1">
                  {withdrawal.description || update?.content || 'Penyaluran dana untuk campaign'}
                </p>

                {/* Proof Images */}
                {proofImages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Bukti Penyaluran ({proofImages.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {proofImages.slice(0, 3).map((img, imgIdx) => (
                        <button
                          key={imgIdx}
                          onClick={() => {
                            setSelectedImages(proofImages)
                            setCurrentImageIndex(imgIdx)
                          }}
                          className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity bg-slate-200"
                        >
                          <Image 
                            src={img || "/placeholder.svg"} 
                            alt={`Bukti ${imgIdx + 1}`} 
                            fill 
                            className="object-cover" 
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blockchain Link */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                  <Check className="w-4 h-4 text-green-600" />
                  <code className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700 flex-1 truncate">
                    {withdrawal.contractAddress.substring(0, 12)}...{withdrawal.contractAddress.substring(withdrawal.contractAddress.length - 8)}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="gap-1 text-blue-600 hover:text-blue-700 h-8"
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${withdrawal.contractAddress}`, "_blank")}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Image Lightbox */}
      {selectedImages && (
        <Dialog open={!!selectedImages} onOpenChange={() => setSelectedImages(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Bukti Penyaluran Dana</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden">
                <Image
                  src={selectedImages[currentImageIndex] || "/placeholder.svg"}
                  alt={`Bukti ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  {currentImageIndex + 1} dari {selectedImages.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                    disabled={currentImageIndex === 0}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentImageIndex(Math.min(selectedImages.length - 1, currentImageIndex + 1))}
                    disabled={currentImageIndex === selectedImages.length - 1}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
