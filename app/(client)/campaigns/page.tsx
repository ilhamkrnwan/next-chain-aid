"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Loader2, Zap, Target, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { CampaignCard } from "@/components/campaigns/campaign-card"
import { FilterSidebar } from "@/components/campaigns/filter-sidebar"
import { getCampaigns } from "@/lib/api"
import { getCampaignSummary, weiToEth } from "@/lib/blockchain"
import Link from "next/link"
import type { Campaign } from "@/lib/types"
import { toast } from "sonner"

const ITEMS_PER_PAGE = 6

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>("active")
  const [sortBy, setSortBy] = useState("terbaru")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const response = await getCampaigns({}, { limit: 100 })
      const activeCampaigns = response.data.filter(c => c.status === 'active')

      const campaignsWithBlockchain = await Promise.all(
        activeCampaigns.map(async (campaign) => {
          if (campaign.contract_address) {
            try {
              const summary = await getCampaignSummary(campaign.contract_address)
              return {
                ...campaign,
                collected_amount: summary.collectedAmount ? parseFloat(weiToEth(summary.collectedAmount)) : 0,
                donor_count: summary.donorCount || 0,
                target_amount_eth: summary.targetAmount ? parseFloat(weiToEth(summary.targetAmount)) : 0,
              }
            } catch (error) {
              return campaign
            }
          }
          return campaign
        })
      )
      setCampaigns(campaignsWithBlockchain)
    } catch (error: any) {
      toast.error(`Gagal memuat campaign: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = useMemo(() => {
    const filtered = campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.organization?.name.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || campaign.category === selectedCategory
      const matchesStatus = !selectedStatus || campaign.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })

    switch (sortBy) {
      case "terbaru":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "populer":
        filtered.sort((a, b) => (b.donor_count || 0) - (a.donor_count || 0))
        break
    }
    return filtered
  }, [campaigns, searchQuery, selectedCategory, selectedStatus, sortBy])

  const totalPages = Math.ceil(filteredCampaigns.length / ITEMS_PER_PAGE)
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedCampaigns = filteredCampaigns.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 border-8 border-slate-900 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-2xl font-black uppercase italic tracking-tighter">Sinkronisasi Blockchain...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white pb-24">
      {/* HEADER SECTION */}
      <div className="relative bg-blue-600 border-b-8 border-slate-900 py-24 px-4 overflow-hidden">
        {/* Retro Grid Decor */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 2px, transparent 2px)', backgroundSize: '30px 30px' }} />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-yellow-400 border-4 border-slate-900 rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-1">
            <Zap className="w-5 h-5 fill-slate-900" />
            <span className="text-sm font-black uppercase tracking-widest text-slate-900">Eksplorasi Program</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white italic tracking-tighter leading-none uppercase">
            Jelajahi <span className="text-slate-900">Kampanye.</span>
          </h1>
          <p className="text-xl font-bold text-blue-100 max-w-2xl mx-auto uppercase italic leading-tight">
            Pilih program bantuan yang ingin Anda dukung. Transparansi mutlak, dampak nyata.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR FILTER - Diberi gaya Card Neo-Brutal */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="sticky top-28 bg-white border-4 border-slate-900 rounded-[2rem] p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-dashed border-slate-200">
                <Filter className="w-5 h-5 text-blue-600" />
                <h3 className="font-black uppercase italic tracking-tighter">Filter Data</h3>
              </div>
              <FilterSidebar
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                sortBy={sortBy}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
                onSortChange={setSortBy}
                isOpen={isFilterOpen}
                onToggle={setIsFilterOpen}
              />
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-10">
            {/* SEARCH BAR NEO-BRUTAL */}
            <div className="relative group">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-2 translate-y-2 group-focus-within:translate-x-0 group-focus-within:translate-y-0 transition-all" />
              <div className="relative flex items-center bg-white border-4 border-slate-900 rounded-2xl overflow-hidden">
                <Search className="ml-6 w-6 h-6 text-slate-400" />
                <Input
                  type="text"
                  placeholder="CARI KAMPANYE ATAU ORGANISASI..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="border-none h-16 text-lg font-bold uppercase placeholder:text-slate-300 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* RESULTS INFO */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-blue-600" />
                <p className="font-black uppercase italic text-sm text-slate-500">
                  Ditemukan: <span className="text-slate-900">{filteredCampaigns.length} Program</span>
                </p>
              </div>
              <Button
                variant="outline"
                className="lg:hidden border-4 border-slate-900 font-black uppercase italic"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                Filter
              </Button>
            </div>

            {/* CAMPAIGN GRID */}
            {paginatedCampaigns.length > 0 ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {paginatedCampaigns.map((campaign) => (
                    <div key={campaign.id} className="group relative">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <CampaignCard campaign={campaign} />
                      </Link>
                      
                      {/* DONATE BUTTON - Terintegrasi dengan Card */}
                      <div className="mt-4">
                        <Link href={`/donate/${campaign.id}`}>
                          <Button className="w-full h-14 bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-4 border-slate-900 rounded-2xl font-black uppercase italic tracking-widest shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                            Donasi Sekarang <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center pt-10">
                    <div className="bg-white border-4 border-slate-900 p-2 rounded-2xl shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
                      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-24 bg-slate-50 border-4 border-dashed border-slate-300 rounded-[3rem]">
                <p className="text-2xl font-black text-slate-400 uppercase italic">Kampanye tidak ditemukan</p>
                <Button
                  variant="link"
                  className="mt-4 font-black text-blue-600 underline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                  }}
                >
                  RESET SEMUA FILTER
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}