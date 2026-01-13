"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Campaign } from "@/lib/types"
import { Users, Calendar, CheckCircle2, Zap, Target } from "lucide-react"
import { DonationModal } from "@/components/donation/donation-modal"
import { cn } from "@/lib/utils"

interface DonationCardProps {
  campaign: Campaign & {
    collected_amount?: number
    donor_count?: number
    target_amount_eth?: number
  }
  percentage: number
}

export function DonationCard({ campaign, percentage }: DonationCardProps) {
  const daysRemaining = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="p-8 space-y-8 bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-12 -mt-12 blur-2xl opacity-50" />

      {/* PROGRESS HEADER */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Progres Penggalangan</span>
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 fill-yellow-400 text-slate-900 stroke-[2px]" />
              <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter">{percentage}%</h2>
            </div>
          </div>
          <div className="text-right pb-1">
            <span className="text-sm font-bold text-blue-600 uppercase italic">On-Track</span>
          </div>
        </div>
        
        {/* NEO PROGRESS BAR */}
        <div className="w-full bg-slate-100 border-4 border-slate-900 rounded-full h-6 overflow-hidden p-1 shadow-[inner_4px_4px_0px_0px_rgba(0,0,0,0.05)]">
          <div 
            className="bg-blue-600 h-full rounded-full border-r-2 border-slate-900 transition-all duration-1000 ease-out" 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>

      {/* FINANCIAL DETAILS BOX */}
      <div className="bg-slate-50 border-4 border-slate-900 rounded-2xl p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-slate-200">
          <span className="text-xs font-black uppercase text-slate-500 italic">Terkumpul</span>
          <span className="text-lg font-black text-blue-600 italic">
            {campaign.contract_address 
              ? `${(campaign.collected_amount || 0).toFixed(4)} ETH` 
              : formatCurrency(campaign.collected_amount || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-black uppercase text-slate-500 italic">Target Dana</span>
          <span className="text-lg font-black text-slate-900 italic">
            {campaign.contract_address 
              ? `${(campaign.target_amount_eth || 0).toFixed(4)} ETH` 
              : formatCurrency(campaign.target_amount)}
          </span>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Donatur</span>
          </div>
          <p className="text-2xl font-black text-slate-900 italic tracking-tighter">
            {(campaign.donor_count || 0).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="p-4 border-2 border-slate-900 rounded-2xl bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sisa Hari</span>
          </div>
          <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{daysRemaining}</p>
        </div>
      </div>

      {/* CTA BUTTON WRAPPER */}
      <div className="pt-2">
        <DonationModal campaign={campaign} />
      </div>

      {/* ORG INFO - Gaya ID Card */}
      <div className="relative pt-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-900 rounded-full opacity-10" />
        <div className="flex items-center gap-4 bg-blue-50 p-4 border-2 border-slate-900 rounded-2xl italic">
          <div className="w-12 h-12 bg-white border-2 border-slate-900 rounded-xl flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none mb-1">Dikelola Oleh</p>
            <h4 className="font-black text-slate-900 uppercase text-sm truncate">{campaign.organization?.name || 'Organisasi'}</h4>
            {campaign.organization?.is_verified && (
              <div className="flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span className="text-[9px] font-black text-green-600 uppercase">Verified Org</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}