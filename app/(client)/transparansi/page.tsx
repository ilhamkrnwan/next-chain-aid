"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { TransparencyHero } from "@/components/transparansi/hero-section"
import { TransparencyStatsBar } from "@/components/transparansi/stats-bar"
import { DonationFeed } from "@/components/transparansi/donation-feed"
import { DistributionGrid } from "@/components/transparansi/distribution-grid"
import { mockTransactions } from "@/lib/mock-transparency-data"
import { Footer } from "@/components/sections/footer"

export default function TransparencyPage() {
  const handleExportCSV = () => {
    const headers = ["Waktu", "Nama Donatur", "Jumlah (Rp)", "Campaign", "Hash Transaksi"]
    const rows = mockTransactions.map((tx) => [
      tx.timestamp,
      tx.isAnonymous ? "Anonim" : tx.donorName,
      tx.amount.toString(),
      tx.campaignName,
      tx.txHash,
    ])

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
