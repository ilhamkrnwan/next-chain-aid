"use client"

import { useEffect, useState } from "react"
import { TrendingUp, Users, Heart, Building2, Zap } from "lucide-react"
import { getPlatformStats } from "@/lib/api"
import type { PlatformStats } from "@/lib/types"

export function Stats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const data = await getPlatformStats()
      setStats(data)
    } catch (error) {
      console.error('Gagal memuat statistik:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const statsData = [
    {
      label: "TOTAL DONASI",
      value: stats ? `Rp ${formatNumber(stats.total_raised)}` : "...",
      icon: Heart,
      accentColor: "bg-pink-500",
      shadowColor: "shadow-pink-500",
    },
    {
      label: "CAMPAIGN AKTIF",
      value: stats?.active_campaigns?.toString() || "0",
      icon: TrendingUp,
      accentColor: "bg-blue-500",
      shadowColor: "shadow-blue-500",
    },
    {
      label: "ORGANISASI",
      value: stats?.total_organizations?.toString() || "0",
      icon: Building2,
      accentColor: "bg-purple-500",
      shadowColor: "shadow-purple-500",
    },
    {
      label: "TOTAL DONATUR",
      value: stats ? `${formatNumber(stats.total_donors)}+` : "...",
      icon: Users,
      accentColor: "bg-green-500",
      shadowColor: "shadow-green-500",
    },
  ]

  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor - Titik-titik Retro */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white border-2 border-slate-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]">
              <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-black uppercase tracking-widest italic">Data Real-Time</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
              Dampak <span className="text-blue-600 not-italic">Nyata.</span>
            </h2>
          </div>
          <p className="max-w-xs text-center md:text-right font-bold text-slate-500 uppercase text-sm leading-relaxed">
            Transparansi penuh melalui teknologi blockchain. Data tidak bisa dimanipulasi.
          </p>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group relative cursor-pointer"
              >
                {/* Shadow Box (Background Layer) */}
                <div className={`absolute inset-0 ${stat.accentColor} rounded-3xl translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300`} />
                
                {/* Main Card Layer */}
                <div className="relative bg-white border-4 border-slate-900 rounded-3xl p-8 h-full flex flex-col items-center text-center space-y-4 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
                  {/* Icon Wrapper */}
                  <div className={`w-16 h-16 rounded-2xl border-4 border-slate-900 ${stat.accentColor} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] group-hover:rotate-6 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Value & Label */}
                  <div className="space-y-1">
                    <p className={`text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter ${loading ? 'animate-pulse' : ''}`}>
                      {stat.value}
                    </p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pt-2">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}