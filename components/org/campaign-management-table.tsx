"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { getCampaignBlockchainData, ethToIdr } from "@/lib/blockchain-helpers"
import { Search, Eye, Edit, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import type { Campaign, CampaignStatus } from "@/lib/types"

interface CampaignWithBlockchain extends Campaign {
  blockchainData?: {
    collectedAmount: number
    progress: number
    donorCount: number
  } | null
}

const STATUS_CONFIG = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
  pending_approval: { label: "Menunggu Approval", className: "bg-yellow-100 text-yellow-800" },
  active: { label: "Aktif", className: "bg-green-100 text-green-800" },
  ended: { label: "Berakhir", className: "bg-blue-100 text-blue-800" },
  frozen: { label: "Dibekukan", className: "bg-red-100 text-red-800" },
}

export function CampaignManagementTable() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<CampaignWithBlockchain[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignWithBlockchain[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    fetchCampaigns()
  }, [])

  useEffect(() => {
    filterCampaigns()
  }, [campaigns, searchQuery, statusFilter])

  async function fetchCampaigns() {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })

      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([])
        setLoading(false)
        return
      }

      // Fetch blockchain data for campaigns with contract addresses
      const campaignsWithBlockchain = await Promise.all(
        campaignsData.map(async (campaign) => {
          if (!campaign.contract_address) {
            return { ...campaign, blockchainData: null }
          }

          const blockchainData = await getCampaignBlockchainData(campaign.contract_address)
          return {
            ...campaign,
            blockchainData,
          }
        })
      )

      setCampaigns(campaignsWithBlockchain as CampaignWithBlockchain[])
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterCampaigns() {
    let filtered = campaigns

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredCampaigns(filtered)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cari campaign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Menunggu Approval</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="ended">Berakhir</SelectItem>
            <SelectItem value="frozen">Dibekukan</SelectItem>
          </SelectContent>
        </Select>

        {/* Create Button */}
        <Link href="/org/campaigns/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Campaign
          </Button>
        </Link>
      </div>

      {/* Table */}
      {filteredCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Tidak ada campaign yang sesuai filter"
              : "Belum ada campaign. Buat campaign pertama Anda!"}
          </p>
          {!searchQuery && statusFilter === "all" && (
            <Link href="/org/campaigns/create">
              <Button className="mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Buat Campaign Pertama
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Campaign</th>
                <th className="text-left py-3 px-4 font-semibold">Kategori</th>
                <th className="text-left py-3 px-4 font-semibold">Status</th>
                <th className="text-left py-3 px-4 font-semibold">Target</th>
                <th className="text-left py-3 px-4 font-semibold">Terkumpul</th>
                <th className="text-left py-3 px-4 font-semibold">Progress</th>
                <th className="text-right py-3 px-4 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium line-clamp-1">{campaign.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {campaign.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className="capitalize">
                      {campaign.category?.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={STATUS_CONFIG[campaign.status].className}>
                      {STATUS_CONFIG[campaign.status].label}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium">{ethToIdr(campaign.target_amount)}</p>
                  </td>
                  <td className="py-3 px-4">
                    {campaign.blockchainData ? (
                      <div>
                        <p className="font-medium text-green-600">
                          {ethToIdr(campaign.blockchainData.collectedAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.blockchainData.donorCount} donatur
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">Belum deploy</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {campaign.blockchainData ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${campaign.blockchainData.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {campaign.blockchainData.progress}%
                        </span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">-</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/org/campaigns/${campaign.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/org/campaigns/${campaign.id}/edit`}>
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {filteredCampaigns.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Menampilkan {filteredCampaigns.length} dari {campaigns.length} campaign
        </div>
      )}
    </div>
  )
}
