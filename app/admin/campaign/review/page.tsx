"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Check, 
  X, 
  Eye, 
  Loader2,
  Calendar,
  Target,
  Building2,
  ExternalLink
} from "lucide-react"
import { toast } from "sonner"

interface PendingCampaign {
  id: string
  title: string
  description: string
  category: string
  image_url: string
  target_amount: number
  contract_address: string
  created_at: string
  start_date: string
  end_date: string
  organization: {
    id: string
    name: string
    image_url?: string
  }
  creator: {
    full_name: string
    email: string
  }
}

export default function CampaignReviewPage() {
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<PendingCampaign | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  useEffect(() => {
    loadPendingCampaigns()
  }, [])

  const loadPendingCampaigns = async () => {
    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          organization:organizations(
            id,
            name,
            image_url
          ),
          creator:profiles(
            full_name,
            email
          )
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      if (error) throw error

      setCampaigns(data || [])
    } catch (error) {
      console.error('Error loading campaigns:', error)
      toast.error("Gagal memuat campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (campaign: PendingCampaign) => {
    setActionLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'active',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', campaign.id)

      if (error) throw error

      toast.success(`Campaign "${campaign.title}" berhasil disetujui!`)
      loadPendingCampaigns()
      setSelectedCampaign(null)
    } catch (error: any) {
      console.error('Error approving campaign:', error)
      toast.error(error.message || "Gagal menyetujui campaign")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedCampaign) return
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan harus diisi")
      return
    }

    setActionLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from('campaigns')
        .update({
          status: 'frozen',
          rejection_reason: rejectionReason,
          approved_by: user.id,
        })
        .eq('id', selectedCampaign.id)

      if (error) throw error

      toast.success(`Campaign "${selectedCampaign.title}" ditolak`)
      loadPendingCampaigns()
      setSelectedCampaign(null)
      setShowRejectDialog(false)
      setRejectionReason("")
    } catch (error: any) {
      console.error('Error rejecting campaign:', error)
      toast.error(error.message || "Gagal menolak campaign")
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Review Campaign</h1>
        <p className="text-muted-foreground mt-1">
          Tinjau dan setujui campaign yang menunggu approval
        </p>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
              <p className="text-sm text-muted-foreground">Campaign Menunggu Review</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign List */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Tidak Ada Campaign Pending
            </h3>
            <p className="text-slate-600">
              Semua campaign sudah direview
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:border-blue-300 transition">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  {/* Campaign Image */}
                  <Avatar className="w-24 h-24 rounded-lg">
                    <AvatarImage 
                      src={campaign.image_url || "/placeholder.svg"} 
                      alt={campaign.title}
                      className="object-cover"
                    />
                    <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                      <Building2 className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>

                  {/* Campaign Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground truncate">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {campaign.organization.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            {formatCurrency(campaign.target_amount)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(campaign.created_at)}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {campaign.description}
                    </p>

                    {/* Contract Address */}
                    {campaign.contract_address && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                          {campaign.contract_address.slice(0, 10)}...{campaign.contract_address.slice(-8)}
                        </span>
                        <a
                          href={`https://sepolia.etherscan.io/address/${campaign.contract_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                        >
                          View on Etherscan
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Detail
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApprove(campaign)}
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
                          setSelectedCampaign(campaign)
                          setShowRejectDialog(true)
                        }}
                        disabled={actionLoading}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Tolak
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedCampaign && !showRejectDialog} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Campaign</DialogTitle>
            <DialogDescription>
              Review informasi lengkap campaign sebelum approval
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-4">
              {/* Image */}
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={selectedCampaign.image_url || "/placeholder.svg"}
                  alt={selectedCampaign.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <Label>Judul Campaign</Label>
                  <p className="text-sm font-medium mt-1">{selectedCampaign.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Organisasi</Label>
                    <p className="text-sm font-medium mt-1">{selectedCampaign.organization.name}</p>
                  </div>
                  <div>
                    <Label>Kategori</Label>
                    <p className="text-sm font-medium mt-1 capitalize">{selectedCampaign.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Target Donasi</Label>
                    <p className="text-sm font-medium mt-1">{formatCurrency(selectedCampaign.target_amount)}</p>
                  </div>
                  <div>
                    <Label>Tanggal Dibuat</Label>
                    <p className="text-sm font-medium mt-1">{formatDate(selectedCampaign.created_at)}</p>
                  </div>
                </div>

                <div>
                  <Label>Deskripsi</Label>
                  <p className="text-sm mt-1 text-muted-foreground">{selectedCampaign.description}</p>
                </div>

                <div>
                  <Label>Contract Address</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded font-mono">
                      {selectedCampaign.contract_address}
                    </code>
                    <a
                      href={`https://sepolia.etherscan.io/address/${selectedCampaign.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-xs inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Etherscan
                    </a>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedCampaign)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Setujui Campaign
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={actionLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak Campaign
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tolak Campaign</DialogTitle>
            <DialogDescription>
              Berikan alasan penolakan untuk campaign ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan Penolakan *</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Jelaskan alasan penolakan campaign..."
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
                Tolak Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
