"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { 
  getCampaigns, 
  approveCampaign, 
  rejectCampaign, 
  freezeCampaign, 
  unfreezeCampaign,
  getCurrentProfile
} from "@/lib/api"
import { getCampaignSummary, weiToEth } from "@/lib/blockchain"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MoreVertical, 
  Eye, 
  Search, 
  Check, 
  X, 
  Loader2, 
  Snowflake, 
  ShieldCheck,
  Building2 
} from "lucide-react"
import { toast } from "sonner"
import type { Campaign, Profile } from "@/lib/types"

const STATUS_CONFIG = {
  active: { label: "Aktif", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  pending_approval: { label: "Perlu Review", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  ended: { label: "Selesai", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  draft: { label: "Draft", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" },
  frozen: { label: "Frozen", className: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
}

export default function CampaignManagementPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [reason, setReason] = useState("")
  const [dialogType, setDialogType] = useState<"reject" | "freeze" | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [currentAdmin, setCurrentAdmin] = useState<Profile | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterCampaigns()
  }, [campaigns, searchQuery, statusFilter, categoryFilter])

  const loadData = async () => {
    try {
      const [campaignsResponse, adminProfile] = await Promise.all([
        getCampaigns({}, { limit: 100 }), // Get all for now, implementation pagination later
        getCurrentProfile()
      ])

      const campaignsData = campaignsResponse.data

      // Fetch blockchain data for active/ended/frozen campaigns
      const campaignsWithBlockchain = await Promise.all(
        campaignsData.map(async (campaign) => {
          if ((campaign.status === 'active' || campaign.status === 'frozen') && campaign.contract_address) {
            try {
              const summary = await getCampaignSummary(campaign.contract_address)
              return {
                ...campaign,
                collected_amount: summary.collectedAmount ? parseFloat(weiToEth(summary.collectedAmount)) : 0,
                donor_count: summary.donorCount || 0
              }
            } catch (error) {
              console.error(`Failed to fetch blockchain data for ${campaign.id}:`, error)
              return campaign
            }
          }
          return campaign
        })
      )

      setCampaigns(campaignsWithBlockchain)
      setCurrentAdmin(adminProfile)
    } catch (error) {
      console.error('Error loading campaigns:', error)
      toast.error("Gagal memuat data campaign")
    } finally {
      setLoading(false)
    }
  }

  const filterCampaigns = () => {
    let filtered = campaigns

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => 
        statusFilter === 'frozen' ? c.is_frozen : c.status === statusFilter
      )
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(c => c.category === categoryFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.organization?.name.toLowerCase().includes(query)
      )
    }

    setFilteredCampaigns(filtered)
  }

  const handleAction = async () => {
    if (!selectedCampaign || !currentAdmin || !dialogType) return
    if (!reason.trim()) {
      toast.error("Alasan harus diisi")
      return
    }

    setActionLoading(true)
    try {
      if (dialogType === 'reject') {
        await rejectCampaign(selectedCampaign.id, currentAdmin.id, reason)
        toast.success("Campaign berhasil ditolak")
      } else if (dialogType === 'freeze') {
        await freezeCampaign(selectedCampaign.id, currentAdmin.id, reason)
        toast.success("Campaign berhasil dibekukan")
      }

      loadData()
      handleCloseDialog()
    } catch (error: any) {
      console.error(`Error ${dialogType} campaign:`, error)
      toast.error(error.message || `Gagal ${dialogType === 'reject' ? 'menolak' : 'membekukan'} campaign`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleApprove = async (campaign: Campaign) => {
    if (!currentAdmin) return
    
    // Check if user want to approve
    if (!window.confirm(`Setujui campaign "${campaign.title}"?`)) return

    setActionLoading(true)
    try {
      await approveCampaign(campaign.id, currentAdmin.id)
      toast.success("Campaign berhasil disetujui")
      loadData()
    } catch (error: any) {
      console.error('Error approving campaign:', error)
      toast.error(error.message || "Gagal menyetujui campaign")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnfreeze = async (campaign: Campaign) => {
    if (!currentAdmin) return

    if (!window.confirm(`Buka pembekuan campaign "${campaign.title}"?`)) return

    setActionLoading(true)
    try {
      await unfreezeCampaign(campaign.id, currentAdmin.id)
      toast.success("Campaign berhasil di-unfreeze")
      loadData()
    } catch (error: any) {
      console.error('Error unfreezing campaign:', error)
      toast.error(error.message || "Gagal meng-unfreeze campaign")
    } finally {
      setActionLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setSelectedCampaign(null)
    setDialogType(null)
    setReason("")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatETH = (amount: number) => {
    return `${amount.toFixed(4)} ETH`
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Kelola campaign donasi, review pengajuan, dan pantau aktivitas
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari campaign atau organisasi..."
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
                <SelectItem value="pending_approval">Perlu Review</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="frozen">Frozen</SelectItem>
                <SelectItem value="ended">Selesai</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                <SelectItem value="kesehatan">Kesehatan</SelectItem>
                <SelectItem value="pendidikan">Pendidikan</SelectItem>
                <SelectItem value="bencana_alam">Bencana Alam</SelectItem>
                <SelectItem value="lingkungan">Lingkungan</SelectItem>
                <SelectItem value="sosial">Sosial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Campaign ({filteredCampaigns.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Tidak ada campaign yang sesuai filter"
                  : "Belum ada campaign"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Campaign</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Organisasi</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Target / Terkumpul</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Donatur</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCampaigns.map((campaign) => {
                    const status = campaign.is_frozen ? 'frozen' : campaign.status
                    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft
                    
                    return (
                      <tr key={campaign.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={campaign.image_url || "/placeholder.svg"}
                                alt={campaign.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="max-w-[200px]">
                              <span className="font-medium text-sm line-clamp-2" title={campaign.title}>
                                {campaign.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-foreground max-w-[150px] truncate">
                          {campaign.organization?.name}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            <div className="font-semibold text-foreground">
                              {campaign.contract_address ? formatETH(campaign.collected_amount || 0) : '-'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Target: {formatCurrency(campaign.target_amount)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-foreground">
                          {campaign.donor_count || 0}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={config.className}>
                            {campaign.is_frozen ? 'Dibekukan' : config.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/admin/campaign/review/${campaign.id}`)}>
                                <Eye className="w-4 h-4 mr-2" />
                                <span>Lihat Detail</span>
                              </DropdownMenuItem>
                              
                              {campaign.status === "pending_approval" && !campaign.is_frozen && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleApprove(campaign)}>
                                    <Check className="w-4 h-4 mr-2 text-green-600" />
                                    <span>Setujui</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => {
                                      setSelectedCampaign(campaign)
                                      setDialogType('reject')
                                    }}
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    <span>Tolak</span>
                                  </DropdownMenuItem>
                                </>
                              )}

                              {campaign.status === "active" && !campaign.is_frozen && (
                                <DropdownMenuItem 
                                  className="text-orange-600"
                                  onClick={() => {
                                    setSelectedCampaign(campaign)
                                    setDialogType('freeze')
                                  }}
                                >
                                  <Snowflake className="w-4 h-4 mr-2" />
                                  <span>Bekukan (Freeze)</span>
                                </DropdownMenuItem>
                              )}

                              {campaign.is_frozen && (
                                <DropdownMenuItem 
                                  className="text-green-600"
                                  onClick={() => handleUnfreeze(campaign)}
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  <span>Buka Bekukan</span>
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!dialogType} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'reject' ? 'Tolak Campaign' : 'Bekukan Campaign'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'reject' 
                ? 'Berikan alasan penolakan untuk campaign ini.' 
                : 'Berikan alasan pembekuan campaign ini. Campaign yang dibekukan tidak dapat menerima donasi.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={dialogType === 'reject' ? 'Contoh: Data tidak lengkap...' : 'Contoh: Indikasi penipuan...'}
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCloseDialog}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                className={`flex-1 ${dialogType === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                onClick={handleAction}
                disabled={actionLoading || !reason.trim()}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : dialogType === 'reject' ? (
                  <X className="w-4 h-4 mr-2" />
                ) : (
                  <Snowflake className="w-4 h-4 mr-2" />
                )}
                {dialogType === 'reject' ? 'Tolak Campaign' : 'Bekukan Campaign'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
