"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, ShieldCheck, Activity, Send, Zap } from "lucide-react"
import { TransparencyHero } from "@/components/transparansi/hero-section"
import { TransparencyStatsBar } from "@/components/transparansi/stats-bar"
import { DonationFeed } from "@/components/transparansi/donation-feed"
import { DistributionGrid } from "@/components/transparansi/distribution-grid"
import { Footer } from "@/components/sections/footer"
import { getAllTransactionsFromBlockchain } from "@/lib/admin-blockchain"
import { getCampaigns } from "@/lib/api"
import type { BlockchainTransaction, Campaign } from "@/lib/types"
import { toast } from "sonner"

export default function TransparencyPage() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [txData, campaignsResponse] = await Promise.all([
        getAllTransactionsFromBlockchain(),
        getCampaigns({}, { limit: 1000 })
      ])
      setTransactions(txData)
      setCampaigns(campaignsResponse.data)
    } catch (error) {
      console.error('Gagal ambil data:', error)
    }
  }

  const getCampaignByAddress = (contractAddress: string) => {
    return campaigns.find(c => c.contract_address?.toLowerCase() === contractAddress.toLowerCase())
  }

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('Datanya masih kosong, Bang!')
      return
    }

    const headers = ["Waktu", "Tipe", "Campaign", "Jumlah (ETH)", "From/To", "Hash Transaksi"]
    const rows = transactions.map((tx) => {
      const campaign = getCampaignByAddress(tx.contractAddress)
      const type = tx.from ? 'Donasi Masuk' : 'Dana Keluar'
      const address = tx.from || tx.to || '-'
      const timestamp = new Date(tx.timestamp * 1000).toLocaleString('id-ID')
      
      return [timestamp, type, campaign?.title || '-', tx.amount, address, tx.contractAddress]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `ChainAid-Laporan-Audit-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Laporan Berhasil Didownload! Gaskeun!')
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <TransparencyHero />
      
      {/* Stats Bar nempel dikit ke Hero */}
      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-20">
        <TransparencyStatsBar />
      </div>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-slate-900 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <ShieldCheck className="w-6 h-6 stroke-[3px]" />
                <span className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400">Data Terverifikasi Blockchain</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
                Jejak Audit<span className="text-blue-600">.</span>
              </h1>
            </div>

            <Button 
              onClick={handleExportCSV} 
              className="h-14 px-8 bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-4 border-slate-900 rounded-2xl font-black uppercase italic tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Download className="w-5 h-5 mr-2 stroke-[3px]" />
              Download Laporan (CSV)
            </Button>
          </div>

          {/* Sistem Tab Kontrol */}
          <Tabs defaultValue="donasi" className="space-y-10">
            <TabsList className="flex flex-wrap h-auto gap-4 bg-transparent p-0">
              <TabsTrigger 
                value="donasi" 
                className="flex-1 md:flex-none px-8 py-4 border-4 border-slate-900 rounded-2xl font-black uppercase italic text-xs data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=inactive]:bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none transition-all"
              >
                <Activity className="w-4 h-4 mr-2" />
                Riwayat Donasi
              </TabsTrigger>
              <TabsTrigger 
                value="penyaluran" 
                className="flex-1 md:flex-none px-8 py-4 border-4 border-slate-900 rounded-2xl font-black uppercase italic text-xs data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=inactive]:bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] data-[state=active]:shadow-none transition-all"
              >
                <Send className="w-4 h-4 mr-2" />
                Penyaluran Dana
              </TabsTrigger>
            </TabsList>

            <TabsContent value="donasi" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="space-y-8">
                <div className="p-8 bg-blue-50 border-4 border-slate-900 rounded-[2.5rem] space-y-3 relative overflow-hidden">
                  <Zap className="absolute right-[-20px] top-[-20px] w-32 h-32 text-blue-100 rotate-12" />
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter relative z-10">Donasi Real-time</h2>
                  <p className="font-bold text-slate-600 uppercase text-[10px] tracking-wider relative z-10 max-w-2xl">
                    Semua transaksi masuk yang tercatat secara permanen. Transparan, jujur, dan tidak bisa dimanipulasi oleh siapa pun.
                  </p>
                </div>
                <DonationFeed />
              </div>
            </TabsContent>

            <TabsContent value="penyaluran" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
              <div className="space-y-8">
                <div className="p-8 bg-red-50 border-4 border-slate-900 rounded-[2.5rem] space-y-3 relative overflow-hidden">
                  <Send className="absolute right-[-20px] top-[-20px] w-32 h-32 text-red-100 -rotate-12" />
                  <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter relative z-10">Alur Distribusi</h2>
                  <p className="font-bold text-slate-600 uppercase text-[10px] tracking-wider relative z-10 max-w-2xl">
                    Lacak ke mana setiap ETH disalurkan. Kami memastikan dana sampai ke tangan yang tepat dengan bukti on-chain.
                  </p>
                </div>
                <DistributionGrid />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </main>
  )
}