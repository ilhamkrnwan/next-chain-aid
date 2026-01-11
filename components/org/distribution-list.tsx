"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { createClient } from "@/lib/supabase/client"
import { getCampaignBlockchainData, ethToIdr, formatEth } from "@/lib/blockchain-helpers"
import { withdrawFromCampaign } from "@/lib/blockchain"
import { Loader2, Wallet, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import type { Campaign } from "@/lib/types"

interface CampaignWithBalance extends Campaign {
  balance?: number
}

export function DistributionList() {
  const [campaigns, setCampaigns] = useState<CampaignWithBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWithBalance | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "",
    description: "",
  })

  useEffect(() => {
    fetchCampaigns()
  }, [])

  async function fetchCampaigns() {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get campaigns with contract addresses
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('creator_id', user.id)
        .eq('status', 'active')
        .not('contract_address', 'is', null)

      if (!campaignsData || campaignsData.length === 0) {
        setCampaigns([])
        setLoading(false)
        return
      }

      // Fetch balance for each campaign
      const campaignsWithBalance = await Promise.all(
        campaignsData.map(async (campaign) => {
          const blockchainData = await getCampaignBlockchainData(campaign.contract_address!)
          return {
            ...campaign,
            balance: blockchainData?.balance || 0,
          }
        })
      )

      // Filter campaigns with balance > 0
      const campaignsWithFunds = campaignsWithBalance.filter(c => c.balance && c.balance > 0)
      
      setCampaigns(campaignsWithFunds)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleWithdraw() {
    if (!selectedCampaign) return

    const amount = parseFloat(withdrawForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Jumlah tidak valid")
      return
    }

    if (amount > (selectedCampaign.balance || 0)) {
      toast.error("Jumlah melebihi saldo tersedia")
      return
    }

    if (!withdrawForm.description.trim()) {
      toast.error("Deskripsi harus diisi")
      return
    }

    try {
      setWithdrawing(true)
      
      // Withdraw from blockchain
      await withdrawFromCampaign(
        selectedCampaign.contract_address!,
        withdrawForm.amount,
        withdrawForm.description
      )

      toast.success("Dana berhasil disalurkan!")
      
      // Reset form and close dialog
      setWithdrawForm({ amount: "", description: "" })
      setSelectedCampaign(null)
      
      // Refresh campaigns
      fetchCampaigns()
    } catch (error: any) {
      console.error('Error withdrawing:', error)
      toast.error(error.message || "Gagal menyalurkan dana")
    } finally {
      setWithdrawing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Tidak ada campaign dengan saldo tersedia untuk disalurkan
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
                <p className="text-2xl font-bold text-green-600">
                  {ethToIdr(campaign.balance || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatEth(campaign.balance || 0)}
                </p>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  setSelectedCampaign(campaign)
                  setWithdrawForm({ amount: "", description: "" })
                }}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Salurkan Dana
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salurkan Dana</DialogTitle>
            <DialogDescription>
              {selectedCampaign?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Saldo Tersedia</p>
              <p className="text-xl font-bold text-green-600">
                {ethToIdr(selectedCampaign?.balance || 0)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatEth(selectedCampaign?.balance || 0)}
              </p>
            </div>

            <div>
              <Label htmlFor="amount">Jumlah (ETH) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.0001"
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.1"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maksimal: {selectedCampaign?.balance?.toFixed(4)} ETH
              </p>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi Penyaluran *</Label>
              <Textarea
                id="description"
                value={withdrawForm.description}
                onChange={(e) => setWithdrawForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Contoh: Pembayaran renovasi sekolah tahap 1"
                rows={3}
                className="mt-2"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedCampaign(null)}
                disabled={withdrawing}
              >
                Batal
              </Button>
              <Button
                className="flex-1"
                onClick={handleWithdraw}
                disabled={withdrawing}
              >
                {withdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Salurkan Dana"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
