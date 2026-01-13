"use client"

import { useState, useEffect } from "react"
import { ExternalLink, MessageCircle, Search, Wallet, ArrowRight } from "lucide-react"
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
      
      const donations = txData.filter(tx => tx.from)
      setTransactions(donations)
      setCampaigns(campaignsResponse.data)
    } catch (error) {
      console.error('Gagal memuat data donasi:', error)
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
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="border-4 border-slate-100 rounded-[2rem] p-6 space-y-4">
            <Skeleton className="h-6 w-1/4 bg-slate-100" />
            <Skeleton className="h-20 w-full bg-slate-50" />
            <Skeleton className="h-6 w-1/2 bg-slate-100" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Pencarian dengan Gaya Brutalist */}
      <div className="relative group">
        <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1 translate-y-1 group-focus-within:translate-x-1.5 group-focus-within:translate-y-1.5 transition-all" />
        <div className="relative flex items-center bg-white border-4 border-slate-900 rounded-2xl px-4 h-16">
          <Search className="w-6 h-6 text-slate-400 mr-3" />
          <Input
            placeholder="Cari Kampanye Terverifikasi..."
            value={searchCampaign}
            onChange={(e) => setSearchCampaign(e.target.value)}
            className="border-none bg-transparent focus-visible:ring-0 text-lg font-bold uppercase italic placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Transaction Feed */}
      <div className="space-y-6">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 border-4 border-dashed border-slate-200 rounded-[3rem]">
            <p className="text-slate-400 font-black uppercase italic tracking-widest">
              {searchCampaign ? 'Data Tidak Ditemukan' : 'Belum Ada Transaksi Tercatat'}
            </p>
          </div>
        ) : (
          filteredTransactions.map((tx, idx) => {
            const campaign = getCampaignByAddress(tx.contractAddress)
            
            return (
              <div key={idx} className="group relative">
                {/* Efek Bayangan Solid */}
                <div className="absolute inset-0 bg-slate-900 rounded-[2rem] translate-x-1.5 translate-y-1.5 group-hover:translate-x-2 group-hover:translate-y-2 transition-all" />
                
                <div className="relative bg-white border-4 border-slate-900 rounded-[2rem] overflow-hidden p-6 sm:p-8">
                  <div className="space-y-6">
                    {/* Baris Atas: Pengirim & Nominal */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-dashed border-slate-100 pb-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-3 rounded-2xl">
                          <Wallet className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pengirim Donasi</p>
                          <p className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
                            {tx.from?.slice(0, 8)}...{tx.from?.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Nilai Transaksi</p>
                        <p className="text-3xl font-black text-blue-600 italic tracking-tighter leading-none">
                          {tx.amount} ETH
                        </p>
                      </div>
                    </div>

                    {/* Tengah: Informasi Kampanye & Pesan */}
                    <div className="space-y-4">
                      {campaign ? (
                        <Link href={`/campaigns/${campaign.id}`} className="group/link flex items-center gap-2 w-fit">
                          <h4 className="text-xl font-black text-slate-900 uppercase italic leading-tight group-hover:text-blue-600 transition-colors">
                            {campaign.title}
                          </h4>
                          <ArrowRight className="w-5 h-5 text-slate-300 group-hover/link:translate-x-1 transition-transform" />
                        </Link>
                      ) : (
                        <p className="text-slate-400 font-bold uppercase italic">Kampanye Tidak Terdeteksi</p>
                      )}

                      {tx.message && (
                        <div className="relative">
                          <div className="absolute inset-0 bg-blue-600 rounded-2xl translate-x-1 translate-y-1" />
                          <div className="relative bg-white border-2 border-slate-900 p-4 rounded-2xl flex items-start gap-3">
                            <MessageCircle className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                            <p className="text-sm font-bold text-slate-700 italic">"{tx.message}"</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Baris Bawah: Footer Meta Data */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Waktu Blok</span>
                        <span className="text-xs font-bold text-slate-900 uppercase italic">{formatDate(tx.timestamp)}</span>
                      </div>
                      
                      <Button
                        size="sm"
                        className="bg-slate-100 hover:bg-slate-900 text-slate-900 hover:text-white border-2 border-slate-900 rounded-xl font-black uppercase italic text-[10px] tracking-widest transition-all h-10 px-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                        onClick={() => window.open(`https://sepolia.etherscan.io/address/${tx.contractAddress}`, "_blank")}
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-2" />
                        Verifikasi On-Chain
                      </Button>
                    </div>
                  </div>
                  
                  {/* Indikator Status di Pojok */}
                  <div className="absolute top-0 right-0 bg-green-400 border-l-4 border-b-4 border-slate-900 px-4 py-1 font-black text-[9px] uppercase italic tracking-tighter">
                    Success
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