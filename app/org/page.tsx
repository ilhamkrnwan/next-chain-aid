"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { OrgOverviewStats } from "@/components/org/overview-stats"
import { ActiveCampaigns } from "@/components/org/active-campaigns"
import { RecentDonations } from "@/components/org/recent-donations"
import { 
  Plus, 
  TrendingUp, 
  Wallet,
  Heart, 
  Loader2,
  Zap
} from "lucide-react"
import Link from "next/link"

export default function OrgOverview() {
  const [orgName, setOrgName] = useState<string>("...")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getOrgName() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setOrgName(user.user_metadata?.full_name || user.user_metadata?.org_name || user.email)
        }
      } catch (error) {
        console.error("Error loading org profile:", error)
      } finally {
        setLoading(false)
      }
    }
    getOrgName()
  }, [])

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 space-y-10 relative">
      {/* RETRO GRID BACKGROUND */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Welcome Section */}
        <div className="border-b-8 border-slate-900 pb-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              HALO, <span className="text-blue-600">{loading ? "..." : orgName}.</span>
            </h1>
            <Badge className="w-fit bg-green-400 text-slate-900 border-4 border-slate-900 px-3 py-1 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase italic">
              <Zap className="w-3 h-3 mr-1 fill-slate-900" /> Terverifikasi
            </Badge>
          </div>
          <p className="text-sm md:text-base font-bold text-slate-500 uppercase italic tracking-widest">
            Kelola ekosistem donasi dan transparansi organisasi Anda.
          </p>
        </div>

        {/* Stats */}
        <div className="relative">
          <OrgOverviewStats />
        </div>

        {/* Quick Actions - NeoBrutalism Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/org/campaigns/create">
            <Button className="w-full h-auto py-8 bg-yellow-400 hover:bg-yellow-300 text-slate-900 border-4 border-slate-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col items-center gap-2" size="lg">
              <Plus className="w-8 h-8 stroke-[3]" />
              <span className="text-xl font-black uppercase italic tracking-tighter">Buat Campaign Baru</span>
            </Button>
          </Link>
          
          <Link href="/org/distributions">
            <Button
              className="w-full h-auto py-8 bg-blue-600 hover:bg-blue-500 text-white border-4 border-slate-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col items-center gap-2"
              size="lg"
            >
              <Wallet className="w-8 h-8 stroke-[3]" />
              <span className="text-xl font-black uppercase italic tracking-tighter">Salurkan Dana</span>
            </Button>
          </Link>

          <Button
            className="w-full h-auto py-8 bg-pink-500 hover:bg-pink-400 text-white border-4 border-slate-900 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col items-center gap-2"
            size="lg"
          >
            <TrendingUp className="w-8 h-8 stroke-[3]" />
            <span className="text-xl font-black uppercase italic tracking-tighter">Update Progress</span>
          </Button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Active Campaigns Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 md:p-8 min-h-[400px]">
              <h3 className="text-2xl font-black uppercase italic text-slate-900 mb-8 border-b-4 border-dashed border-slate-200 pb-4">
                Campaign Aktif
              </h3>
              <ActiveCampaigns />
            </div>
          </div>

          {/* Recent Donations Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3" />
            <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-6 md:p-8 min-h-[400px]">
              <div className="flex items-center gap-3 mb-8 border-b-4 border-dashed border-slate-200 pb-4">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <h3 className="text-2xl font-black uppercase italic text-slate-900">Donasi Terbaru</h3>
              </div>
              <RecentDonations />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}