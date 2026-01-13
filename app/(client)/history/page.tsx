"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Heart, 
  Calendar, 
  TrendingUp, 
  Loader2,
  ArrowUpRight,
  Wallet
} from "lucide-react"
import Link from "next/link"

interface DonationHistory {
  id: string
  campaign_id: string
  campaign_title: string
  amount: number
  message: string
  timestamp: number
  tx_hash: string
  campaign?: {
    id: string
    title: string
    image_url: string
    organization?: {
      name: string
    }
  }
}

export default function HistoryPage() {
  const router = useRouter()
  const [donations, setDonations] = useState<DonationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    campaignsSupported: 0,
  })

  useEffect(() => {
    loadDonationHistory()
  }, [])

  const loadDonationHistory = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // TODO: Fetch donation history from blockchain
      // For now, using mock data
      const mockDonations: DonationHistory[] = [
        {
          id: "1",
          campaign_id: "camp-1",
          campaign_title: "Bantu Pendidikan Anak Kurang Mampu",
          amount: 0.05,
          message: "Semoga bermanfaat untuk pendidikan anak-anak",
          timestamp: Date.now() - 86400000 * 2,
          tx_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          campaign: {
            id: "camp-1",
            title: "Bantu Pendidikan Anak Kurang Mampu",
            image_url: "/diverse-students-learning.png",
            organization: {
              name: "Yayasan Pendidikan Indonesia"
            }
          }
        },
        {
          id: "2",
          campaign_id: "camp-2",
          campaign_title: "Bantuan Korban Bencana Alam",
          amount: 0.1,
          message: "Semoga cepat pulih",
          timestamp: Date.now() - 86400000 * 5,
          tx_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          campaign: {
            id: "camp-2",
            title: "Bantuan Korban Bencana Alam",
            image_url: "/diverse-students-learning.png",
            organization: {
              name: "Gerakan Peduli Bencana"
            }
          }
        },
        {
          id: "3",
          campaign_id: "camp-3",
          campaign_title: "Renovasi Rumah Sakit Daerah",
          amount: 0.03,
          message: "",
          timestamp: Date.now() - 86400000 * 10,
          tx_hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
          campaign: {
            id: "camp-3",
            title: "Renovasi Rumah Sakit Daerah",
            image_url: "/diverse-students-learning.png",
            organization: {
              name: "Klinik Kesehatan Masyarakat"
            }
          }
        }
      ]

      setDonations(mockDonations)

      // Calculate stats
      const totalAmount = mockDonations.reduce((sum, d) => sum + d.amount, 0)
      const uniqueCampaigns = new Set(mockDonations.map(d => d.campaign_id)).size

      setStats({
        totalDonations: mockDonations.length,
        totalAmount,
        campaignsSupported: uniqueCampaigns,
      })
    } catch (error) {
      console.error('Error loading donation history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Riwayat Donasi
          </h1>
          <p className="text-slate-600">Lihat semua kontribusi Anda untuk berbagai campaign</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Donasi</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent mt-1">
                    {stats.totalDonations}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Heart className="w-7 h-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Kontribusi</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-green-600 to-green-700 bg-clip-text text-transparent mt-1">
                    {stats.totalAmount.toFixed(4)} ETH
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Campaign Didukung</p>
                  <p className="text-3xl font-bold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent mt-1">
                    {stats.campaignsSupported}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
                  <Calendar className="w-7 h-7 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Donation History */}
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {donations.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                  <Heart className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Donasi</h3>
                <p className="text-slate-600 mb-6">
                  Anda belum melakukan donasi. Mulai berdonasi untuk membantu campaign yang membutuhkan!
                </p>
                <Link
                  href="/campaigns"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                >
                  Lihat Campaign
                  <ArrowUpRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/50 transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* Campaign Image */}
                      <Avatar className="w-16 h-16 rounded-lg">
                        <AvatarImage 
                          src={donation.campaign?.image_url || "/placeholder.svg"} 
                          alt={donation.campaign_title}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-blue-100 text-blue-600">
                          <Heart className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>

                      {/* Donation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">
                              {donation.campaign_title}
                            </h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {donation.campaign?.organization?.name}
                            </p>
                            {donation.message && (
                              <p className="text-sm text-slate-500 mt-2 italic">
                                "{donation.message}"
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-lg font-bold text-green-600">
                              {donation.amount} ETH
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {formatDate(donation.timestamp)}
                            </p>
                          </div>
                        </div>

                        {/* Transaction Hash */}
                        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                          <Wallet className="w-3 h-3" />
                          <span className="font-mono">{formatAddress(donation.tx_hash)}</span>
                          <a
                            href={`https://sepolia.etherscan.io/tx/${donation.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                          >
                            Lihat di Explorer
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-medium">💡 Informasi</p>
          <p className="mt-1 text-blue-800">
            Semua transaksi donasi tercatat secara permanen di blockchain dan dapat diverifikasi melalui Etherscan.
            Data ini bersifat transparan dan tidak dapat diubah.
          </p>
        </div>
      </div>
    </div>
  )
}
