"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Campaign, Donation } from "@/lib/types"
import { DonationCard } from "./donation-card"
import { ProgressUpdates } from "./progress-updates"
import { FundsDistribution } from "./funds-distribution"
import { DonorList } from "./donor-list"
import { BlockchainVerification } from "./blockchain-verification"
import { ChevronLeft, Info, Zap, LayoutGrid } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const categoryStyles: Record<string, string> = {
  bencana_alam: "bg-red-400 text-slate-900 border-red-900",
  pendidikan: "bg-blue-400 text-slate-900 border-blue-900",
  kesehatan: "bg-green-400 text-slate-900 border-green-900",
  lingkungan: "bg-emerald-400 text-slate-900 border-emerald-900",
  sosial: "bg-purple-400 text-slate-900 border-purple-900",
  ekonomi: "bg-yellow-400 text-slate-900 border-yellow-900",
  lainnya: "bg-slate-400 text-slate-900 border-slate-900",
}

const categoryLabelMap: Record<string, string> = {
  bencana_alam: "Bencana Alam",
  pendidikan: "Pendidikan",
  kesehatan: "Kesehatan",
  lingkungan: "Lingkungan",
  sosial: "Sosial",
  ekonomi: "Ekonomi",
  lainnya: "Lainnya",
}

interface CampaignDetailContentProps {
  campaign: Campaign & {
    collected_amount?: number
    donor_count?: number
    target_amount_eth?: number
    balance?: number
    blockchain_donations?: Donation[]
  }
}

export function CampaignDetailContent({ campaign }: CampaignDetailContentProps) {
  const collected = campaign.collected_amount || 0
  const target = campaign.target_amount_eth || campaign.target_amount || 1
  const percentage = Math.min(100, Math.round((collected / target) * 100))

  return (
    <main className="min-h-screen bg-white pb-20">
      {/* TOMBOL KEMBALI - Gaya Stiker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link 
          href="/campaigns" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black uppercase italic text-xs tracking-tighter"
        >
          <ChevronLeft className="w-4 h-4 stroke-[3px]" />
          Kembali ke Katalog
        </Link>
      </div>

      {/* HERO SECTION - Neo-Brutal Poster Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="relative group rounded-[3rem] overflow-hidden border-8 border-slate-900 shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
          <div className="relative h-[500px] w-full">
            <Image 
              src={campaign.image_url || "/placeholder.svg"} 
              alt={campaign.title} 
              fill 
              className="object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
          </div>
          
          <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 space-y-4">
            <Badge className={cn(
              "w-fit border-4 border-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-sm py-1.5 px-4",
              categoryStyles[campaign.category] || categoryStyles.lainnya
            )}>
              {categoryLabelMap[campaign.category] || campaign.category}
            </Badge>
            <h1 className="text-4xl sm:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9] text-balance max-w-4xl drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              {campaign.title}
            </h1>
            <div className="flex items-center gap-2 text-blue-400 font-black uppercase tracking-widest italic text-lg">
              <Zap className="w-6 h-6 fill-blue-400" />
              {campaign.organization?.name || 'Organisasi'}
            </div>
          </div>
        </div>
      </div>

      {/* GRID KONTEN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* KOLOM KIRI (DESKRIPSI & TABS) */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* TENTANG CAMPAIGN */}
            <section className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] translate-x-2 translate-y-2" />
              <Card className="relative p-8 border-4 border-slate-900 rounded-[2.5rem] bg-white space-y-6">
                <div className="flex items-center gap-3 border-b-4 border-dashed border-slate-100 pb-4">
                  <Info className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Informasi Program</h2>
                </div>
                <p className="text-lg font-bold text-slate-600 leading-relaxed whitespace-pre-line italic uppercase tracking-tight">
                  {campaign.description}
                </p>
              </Card>
            </section>

            {/* TABS - Gaya Panel Kontrol */}
            <Tabs defaultValue="updates" className="w-full">
              <TabsList className="flex flex-wrap h-auto bg-slate-100 border-4 border-slate-900 rounded-2xl p-2 gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {[
                  { value: "updates", label: "PROGRES", icon: Zap },
                  { value: "distribution", label: "PENYALURAN", icon: LayoutGrid },
                  { value: "donors", label: "DONATUR", icon: ChevronLeft },
                ].map((t) => (
                  <TabsTrigger 
                    key={t.value}
                    value={t.value}
                    className="flex-1 py-3 px-4 font-black uppercase italic tracking-tighter data-[state=active]:bg-blue-600 data-[state=active]:text-white border-2 border-transparent data-[state=active]:border-slate-900 rounded-xl transition-all"
                  >
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="mt-8 space-y-12">
                <TabsContent value="updates" className="focus-visible:ring-0">
                  <ProgressUpdates campaignId={campaign.id} />
                </TabsContent>
                <TabsContent value="distribution" className="focus-visible:ring-0">
                  <FundsDistribution campaignId={campaign.id} contractAddress={campaign.contract_address} />
                </TabsContent>
                <TabsContent value="donors" className="focus-visible:ring-0">
                  <DonorList 
                    campaignId={campaign.id} 
                    contractAddress={campaign.contract_address}
                    blockchainDonations={campaign.blockchain_donations}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* VERIFIKASI BLOCKCHAIN */}
            {campaign.contract_address && (
              <BlockchainVerification 
                campaignId={campaign.id} 
                contractAddress={campaign.contract_address}
              />
            )}
          </div>

          {/* KOLOM KANAN (STICKY DONATION CARD) */}
          <div className="lg:col-span-1 sticky top-28">
            <div className="group transition-transform hover:-rotate-1">
              <DonationCard campaign={campaign} percentage={percentage} />
            </div>
            
            {/* TIPS AMAN - Tambahan biar lebih rame gaya brutalis-nya */}
            <div className="mt-6 p-6 bg-yellow-400 border-4 border-slate-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-1">
               <h4 className="font-black uppercase italic tracking-tighter flex items-center gap-2">
                 <Zap className="w-4 h-4 fill-slate-900" /> Tips Donatur
               </h4>
               <p className="text-xs font-bold uppercase mt-2 leading-tight">
                 Pastikan saldo wallet cukup dan jaringan berada di Sepolia Testnet untuk transaksi transparan!
               </p>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}