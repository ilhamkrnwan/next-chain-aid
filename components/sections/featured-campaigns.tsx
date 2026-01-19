"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"
import Link from "next/link"
import { getActiveCampaigns } from "@/lib/api"
import { getCampaignSummary, weiToEth } from "@/lib/blockchain"
import { ArrowRight, Users, Target, Zap, ShieldCheck, Coins } from "lucide-react"

export function FeaturedCampaigns() {
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // KONSTANTA KURS (Sesuaikan dengan harga ETH saat ini)
  const ETH_PRICE_IDR = 45000000 // Misal 1 ETH = 45 Juta Rupiah

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const data = await getActiveCampaigns(3)
      
      const campaignsWithBlockchain = await Promise.all(
        data.map(async (campaign: any) => {
          // 1. KONVERSI TARGET (IDR ke ETH)
          // Jika di DB 10.000.000, maka 10jt / 45jt = ~0.22 ETH
          const targetInIdr = Number(campaign.target_amount) || 0
          const targetInEth = targetInIdr / ETH_PRICE_IDR
          
          let collectedInEth = 0
          let donorsCount = 0

          // 2. AMBIL DATA ON-CHAIN (SEPOLIA)
          if (campaign.contract_address && campaign.contract_address !== "0x0") {
            try {
              const summary = await getCampaignSummary(campaign.contract_address)
              collectedInEth = parseFloat(weiToEth(summary.collectedAmount))
              donorsCount = Number(summary.donorCount)
            } catch (error) {
              console.error(`Gagal sync blockchain: ${campaign.title}`)
            }
          }

          // 3. HITUNG PERSENTASE (ETH vs ETH)
          const percentage = targetInEth > 0 ? (collectedInEth / targetInEth) * 100 : 0

          return {
            ...campaign,
            collected_amount: collectedInEth,
            target_amount_eth: targetInEth, // Ini hasil konversi
            target_amount_idr: targetInIdr, // Simpan aslinya jika butuh
            donor_count: donorsCount,
            percentage: percentage
          }
        })
      )

      setCampaigns(campaignsWithBlockchain)
    } catch (error) {
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-24 px-4 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-[500px] w-full rounded-[3rem]" />)}
      </section>
    )
  }

  return (
    <section className="bg-[#FAFAFA] py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b-4 border-slate-900 pb-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-400 text-slate-900 border-2 border-slate-900 font-black text-xs uppercase italic shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-4 h-4 fill-current" /> Live On Sepolia
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-none">
              KAMPANYE <span className="text-blue-600">ETH</span>
            </h2>
          </div>
          <Link href="/campaigns">
            <Button className="h-16 px-10 rounded-2xl bg-slate-900 text-white font-black hover:bg-blue-600 transition-all cursor-pointer text-lg shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] hover:shadow-none active:translate-y-1">
              JELAJAHI <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
        </div>

        {/* Campaign Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {campaigns.map((campaign) => {
            const perc = campaign.percentage || 0
            const displayPerc = perc > 0 && perc < 1 ? perc.toFixed(2) : Math.floor(perc)

            return (
              <Card 
                key={campaign.id} 
                className="group border-4 border-slate-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] bg-white overflow-hidden hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer"
              >
                <Link href={`/campaigns/${campaign.id}`} className="block">
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden border-b-4 border-slate-900">
                    <Image
                      src={campaign.image_url || "/placeholder.svg"}
                      alt={campaign.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-white border-2 border-slate-900 px-3 py-1 rounded-lg font-black text-xs">
                      {campaign.category || 'SOSIAL'}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-6">
                    <h3 className="text-2xl font-black text-slate-900 leading-tight uppercase italic min-h-[4rem]">
                      {campaign.title}
                    </h3>

                    {/* Progress Stats */}
                    <div className="space-y-4 p-6 bg-slate-50 border-2 border-slate-900 rounded-2xl">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terkumpul</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-3xl font-black text-blue-600">{(campaign.collected_amount || 0).toFixed(3)}</span>
                            <span className="text-sm font-black text-slate-900">ETH</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-4xl font-black text-slate-900 tracking-tighter">{displayPerc}%</span>
                        </div>
                      </div>

                      {/* Progress Bar Neo-Brutalist */}
                      <div className="h-4 w-full bg-white border-2 border-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 border-r-2 border-slate-900 transition-all duration-1000"
                          style={{ width: `${Math.min(perc, 100)}%` }}
                        />
                      </div>
                      
                      <p className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                        <Target className="w-3 h-3" /> Target: {campaign.target_amount_eth.toFixed(3)} ETH 
                        <span className="text-slate-300">|</span> 
                        Rp {Number(campaign.target_amount).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex justify-between items-center px-2">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-black uppercase tracking-tighter">{campaign.donor_count} Donatur</span>
                      </div>
                      <ShieldCheck className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}