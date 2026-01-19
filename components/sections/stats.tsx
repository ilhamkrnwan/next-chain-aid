"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, Users, Heart, Building2, Zap, ArrowRightLeft } from "lucide-react"
import { getPlatformStats, getEthPrice } from "@/lib/api"
import type { PlatformStats } from "@/lib/types"
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, CartesianGrid, XAxis } from 'recharts'

export function Stats() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [ethData, setEthData] = useState({ price: 0, change: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initData = async () => {
      try {
        const [platformData, cryptoPrice] = await Promise.all([
          getPlatformStats(),
          getEthPrice()
        ])
        
        setStats(platformData)
        setEthData(cryptoPrice)

        // Generate grafik fluktuasi berdasarkan harga asli (dalam Juta Rp)
        const basePrice = cryptoPrice.price / 1000000
        const mockHistory = Array.from({ length: 8 }, (_, i) => ({
          time: `${i * 3}:00`,
          price: basePrice + (Math.random() * 1.5 - 0.75) 
        }))
        setChartData(mockHistory)
      } catch (error) {
        console.error('Gagal memuat data:', error)
      } finally {
        setLoading(false)
      }
    }

    initData()
    const interval = setInterval(initData, 60000) 
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Stats */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">Live On-Chain & Market Data</span>
            </div>
            <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
              PANTAU <span className="text-blue-600 not-italic">DAMPAK.</span>
            </h2>
          </div>
          <p className="max-w-xs text-center md:text-right font-bold text-slate-500 uppercase text-[10px] tracking-tight leading-relaxed italic">
            Data transparansi publik yang ditarik langsung dari Blockchain & Market API.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* CHART ETH/IDR (Col Span 2) */}
          <div className="lg:col-span-2 group relative">
            <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] translate-x-3 translate-y-3 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
            <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 h-full flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Ethereum</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market IDR</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-slate-900 tracking-tighter leading-none">
                    {loading ? "..." : `Rp ${(ethData.price / 1000000).toFixed(2)}M`}
                  </p>
                  <div className={`flex items-center justify-end gap-1 text-xs font-black uppercase mt-1 ${ethData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ethData.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {ethData.change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* AREA CHART - FIXED TOOLTIP TS ERROR */}
              <div className="h-44 w-full mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" hide />
                    <YAxis hide domain={['auto', 'auto']} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const val = Number(payload[0].value);
                          return (
                            <div className="bg-slate-900 border-2 border-white p-2 rounded-lg shadow-xl">
                              <p className="text-white text-[10px] font-bold uppercase tracking-widest">
                                Rp {isNaN(val) ? "0.00" : val.toFixed(2)} JT
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="step" 
                      dataKey="price" 
                      stroke="#2563eb" 
                      strokeWidth={6} 
                      fill="#3b82f6" 
                      fillOpacity={0.1} 
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-dashed border-slate-100">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase italic">
                  <ArrowRightLeft className="w-3 h-3" /> Sumber: CoinGecko
                </div>
                <div className="text-[9px] font-black text-blue-600 uppercase">Refresh Otomatis</div>
              </div>
            </div>
          </div>

          {/* RIGHT STATS GRID */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <StatCard 
              label="Total Donasi" 
              value={stats ? `Rp ${formatNumber(stats.total_raised)}` : "..."} 
              icon={Heart} 
              color="bg-pink-500" 
              loading={loading}
            />
            <StatCard 
              label="Donatur Aktif" 
              value={stats ? `${formatNumber(stats.total_donors)}+` : "..."} 
              icon={Users} 
              color="bg-green-500" 
              loading={loading}
            />
            <StatCard 
              label="Campaign" 
              value={stats?.active_campaigns?.toString() || "0"} 
              icon={TrendingUp} 
              color="bg-blue-500" 
              loading={loading}
            />
            <StatCard 
              label="Lembaga" 
              value={stats?.total_organizations?.toString() || "0"} 
              icon={Building2} 
              color="bg-purple-500" 
              loading={loading}
            />
          </div>

        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  label: string;
  value: string;
  icon: any;
  color: string;
  loading: boolean;
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="group relative">
      <div className={`absolute inset-0 ${color} rounded-3xl translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300`} />
      <div className="relative bg-white border-4 border-slate-900 rounded-3xl p-6 flex flex-col items-center text-center space-y-3 group-hover:-translate-y-1 transition-all">
        <div className={`w-14 h-14 rounded-2xl border-4 border-slate-900 ${color} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-6 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div className="space-y-1">
          <p className={`text-3xl font-black text-slate-900 tracking-tighter uppercase italic leading-tight ${loading ? 'animate-pulse' : ''}`}>
            {value}
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            {label}
          </p>
        </div>
      </div>
    </div>
  )
}