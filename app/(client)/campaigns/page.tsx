"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
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
      console.log('Fetching campaigns...')
      
      // Fetch all campaigns first (don't filter by status in API call)
      const response = await getCampaigns({}, { limit: 100 })
      console.log('Campaigns response:', response)
      
      // Filter only active campaigns on client side
      const activeCampaigns = response.data.filter(c => c.status === 'active')
      console.log('Active campaigns:', activeCampaigns.length)

      // Fetch blockchain data for campaigns with contract addresses
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
              console.error(`Failed to fetch blockchain data for ${campaign.id}:`, error)
              return campaign
            }
          }
          return campaign
        })
      )

      console.log('Campaigns with blockchain:', campaignsWithBlockchain.length)
      setCampaigns(campaignsWithBlockchain)
    } catch (error: any) {
      console.error('Error loading campaigns:', error)
      console.error('Error details:', error.message, error.stack)
      toast.error(`Gagal memuat campaign: ${error.message || 'Unknown error'}`)
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

    // Sort
    switch (sortBy) {
      case "terbaru":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "populer":
        filtered.sort((a, b) => (b.donor_count || 0) - (a.donor_count || 0))
        break
      case "deadline":
        filtered.sort((a, b) => {
          const aDate = a.end_date ? new Date(a.end_date).getTime() : Infinity
          const bDate = b.end_date ? new Date(b.end_date).getTime() : Infinity
          return aDate - bDate
        })
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
      <main className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-6" />
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-blue-400/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-lg text-slate-600 font-medium">Memuat campaign...</p>
          <p className="text-sm text-slate-500 mt-2">Mengambil data dari blockchain</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-50/80 via-purple-50/40 to-white border-b border-slate-200/50 py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200/50 shadow-sm mb-6">
            <span className="text-sm font-medium text-blue-900">💙 Temukan Campaign Pilihan Anda</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-br from-blue-900 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
            Jelajahi Campaign
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan campaign yang ingin Anda dukung dan lihat dampak kontribusi Anda secara transparan
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="lg:w-64 flex-shrink-0">
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

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Cari campaign atau organisasi..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-12 h-12 bg-white border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Results Info */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-600">
                Menampilkan <span className="font-semibold text-slate-900">{paginatedCampaigns.length}</span> dari{" "}
                <span className="font-semibold text-slate-900">{filteredCampaigns.length}</span> campaign
              </p>
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden gap-2 bg-transparent"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>

            {/* Campaign Grid */}
            {paginatedCampaigns.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedCampaigns.map((campaign) => (
                    <div key={campaign.id} className="relative">
                      <Link href={`/campaigns/${campaign.id}`}>
                        <CampaignCard campaign={campaign} />
                      </Link>
                      {/* CTA Button */}
                      <Link href={`/donate/${campaign.id}`} className="w-full absolute bottom-0 left-0">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 font-semibold rounded-lg">
                          Donasi Sekarang
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-slate-600 mb-4">Tidak ada campaign yang sesuai dengan pencarian Anda</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                    setSelectedStatus(null)
                  }}
                >
                  Hapus Filter
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
