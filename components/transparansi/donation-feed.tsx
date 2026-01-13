"use client"

import { useState, useEffect } from "react"
import { ExternalLink, MessageCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getAllTransactionsFromBlockchain } from "@/lib/admin-blockchain"
import { getCampaigns } from "@/lib/api"
import type { BlockchainTransaction, Campaign } from "@/lib/types"
import Link from "next/link"

export function DonationFeed() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchCampaign, setSearchCampaign] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [txData, campaignsResponse] = await Promise.all([
        getAllTransactionsFromBlockchain(),
        getCampaigns({}, { limit: 1000 })
      ])
      
      // Filter only donations
      const donations = txData.filter(tx => tx.from)
      setTransactions(donations)
      setCampaigns(campaignsResponse.data)
    } catch (error) {
      console.error('Error loading donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCampaignByAddress = (contractAddress: string) => {
    return campaigns.find(c => c.contract_address?.toLowerCase() === contractAddress.toLowerCase())
  }

  const filteredTransactions = transactions.filter((tx) => {
    const campaign = getCampaignByAddress(tx.contractAddress)
    return campaign?.title.toLowerCase().includes(searchCampaign.toLowerCase())
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white border border-slate-200 rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="space-y-4">
        <Input
          placeholder="Cari berdasarkan campaign..."
          value={searchCampaign}
          onChange={(e) => setSearchCampaign(e.target.value)}
          className="bg-white border-slate-200"
        />
      </div>

      {/* Transaction Feed */}
      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
            <p className="text-slate-600">
              {searchCampaign ? 'Tidak ada transaksi yang sesuai dengan pencarian Anda' : 'Belum ada donasi'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => {
            const campaign = getCampaignByAddress(tx.contractAddress)
            
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          <Badge variant="outline" className="bg-slate-50">
                            {tx.from?.slice(0, 6)}...{tx.from?.slice(-4)}
                          </Badge>
                        </p>
                        <p className="text-sm text-slate-500">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{tx.amount} ETH</p>
                  </div>

                  {/* Campaign and Message */}
                  <div className="space-y-3 border-t border-b border-slate-200 py-4">
                    {campaign ? (
                      <Link href={`/campaigns/${campaign.id}`}>
                        <p className="text-blue-600 hover:text-blue-700 font-medium">
                          {campaign.title}
                        </p>
                      </Link>
                    ) : (
                      <p className="text-slate-600">Campaign tidak ditemukan</p>
                    )}

                    {tx.message && (
                      <div className="bg-slate-50 border-l-4 border-blue-600 pl-4 py-3">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                          <p className="text-slate-700 italic">{tx.message}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Blockchain Link */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-slate-600">Hash: </p>
                    <code className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-700">
                      {tx.contractAddress.substring(0, 12)}...{tx.contractAddress.substring(tx.contractAddress.length - 8)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 text-blue-600 hover:text-blue-700 h-8"
                      onClick={() => window.open(`https://sepolia.etherscan.io/address/${tx.contractAddress}`, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Verifikasi
                    </Button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
