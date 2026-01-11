"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  getCampaignById, 
  approveCampaign, 
  rejectCampaign, 
  freezeCampaign, 
  unfreezeCampaign,
  getCurrentProfile
} from "@/lib/api"
import { 
  getCampaignSummary, 
  getCampaignDonations, 
  getCampaignWithdrawals,
  weiToEth,
  formatAddress
} from "@/lib/blockchain"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Users, 
  Building2, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Ban,
  CheckCircle,
  XCircle,
  Snowflake,
  Wallet
} from "lucide-react"
import { toast } from "sonner"
import type { Campaign, Profile, Donation, Withdrawal, BlockchainCampaignData } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react" 

export default function CampaignReviewPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [blockchainData, setBlockchainData] = useState<BlockchainCampaignData | null>(null)
  const [donations, setDonations] = useState<Donation[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAdmin, setCurrentAdmin] = useState<Profile | null>(null)
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false)
  const [reason, setReason] = useState("")
  const [dialogType, setDialogType] = useState<"reject" | "freeze" | null>(null)

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  const loadData = async () => {
    try {
      const [campaignData, adminProfile] = await Promise.all([
        getCampaignById(id),
        getCurrentProfile()
      ])
      
      setCampaign(campaignData)
      setCurrentAdmin(adminProfile)

      // Fetch blockchain data if contract exists
      if (campaignData.contract_address) {
        try {
          const [summary, donationsData, withdrawalsData] = await Promise.all([
            getCampaignSummary(campaignData.contract_address),
            getCampaignDonations(campaignData.contract_address),
            getCampaignWithdrawals(campaignData.contract_address)
          ])
          
          setBlockchainData(summary)
          setDonations(donationsData)
          setWithdrawals(withdrawalsData)
        } catch (error) {
          console.error('Failed to fetch blockchain data:', error)
          // Don't block UI if blockchain fetch fails
        }
      }
    } catch (error) {
      console.error('Error loading campaign:', error)
      toast.error("Gagal memuat detail campaign")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async () => {
    if (!campaign || !currentAdmin || !dialogType) return
    if (!reason.trim()) {
      toast.error("Alasan harus diisi")
      return
    }

    setActionLoading(true)
    try {
      if (dialogType === 'reject') {
        await rejectCampaign(campaign.id, currentAdmin.id, reason)
        toast.success("Campaign berhasil ditolak")
      } else if (dialogType === 'freeze') {
        await freezeCampaign(campaign.id, currentAdmin.id, reason)
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

  const handleApprove = async () => {
    if (!campaign || !currentAdmin) return
    
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

  const handleUnfreeze = async () => {
    if (!campaign || !currentAdmin) return

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
    setDialogType(null)
    setReason("")
  }

  const formatDate = (dateString: string | number) => {
    if (!dateString) return "-"
    const date = typeof dateString === 'number' ? new Date(dateString * 1000) : new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <Skeleton className="h-40 w-full" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-60 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold">Campaign tidak ditemukan</h1>
        <Button className="mt-4" onClick={() => router.back()}>Kembali</Button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Review Campaign</h1>
          <p className="text-muted-foreground">ID: {campaign.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <Card>
            <div className="relative h-[300px] w-full">
              <Image
                src={campaign.image_url || "/placeholder.svg"}
                alt={campaign.title}
                fill
                className="object-cover rounded-t-lg"
              />
              <div className="absolute top-4 left-4">
                <Badge className={
                  campaign.status === 'active' ? 'bg-green-500 hover:bg-green-600' :
                  campaign.status === 'pending_approval' ? 'bg-yellow-500 hover:bg-yellow-600' :
                  campaign.status === 'frozen' ? 'bg-orange-500 hover:bg-orange-600' :
                  'bg-gray-500'
                }>
                  {campaign.status === 'pending_approval' ? 'Perlu Review' :
                   campaign.status === 'frozen' ? 'Frozen' :
                   campaign.status === 'active' ? 'Aktif' : campaign.status}
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{campaign.title}</h2>
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    <span>{campaign.organization?.name}</span>
                    <Badge variant="outline" className="ml-2 capitalize">{campaign.category}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-muted-foreground whitespace-pre-line">{campaign.description}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Target Donasi</span>
                  <p className="font-semibold">{formatCurrency(campaign.target_amount)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Durasi</span>
                  <p className="font-semibold">
                    {campaign.end_date ? formatDate(campaign.end_date) : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Dibuat Pada</span>
                  <p className="font-semibold">{formatDate(campaign.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground">Pembuat</span>
                  <p className="font-semibold">{campaign.creator?.full_name || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blockchain Data Tabs */}
          {campaign.contract_address && (
            <Tabs defaultValue="overview">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">Blockchain Overview</TabsTrigger>
                <TabsTrigger value="donations" className="flex-1">Donasi ({donations.length})</TabsTrigger>
                <TabsTrigger value="withdrawals" className="flex-1">Penyaluran ({withdrawals.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-green-600" />
                      Smart Contract Info
                    </CardTitle>
                    <CardDescription>
                      Data langsung dari blockchain Sepolia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                      <div>
                        <span className="text-xs text-muted-foreground">Contract Address</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-muted p-1 rounded">
                            {formatAddress(campaign.contract_address)}
                          </code>
                          <a 
                            href={`https://sepolia.etherscan.io/address/${campaign.contract_address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Status</span>
                        <div className="mt-1">
                          {blockchainData?.isActive && !blockchainData?.isFrozen ? (
                            <Badge className="bg-green-600">Active</Badge>
                          ) : blockchainData?.isFrozen ? (
                            <Badge variant="destructive">Frozen</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Terkumpul (ETH)</span>
                        <p className="font-mono font-semibold text-lg">
                          {blockchainData ? weiToEth(blockchainData.collectedAmount) : '0'} ETH
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Saldo Saat Ini (ETH)</span>
                        <p className="font-mono font-semibold text-lg text-green-600">
                          {blockchainData ? weiToEth(blockchainData.balance) : '0'} ETH
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="donations">
                <Card>
                  <CardHeader>
                    <CardTitle>Riwayat Donasi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {donations.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Belum ada donasi</p>
                    ) : (
                      <div className="space-y-4">
                        {donations.map((donation, i) => (
                          <div key={i} className="flex justify-between items-start border-b pb-4 last:border-0">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{formatAddress(donation.donor)}</span>
                                <span className="text-xs text-muted-foreground">• {formatDate(donation.timestamp)}</span>
                              </div>
                              {donation.message && (
                                <p className="text-sm mt-1 text-muted-foreground">"{donation.message}"</p>
                              )}
                            </div>
                            <span className="font-semibold text-green-600">
                              +{weiToEth(donation.amount)} ETH
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdrawals">
                <Card>
                  <CardHeader>
                    <CardTitle>Riwayat Penyaluran Dana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {withdrawals.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Belum ada penyaluran dana</p>
                    ) : (
                      <div className="space-y-4">
                        {withdrawals.map((withdrawal, i) => (
                          <div key={i} className="flex justify-between items-start border-b pb-4 last:border-0">
                            <div>
                              <p className="font-medium">{withdrawal.description}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">Ke: {formatAddress(withdrawal.recipient)}</span>
                                <span className="text-xs text-muted-foreground">• {formatDate(withdrawal.timestamp)}</span>
                              </div>
                            </div>
                            <span className="font-semibold text-red-600">
                              -{weiToEth(withdrawal.amount)} ETH
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Aksi Admin</CardTitle>
              <CardDescription>Tindakan yang dapat dilakukan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Approval Actions */}
              {campaign.status === 'pending_approval' && !campaign.is_frozen && (
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700" 
                    onClick={handleApprove}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Setujui Campaign
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700"
                    onClick={() => setDialogType('reject')}
                    disabled={actionLoading}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Tolak Campaign
                  </Button>
                </div>
              )}

              {/* Freeze Actions */}
              {campaign.status === 'active' && !campaign.is_frozen && (
                <div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 mb-4">
                    <p className="text-xs text-orange-800 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      Pembekuan akan menghentikan sementara semua donasi yang masuk ke smart contract.
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    onClick={() => setDialogType('freeze')}
                    disabled={actionLoading}
                  >
                    <Snowflake className="w-4 h-4 mr-2" />
                    Bekukan (Freeze)
                  </Button>
                </div>
              )}

              {/* Unfreeze Action */}
              {campaign.is_frozen && (
                <div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                    <p className="text-xs text-blue-800">
                      Campaign ini sedang dibekukan. Unfreeze akan mengaktifkan kembali donasi.
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleUnfreeze}
                    disabled={actionLoading}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Buka Pembekuan
                  </Button>
                </div>
              )}

              {/* Action History Info */}
              {campaign.status === 'rejected' && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 text-sm mb-1">Ditolak</h4>
                  <p className="text-sm text-red-800">{campaign.rejection_reason}</p>
                </div>
              )}

              {campaign.is_frozen && (
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mt-2">
                  <h4 className="font-semibold text-orange-900 text-sm mb-1">Status: Frozen</h4>
                  <p className="text-sm text-orange-800">{campaign.freeze_reason}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Frozen at: {formatDate(campaign.frozen_at || '')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Informasi Organisasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={campaign.organization?.image_url || "/placeholder.svg"}
                    alt={campaign.organization?.name || "Org"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">{campaign.organization?.name}</p>
                  <p className="text-xs text-muted-foreground">{campaign.organization?.profile?.email}</p>
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={campaign.organization?.is_verified ? "default" : "secondary"}>
                    {campaign.organization?.is_verified ? "Terverifikasi" : "Belum Verifikasi"}
                  </Badge>
                </div>
                {campaign.organization?.website && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Website</span>
                    <a href={campaign.organization.website} target="_blank" className="text-primary hover:underline flex items-center gap-1">
                      Kunjungi <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => router.push(`/admin/organisasi?id=${campaign.organization?.id}`)}
              >
                Lihat Detail Organisasi
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={!!dialogType} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'reject' ? 'Tolak Campaign' : 'Bekukan Campaign'}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'reject' 
                ? 'Berikan alasan penolakan untuk campaign ini.' 
                : 'Berikan alasan pembekuan campaign ini.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Alasan *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tuliskan alasan..."
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
                ) : (
                  dialogType === 'reject' ? <XCircle className="w-4 h-4 mr-2" /> : <Snowflake className="w-4 h-4 mr-2" />
                )}
                Konfirmasi
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
