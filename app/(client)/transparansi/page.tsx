"use client"
import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
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
  const [loading, setLoading] = useState(false)

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
      console.error('Error loading data:', error)
    }
  }

  const getCampaignByAddress = (contractAddress: string) => {
    return campaigns.find(c => c.contract_address?.toLowerCase() === contractAddress.toLowerCase())
  }

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('Tidak ada data untuk diekspor')
      return
    }

    const headers = ["Waktu", "Tipe", "Campaign", "Jumlah (ETH)", "From/To", "Hash Transaksi"]
    const rows = transactions.map((tx) => {
      const campaign = getCampaignByAddress(tx.contractAddress)
      const type = tx.from ? 'Donasi' : 'Penyaluran'
      const address = tx.from || tx.to || '-'
      const timestamp = new Date(tx.timestamp * 1000).toLocaleString('id-ID')
      
      return [
        timestamp,
        type,
        campaign?.title || '-',
        tx.amount,
        address,
        tx.contractAddress,
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)

    link.setAttribute("href", url)
    link.setAttribute("download", `ChainAid-Transaksi-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Data berhasil diekspor')
  }

  return (
    <main className="min-h-screen bg-background">
      <TransparencyHero />
      <TransparencyStatsBar />

      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Export Button */}
          <div className="flex justify-end">
            <Button onClick={handleExportCSV} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4" />
              Export Data (CSV)
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="donasi" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="donasi">Riwayat Donasi</TabsTrigger>
              <TabsTrigger value="penyaluran">Riwayat Penyaluran</TabsTrigger>
            </TabsList>

            <TabsContent value="donasi" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-950">Riwayat Donasi Real-time</h2>
                <p className="text-slate-600">Lihat semua donasi yang masuk dan verifikasi di blockchain Ethereum</p>
              </div>
              <DonationFeed />
            </TabsContent>

            <TabsContent value="penyaluran" className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-blue-950">Riwayat Penyaluran Dana</h2>
                <p className="text-slate-600">
                  Transparansi penuh tentang bagaimana dana donasi disalurkan dan dampaknya
                </p>
              </div>
              <DistributionGrid />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </main>
  )
}
