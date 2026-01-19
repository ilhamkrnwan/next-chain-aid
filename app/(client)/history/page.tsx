"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { 
  getUserDonationHistory, 
  isWalletConnected, 
  formatAddress 
} from "@/lib/blockchain"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  TrendingUp, 
  Loader2,
  ArrowUpRight,
  Wallet,
  Zap,
  ExternalLink,
  Ghost
} from "lucide-react"
import Link from "next/link"
import { ethers } from "ethers"

interface DonationHistory {
  id: string
  campaign_id: string
  campaign_title: string
  amount: string
  message: string
  timestamp: number
  tx_hash: string
  campaign?: {
    image_url: string
    organization_name: string
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const [donations, setDonations] = useState<DonationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isWalletConnectedStatus, setIsWalletConnectedStatus] = useState(false)
  const [activeAddress, setActiveAddress] = useState("")
  
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: "0.00",
    campaignsSupported: 0,
  })

  useEffect(() => {
    checkConnectionAndLoadData()
  }, [])

  const checkConnectionAndLoadData = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const connected = await isWalletConnected()
      setIsWalletConnectedStatus(connected)

      if (connected && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        setActiveAddress(address)

        const data = await getUserDonationHistory(address)
        setDonations(data)

        const totalAmt = data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
        const uniqueCampaigns = new Set(data.map(d => d.campaign_id)).size

        setStats({
          totalDonations: data.length,
          totalAmount: totalAmt.toFixed(4),
          campaignsSupported: uniqueCampaigns
        })
      }
    } catch (error) {
      console.error('Gagal memuat riwayat:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="font-black uppercase italic tracking-widest text-slate-900">MENARIK DATA ON-CHAIN...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 relative">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '30px 30px' }} />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* HEADER */}
        <div className="border-b-8 border-slate-900 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-500 border-4 border-slate-900 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white mb-2">
              <Zap className="w-4 h-4 fill-white" />
              <span className="text-[10px] font-black uppercase italic tracking-widest">Aktivitas Anda</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
              RIWAYAT <span className="text-blue-600">DONASI.</span>
            </h1>
          </div>

          <div className={`${isWalletConnectedStatus ? 'bg-green-400' : 'bg-yellow-400'} border-4 border-slate-900 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
             <div className="flex items-center gap-3 text-slate-900">
                <Wallet className="w-6 h-6" />
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase leading-none">Status Dompet:</span>
                   <span className="text-sm font-black uppercase italic leading-none">
                    {isWalletConnectedStatus ? `TERHUBUNG (${formatAddress(activeAddress)})` : "BELUM TERHUBUNG"}
                   </span>
                </div>
             </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Donasi", val: stats.totalDonations, color: "bg-blue-600", icon: Heart },
            { label: "Kontribusi (ETH)", val: stats.totalAmount, color: "bg-green-500", icon: TrendingUp },
            { label: "Campaign", val: stats.campaignsSupported, color: "bg-purple-500", icon: Zap },
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div className={`absolute inset-0 ${stat.color} border-4 border-slate-900 rounded-2xl translate-x-2 translate-y-2`} />
              <div className="relative bg-white border-4 border-slate-900 rounded-2xl p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase italic text-slate-500">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{stat.val}</p>
                </div>
                <stat.icon className={`w-10 h-10 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          ))}
        </div>

        {/* TRANSACTION LIST */}
        <div className="relative group">
          <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] translate-x-3 translate-y-3" />
          <div className="relative bg-white border-4 border-slate-900 rounded-[2.5rem] p-8 min-h-[400px]">
            <h3 className="text-2xl font-black uppercase italic text-slate-900 mb-8 border-b-4 border-dashed border-slate-200 pb-4">
              Log Transaksi Blockchain
            </h3>

            {!isWalletConnectedStatus ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-100 border-4 border-dashed border-slate-400 rounded-full flex items-center justify-center">
                  <Wallet className="w-12 h-12 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase italic">Dompet Tidak Terhubung</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic max-w-xs mx-auto">
                    Silakan hubungkan MetaMask Anda untuk melihat data transaksi yang sinkron dengan blockchain.
                  </p>
                </div>
                <Button 
                  onClick={() => window.location.reload()}
                  className="h-14 bg-yellow-400 text-slate-900 border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black uppercase italic px-10"
                >
                  Refresh Koneksi <Zap className="ml-2 w-5 h-5 fill-slate-900" />
                </Button>
              </div>
            ) : donations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-24 h-24 bg-slate-100 border-4 border-dashed border-slate-400 rounded-full flex items-center justify-center">
                  <Ghost className="w-12 h-12 text-slate-400" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase italic">Belum Ada Transaksi</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic max-w-xs mx-auto">
                    Alamat {formatAddress(activeAddress)} belum tercatat melakukan donasi di campaign manapun.
                  </p>
                </div>
                <Link href="/campaigns">
                  <Button className="h-14 bg-blue-600 border-4 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black uppercase italic px-10 text-white">
                    Mulai Donasi Sekarang <ArrowUpRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {donations.map((item) => (
                  <div key={item.id} className="group relative bg-slate-50 border-4 border-slate-900 rounded-2xl p-4 flex items-center gap-6 hover:bg-white transition-colors">
                    
                    {/* AVATAR DIPERBAIKI: ROUNDED-FULL TANPA SHADOW ANEH */}
                    <Avatar className="w-16 h-16 rounded-full border-2 border-slate-900 overflow-hidden shrink-0">
                      <AvatarImage src={item.campaign?.image_url} className="object-cover" />
                      <AvatarFallback className="bg-blue-600 text-white font-black text-xl">
                        {item.campaign_title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black uppercase italic text-lg truncate leading-tight">{item.campaign_title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase italic">
                         Organisasi: {item.campaign?.organization_name || "DIVERIFIED ENTITY"}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1 bg-green-100 px-3 py-1 border-2 border-green-600 rounded-lg">
                          <span className="text-sm font-black text-green-700">{item.amount} ETH</span>
                        </div>
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${item.tx_hash}`} 
                          target="_blank" 
                          className="flex items-center gap-1 text-[10px] font-black text-blue-600 underline decoration-2 underline-offset-4 hover:text-pink-600"
                        >
                          <ExternalLink className="w-3 h-3" /> LIHAT ON-CHAIN
                        </a>
                      </div>
                    </div>

                    <div className="hidden md:block text-right border-l-2 border-slate-200 pl-6">
                       <p className="text-[10px] font-black uppercase text-slate-400">Terdaftar Pada</p>
                       <p className="text-xs font-bold uppercase italic text-slate-900">
                        {new Date(item.timestamp).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* BRUTALIST INFO NOTE */}
        <div className="bg-blue-600 border-4 border-slate-900 p-6 rounded-3xl shadow-[6px_6px_0px_0px_rgba(253,224,71,1)]">
          <div className="flex gap-4">
             <div className="bg-white border-2 border-slate-900 p-2 rounded-xl h-fit">
                <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
             </div>
             <div className="space-y-1">
                <h5 className="font-black text-white uppercase italic tracking-tighter text-lg">Transparansi Mutlak</h5>
                <p className="text-xs font-bold text-blue-100 uppercase leading-relaxed italic">
                  Data ini ditarik langsung dari jaringan Sepolia. ChainAid memastikan setiap Wei yang Anda berikan tercatat secara immutable dan dapat diaudit oleh siapapun di seluruh dunia.
                </p>
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}