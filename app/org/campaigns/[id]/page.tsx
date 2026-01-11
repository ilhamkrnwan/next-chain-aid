"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { getCampaignBlockchainData, ethToIdr, formatEth } from "@/lib/blockchain-helpers"
import { getCampaignDonations, getCampaignWithdrawals } from "@/lib/blockchain"
import { formatAddress, formatTimestamp, weiToEth } from "@/lib/blockchain"
import { 
  Loader2, 
  Edit, 
  TrendingUp, 
  Users, 
  Wallet, 
  Calendar,
  ArrowLeft 
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Campaign } from "@/lib/types"

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [blockchainData, setBlockchainData] = useState<any>(null)
  const [donations, setDonations] = useState<any[]>([])
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCampaignData()
  }, [params.id])

  async function fetchCampaignData() {
    try {
      const supabase = createClient()
      
      // Get campaign
      const { data: campaignData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', params.id)
        .single()

      if (!campaignData) {
        router.push('/org/campaigns')
        return
      }

      setCampaign(campaignData)

      // Fetch blockchain data if contract exists
      if (campaignData.contract_address) {
        const blockchain = await getCampaignBlockchainData(campaignData.contract_address)
        setBlockchainData(blockchain)

        // Fetch donations and withdrawals
        const [donationsData, withdrawalsData] = await Promise.all([
          getCampaignDonations(campaignData.contract_address),
          getCampaignWithdrawals(campaignData.contract_address),
        ])

        setDonations(donationsData)
        setWithdrawals(withdrawalsData)
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Campaign tidak ditemukan</p>
      </div>
    )
  }

  const STATUS_CONFIG = {
    draft: { label: "Draft", className: "bg-gray-100 text-gray-800" },
    pending_approval: { label: "Menunggu Approval", className: "bg-yellow-100 text-yellow-800" },
    active: { label: "Aktif", className: "bg-green-100 text-green-800" },
    ended: { label: "Berakhir", className: "bg-blue-100 text-blue-800" },
    frozen: { label: "Dibekukan", className: "bg-red-100 text-red-800" },
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/org/campaigns">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{campaign.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={STATUS_CONFIG[campaign.status].className}>
                {STATUS_CONFIG[campaign.status].label}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {campaign.category?.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/org/campaigns/${campaign.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          {blockchainData && (
            <Link href={`/org/campaigns/${campaign.id}/updates/create`}>
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                Post Update
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Campaign Image & Description */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full h-64 md:h-80">
              <Image
                src={campaign.image_url || '/placeholder.svg'}
                alt={campaign.title}
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Deskripsi</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {campaign.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {blockchainData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Target</p>
                  <p className="text-2xl font-bold mt-1">{ethToIdr(blockchainData.targetAmount)}</p>
                  <p className="text-xs text-muted-foreground">{formatEth(blockchainData.targetAmount)}</p>
                </div>
                <Wallet className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Terkumpul</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {ethToIdr(blockchainData.collectedAmount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatEth(blockchainData.collectedAmount)}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Donatur</p>
                  <p className="text-2xl font-bold mt-1">{blockchainData.donorCount}</p>
                  <p className="text-xs text-muted-foreground">orang</p>
                </div>
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sisa Hari</p>
                  <p className="text-2xl font-bold mt-1">{blockchainData.daysRemaining}</p>
                  <p className="text-xs text-muted-foreground">hari</p>
                </div>
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="donations" className="w-full">
        <TabsList>
          <TabsTrigger value="donations">Donasi ({donations.length})</TabsTrigger>
          <TabsTrigger value="withdrawals">Penyaluran ({withdrawals.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Donasi</CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada donasi</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Donatur</th>
                        <th className="text-left py-3 px-4 font-semibold">Jumlah</th>
                        <th className="text-left py-3 px-4 font-semibold">Pesan</th>
                        <th className="text-left py-3 px-4 font-semibold">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-xs">
                            {formatAddress(donation.donor)}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-green-600">
                              {ethToIdr(Number(weiToEth(donation.amount)))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Number(weiToEth(donation.amount)).toFixed(4)} ETH
                            </p>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {donation.message || "-"}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {formatTimestamp(donation.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penyaluran</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada penyaluran dana</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Jumlah</th>
                        <th className="text-left py-3 px-4 font-semibold">Deskripsi</th>
                        <th className="text-left py-3 px-4 font-semibold">Penerima</th>
                        <th className="text-left py-3 px-4 font-semibold">Waktu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-orange-600">
                              {ethToIdr(Number(weiToEth(withdrawal.amount)))}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {Number(weiToEth(withdrawal.amount)).toFixed(4)} ETH
                            </p>
                          </td>
                          <td className="py-3 px-4">{withdrawal.description}</td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {formatAddress(withdrawal.recipient)}
                          </td>
                          <td className="py-3 px-4 text-xs text-muted-foreground">
                            {formatTimestamp(withdrawal.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
