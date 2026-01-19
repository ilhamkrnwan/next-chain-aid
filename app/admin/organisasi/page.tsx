"use client"

import { useEffect, useState } from "react"
import { 
  getOrganizations, 
  approveOrganization, 
  rejectOrganization,
  banOrganization,
  unbanOrganization,
  getCurrentProfile
} from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { 
  Check, 
  X, 
  Eye, 
  Loader2,
  Building2,
  FileText,
  ExternalLink,
  Search,
  Ban,
  ShieldCheck,
  Printer
} from "lucide-react"
import { toast } from "sonner"
import type { Organization, Profile } from "@/lib/types"
// DISABLED: FastAPI integration and PDF generation
// import { getOrganizationDetail } from "@/lib/fastapi"
// import { generateAndDownloadOrganizationPDF } from "@/lib/pdf-generator"

const STATUS_CONFIG = {
  approved: { label: "Disetujui", className: "bg-green-100 text-green-800 hover:bg-green-100" },
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-800 hover:bg-red-100" },
}

export default function OrganisasiPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [banReason, setBanReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [banFilter, setBanFilter] = useState<string>("all")
  const [currentAdmin, setCurrentAdmin] = useState<Profile | null>(null)
  const [printLoading, setPrintLoading] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    filterOrganizations()
  }, [organizations, searchQuery, statusFilter, banFilter])

  const loadData = async () => {
    try {
      const [orgsData, adminProfile] = await Promise.all([
        getOrganizations(),
        getCurrentProfile()
      ])
      setOrganizations(orgsData)
      setCurrentAdmin(adminProfile)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  const filterOrganizations = () => {
    let filtered = organizations

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(org => org.status === statusFilter)
    }

    // Filter by ban status
    if (banFilter === "banned") {
      filtered = filtered.filter(org => org.is_banned)
    } else if (banFilter === "active") {
      filtered = filtered.filter(org => !org.is_banned)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredOrgs(filtered)
  }

  const handleApprove = async (org: Organization) => {
    if (!currentAdmin) return
    
    setActionLoading(true)
    try {
      await approveOrganization(org.id, currentAdmin.id)
      toast.success(`Organisasi "${org.name}" berhasil disetujui!`)
      loadData()
      setSelectedOrg(null)
    } catch (error: any) {
      console.error('Error approving organization:', error)
      toast.error(error.message || "Gagal menyetujui organisasi")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedOrg || !currentAdmin) return
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan harus diisi")
      return
    }

    setActionLoading(true)
    try {
      await rejectOrganization(selectedOrg.id, currentAdmin.id, rejectionReason)
      toast.success(`Organisasi "${selectedOrg.name}" ditolak`)
      loadData()
      setSelectedOrg(null)
      setShowRejectDialog(false)
      setRejectionReason("")
    } catch (error: any) {
      console.error('Error rejecting organization:', error)
      toast.error(error.message || "Gagal menolak organisasi")
    } finally {
      setActionLoading(false)
    }
  }

  const handleBan = async () => {
    if (!selectedOrg || !currentAdmin) return
    if (!banReason.trim()) {
      toast.error("Alasan ban harus diisi")
      return
    }

    setActionLoading(true)
    try {
      await banOrganization(selectedOrg.id, currentAdmin.id, banReason)
      toast.success(`Organisasi "${selectedOrg.name}" berhasil di-ban`)
      loadData()
      setSelectedOrg(null)
      setShowBanDialog(false)
      setBanReason("")
    } catch (error: any) {
      console.error('Error banning organization:', error)
      toast.error(error.message || "Gagal mem-ban organisasi")
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnban = async (org: Organization) => {
    if (!currentAdmin) return

    setActionLoading(true)
    try {
      await unbanOrganization(org.id, currentAdmin.id)
      toast.success(`Organisasi "${org.name}" berhasil di-unban`)
      loadData()
      setSelectedOrg(null)
    } catch (error: any) {
      console.error('Error unbanning organization:', error)
      toast.error(error.message || "Gagal meng-unban organisasi")
    } finally {
      setActionLoading(false)
    }
  }

  const handlePrintOrganization = async (org: Organization) => {
    // DISABLED: FastAPI and PDF generation feature
    toast.error("Fitur print PDF telah dinonaktifkan")
    return
    
    /* ORIGINAL CODE - DISABLED
    setPrintLoading(org.id)
    try {
      toast.loading("Mengambil data organisasi...", { id: 'print-org' })
      
      // Fetch organization detail from FastAPI
      const orgDetail = await getOrganizationDetail(org.id)
      
      toast.loading("Membuat PDF...", { id: 'print-org' })
      
      // Generate and download PDF (now async to support image loading)
      await generateAndDownloadOrganizationPDF(orgDetail, org.name)
      
      toast.success("PDF berhasil diunduh!", { id: 'print-org' })
    } catch (error: any) {
      console.error('Error printing organization:', error)
      toast.error(error.message || "Gagal membuat PDF", { id: 'print-org' })
    } finally {
      setPrintLoading(null)
    }
    */
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const bannedCount = organizations.filter(o => o.is_banned).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Organisasi</h1>
        <p className="text-muted-foreground mt-1">
          Kelola dan review organisasi yang terdaftar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">{organizations.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {organizations.filter(o => o.status === 'approved').length}
              </p>
              <p className="text-sm text-muted-foreground">Disetujui</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {organizations.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {organizations.filter(o => o.status === 'rejected').length}
              </p>
              <p className="text-sm text-muted-foreground">Ditolak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{bannedCount}</p>
              <p className="text-sm text-muted-foreground">Banned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari organisasi, admin, atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Disetujui</SelectItem>
                <SelectItem value="rejected">Ditolak</SelectItem>
              </SelectContent>
            </Select>

            {/* Ban Filter */}
            <Select value={banFilter} onValueChange={setBanFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organization List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Organisasi ({filteredOrgs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredOrgs.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || banFilter !== "all"
                  ? "Tidak ada organisasi yang sesuai filter"
                  : "Belum ada organisasi terdaftar"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrgs.map((org) => (
                <div
                  key={org.id}
                  className={`flex items-start gap-4 p-4 border rounded-lg transition ${
                    org.is_banned 
                      ? 'border-red-300 bg-red-50/50' 
                      : 'border-border hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  {/* Logo */}
                  <Avatar className="w-16 h-16 rounded-lg">
                    <AvatarImage src={org.image_url || ""} alt={org.name} />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      {getInitials(org.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-foreground truncate">
                            {org.name}
                          </h3>
                          {org.is_banned && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <Ban className="w-3 h-3" />
                              BANNED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Admin: {org.profile?.full_name || "-"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Email: {org.profile?.email || "-"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Terdaftar: {formatDate(org.created_at)}
                        </p>
                      </div>
                      <Badge className={STATUS_CONFIG[org.status].className}>
                        {STATUS_CONFIG[org.status].label}
                      </Badge>
                    </div>

                    {/* Ban Info */}
                    {org.is_banned && org.ban_reason && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded text-sm">
                        <p className="font-semibold text-red-900">Alasan Ban:</p>
                        <p className="text-red-800 mt-1">{org.ban_reason}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedOrg(org)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrintOrganization(org)}
                        disabled={printLoading === org.id}
                      >
                        {printLoading === org.id ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4 mr-1" />
                        )}
                        Print
                      </Button>
                      
                      {!org.is_banned && org.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleApprove(org)}
                            disabled={actionLoading}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedOrg(org)
                              setShowRejectDialog(true)
                            }}
                            disabled={actionLoading}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Tolak
                          </Button>
                        </>
                      )}

                      {!org.is_banned && org.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700"
                          onClick={() => {
                            setSelectedOrg(org)
                            setShowBanDialog(true)
                          }}
                          disabled={actionLoading}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </Button>
                      )}

                      {org.is_banned && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUnban(org)}
                          disabled={actionLoading}
                        >
                          <ShieldCheck className="w-4 h-4 mr-1" />
                          Unban
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedOrg && !showRejectDialog && !showBanDialog} onOpenChange={(open) => !open && setSelectedOrg(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Organisasi</DialogTitle>
            <DialogDescription>
              Informasi lengkap organisasi
            </DialogDescription>
          </DialogHeader>

          {selectedOrg && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 rounded-lg">
                  <AvatarImage src={selectedOrg.image_url || ""} alt={selectedOrg.name} />
                  <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600 text-xl">
                    {getInitials(selectedOrg.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedOrg.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <Badge className={STATUS_CONFIG[selectedOrg.status].className}>
                      {STATUS_CONFIG[selectedOrg.status].label}
                    </Badge>
                    {selectedOrg.is_banned && (
                      <Badge variant="destructive">BANNED</Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Admin</Label>
                  <p className="text-sm font-medium mt-1">{selectedOrg.profile?.full_name || "-"}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium mt-1">{selectedOrg.profile?.email || "-"}</p>
                </div>
                <div>
                  <Label>Telepon</Label>
                  <p className="text-sm font-medium mt-1">{selectedOrg.phone || "-"}</p>
                </div>
                <div>
                  <Label>Website</Label>
                  <p className="text-sm font-medium mt-1">{selectedOrg.website || "-"}</p>
                </div>
              </div>

              <div>
                <Label>Alamat</Label>
                <p className="text-sm font-medium mt-1">{selectedOrg.address || "-"}</p>
              </div>

              <div>
                <Label>Deskripsi</Label>
                <p className="text-sm mt-1 text-muted-foreground">
                  {selectedOrg.description || "-"}
                </p>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <Label>Dokumen</Label>
                <div className="flex gap-2">
                  {selectedOrg.ktp_url && (
                    <a
                      href={selectedOrg.ktp_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm transition"
                    >
                      <FileText className="w-4 h-4" />
                      KTP
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {selectedOrg.legal_doc_url && (
                    <a
                      href={selectedOrg.legal_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded text-sm transition"
                    >
                      <FileText className="w-4 h-4" />
                      Dokumen Legal
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* Rejection Reason */}
              {selectedOrg.status === 'rejected' && selectedOrg.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <Label className="text-red-900">Alasan Penolakan</Label>
                  <p className="text-sm text-red-800 mt-1">{selectedOrg.rejection_reason}</p>
                </div>
              )}

              {/* Ban Reason */}
              {selectedOrg.is_banned && selectedOrg.ban_reason && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Label className="text-orange-900">Alasan Ban</Label>
                  <p className="text-sm text-orange-800 mt-1">{selectedOrg.ban_reason}</p>
                  <p className="text-xs text-orange-600 mt-2">
                    Banned pada: {formatDate(selectedOrg.banned_at)}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {!selectedOrg.is_banned && selectedOrg.status === 'pending' && (
                  <>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(selectedOrg)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 mr-2" />
                      )}
                      Setujui
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-600"
                      onClick={() => setShowRejectDialog(true)}
                      disabled={actionLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Tolak
                    </Button>
                  </>
                )}

                {!selectedOrg.is_banned && selectedOrg.status === 'approved' && (
                  <Button
                    variant="outline"
                    className="flex-1 text-orange-600"
                    onClick={() => setShowBanDialog(true)}
                    disabled={actionLoading}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Ban Organisasi
                  </Button>
                )}

                {selectedOrg.is_banned && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleUnban(selectedOrg)}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 mr-2" />
                    )}
                    Unban Organisasi
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Organisasi</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk organisasi ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan Penolakan *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Jelaskan alasan penolakan organisasi..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRejectDialog(false)
                  setRejectionReason("")
                }}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleReject}
                disabled={actionLoading || !rejectionReason.trim()}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <X className="w-4 h-4 mr-2" />
                )}
                Tolak Organisasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban Organisasi</DialogTitle>
            <DialogDescription>
              Berikan alasan untuk mem-ban organisasi ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="ban-reason">Alasan Ban *</Label>
              <Textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Jelaskan alasan ban organisasi..."
                rows={4}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowBanDialog(false)
                  setBanReason("")
                }}
                disabled={actionLoading}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                onClick={handleBan}
                disabled={actionLoading || !banReason.trim()}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Ban className="w-4 h-4 mr-2" />
                )}
                Ban Organisasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
