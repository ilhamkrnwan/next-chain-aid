"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageCircle, User, Zap, Hash } from "lucide-react"
import { getCampaignDonations, weiToEth, formatAddress } from "@/lib/blockchain"
import type { Donation } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DonorListProps {
  campaignId: string
  contractAddress?: string | null
  blockchainDonations?: Donation[]
}

export function DonorList({ campaignId, contractAddress, blockchainDonations }: DonorListProps) {
  const [donations, setDonations] = useState<Donation[]>(blockchainDonations || [])
  const [loading, setLoading] = useState(!blockchainDonations)

  useEffect(() => {
    if (!blockchainDonations && contractAddress) {
      loadDonations()
    }
  }, [contractAddress, blockchainDonations])

  const loadDonations = async () => {
    if (!contractAddress) {
      setLoading(false)
      return
    }
    try {
      const data = await getCampaignDonations(contractAddress)
      setDonations(data)
    } catch (error) {
      console.error('Failed to load donations:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-4 border-slate-900 rounded-3xl p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32 bg-slate-200" />
              <Skeleton className="h-6 w-20 bg-slate-200" />
            </div>
            <Skeleton className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (!contractAddress || donations.length === 0) {
    return (
      <Card className="p-12 border-4 border-dashed border-slate-300 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-4 border-2 border-slate-900 rounded-2xl rotate-3 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Hash className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">
          {!contractAddress ? "OFF-CHAIN CAMPAIGN" : "BELUM ADA DONATUR"}
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 px-2 mb-4">
        <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
        <h3 className="font-black uppercase italic tracking-widest text-sm text-slate-900">Live Donation Log</h3>
      </div>

      {donations.map((donation, idx) => (
        <div 
          key={idx} 
          className="group relative transition-all hover:-translate-y-1"
        >
          {/* BACKGROUND DECOR */}
          <div className="absolute inset-0 bg-slate-900 rounded-[2rem] translate-x-1.5 translate-y-1.5 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
          
          <Card className="relative p-6 border-4 border-slate-900 rounded-[2rem] bg-white space-y-4 overflow-hidden">
            {/* TOP INFO */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 border-2 border-slate-900 rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <User className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 font-mono text-sm tracking-tighter uppercase">
                    {formatAddress(donation.donor)}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(donation.timestamp * 1000).toLocaleDateString("id-ID", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-400 border-2 border-slate-900 px-3 py-1 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -rotate-2">
                <p className="font-black text-slate-900 italic text-sm">
                  {weiToEth(donation.amount)} ETH
                </p>
              </div>
            </div>

            {/* MESSAGE BOX */}
            {donation.message && (
              <div className="relative mt-2 p-4 bg-slate-50 border-2 border-slate-900 rounded-2xl italic group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="absolute -top-2 -right-2 w-6 h-6 text-blue-600 fill-white stroke-[2.5px]" />
                <p className="text-sm font-bold text-slate-700 leading-tight uppercase tracking-tight">
                  "{donation.message}"
                </p>
              </div>
            )}
            
            {/* DECORATIVE DOTS */}
            <div className="absolute bottom-2 right-6 flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-slate-200 rounded-full" />)}
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}