"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Calendar, Users, Zap, ArrowRight } from "lucide-react"
import type { Campaign } from "@/lib/types"
import { cn } from "@/lib/utils"

interface CampaignCardProps {
  campaign: Campaign & {
    collected_amount?: number
    donor_count?: number
    target_amount_eth?: number
  }
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const collected = campaign.collected_amount || 0
  const target = campaign.target_amount_eth || campaign.target_amount || 1
  const percentage = Math.min(100, Math.round((collected / target) * 100))

  const daysRemaining = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

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

  return (
    <Card className="group relative overflow-hidden bg-white border-4 border-slate-900 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-300 cursor-pointer h-full flex flex-col">
      
      {/* Gambar dengan Overlay Badge */}
      <div className="relative aspect-[16/10] overflow-hidden border-b-4 border-slate-900">
        <Image 
          src={campaign.image_url || "/placeholder.svg"} 
          alt={campaign.title} 
          fill 
          className="object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-60" />
        
        {/* Badges as Stickers */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <Badge className={cn(
            "border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-[10px]",
            categoryStyles[campaign.category] || categoryStyles.lainnya
          )}>
            {categoryLabelMap[campaign.category] || campaign.category}
          </Badge>
          {campaign.status === "active" && (
            <Badge className="bg-white text-slate-900 border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-[10px]">
              <Zap className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" /> Aktif
            </Badge>
          )}
        </div>
      </div>

      {/* Konten Utama */}
      <div className="p-6 flex-1 flex flex-col space-y-4">
        <div className="space-y-1 flex-1">
          <h3 className="font-black text-xl text-slate-900 leading-tight uppercase italic tracking-tighter line-clamp-2 group-hover:text-blue-600 transition-colors">
            {campaign.title}
          </h3>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <span className="w-2 h-2 bg-blue-600 rounded-full" />
            {campaign.organization?.name || 'Organisasi'}
          </p>
        </div>

        {/* Progress Section */}
        <div className="bg-slate-50 border-2 border-slate-900 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-end">
             <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terkumpul</p>
                <p className="text-lg font-black text-slate-900 italic">
                  {campaign.contract_address ? `${collected.toFixed(3)} ETH` : `Rp ${collected.toLocaleString()}`}
                </p>
             </div>
             <div className="text-right">
                <span className="text-2xl font-black text-blue-600 italic leading-none">{percentage}%</span>
             </div>
          </div>

          {/* Progress Bar Neo-Brutal */}
          <div className="w-full bg-slate-200 border-2 border-slate-900 rounded-full h-4 overflow-hidden shadow-[inset_2px_2px_0px_0px_rgba(0,0,0,0.1)]">
            <div 
              className="bg-blue-600 h-full border-r-2 border-slate-900 transition-all duration-1000" 
              style={{ width: `${percentage}%` }} 
            />
          </div>

          <p className="text-[10px] font-bold text-slate-500 uppercase text-center tracking-tighter">
            Target: {campaign.contract_address ? `${target.toFixed(3)} ETH` : `Rp ${target.toLocaleString()}`}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Calendar className="w-4 h-4 text-blue-600 stroke-[3px]" />
              <span className="text-[11px] font-black uppercase tracking-tighter">{daysRemaining} Hari Lagi</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-blue-600 stroke-[3px]" />
              <span className="text-[11px] font-black uppercase tracking-tighter">{(campaign.donor_count || 0)} Donatur</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Button className="w-full h-12 bg-blue-600 hover:bg-slate-900 text-white border-2 border-slate-900 rounded-xl font-black uppercase italic tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all group-hover:scale-[1.02]">
          Lihat Detail <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}