"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { getCampaignDonations, getCampaignWithdrawals } from "@/lib/blockchain"
import { formatAddress, formatTimestamp, weiToEth } from "@/lib/blockchain"
import { ethToIdr } from "@/lib/blockchain-helpers"
import { Loader2, Search, ArrowDownCircle, ArrowUpCircle } from "lucide-react"

interface Transaction {
  type: 'donation' | 'withdrawal'
  campaignId: string
  campaignTitle: string
  amount: bigint
  from?: string
  to?: string
  message?: string
  description?: string
  timestamp: number
}

export function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [campaignFilter, setCampaignFilter] = useState<string>("all")
  const [campaigns, setCampaigns] = useState<any[]>([])

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchQuery, typeFilter, campaignFilter])

  async function fetchTransactions() {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get all campaigns with contract addresses
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('id, title, contract_address')
        .eq('creator_id', user.id)
        .not('contract_address', 'is', null)

      if (!campaignsData || campaignsData.length === 0) {
        setTransactions([])
        setLoading(false)
        return
      }

      setCampaigns(campaignsData)

      // Fetch all transactions from all campaigns
      const allTransactionsPromises = campaignsData.map(async (campaign) => {
        try {
          const [donations, withdrawals] = await Promise.all([
            getCampaignDonations(campaign.contract_address!),
            getCampaignWithdrawals(campaign.contract_address!),
          ])

          const donationTransactions: Transaction[] = donations.map(d => ({
            type: 'donation' as const,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: d.amount,
            from: d.donor,
            message: d.message,
            timestamp: d.timestamp,
          }))

          const withdrawalTransactions: Transaction[] = withdrawals.map(w => ({
            type: 'withdrawal' as const,
            campaignId: campaign.id,
            campaignTitle: campaign.title,
            amount: w.amount,
            to: w.recipient,
            description: w.description,
            timestamp: w.timestamp,
          }))

          return [...donationTransactions, ...withdrawalTransactions]
        } catch (error) {
          console.error(`Error fetching transactions for campaign ${campaign.id}:`, error)
          return []
        }
      })

      const allTransactionsArrays = await Promise.all(allTransactionsPromises)
      const allTransactions = allTransactionsArrays.flat()

      // Sort by timestamp (newest first)
      const sortedTransactions = allTransactions.sort((a, b) => b.timestamp - a.timestamp)

      setTransactions(sortedTransactions)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  function filterTransactions() {
    let filtered = transactions

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter)
    }

    // Filter by campaign
    if (campaignFilter !== "all") {
      filtered = filtered.filter(t => t.campaignId === campaignFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.campaignTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.to?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Transaksi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="donation">Donasi</SelectItem>
              <SelectItem value="withdrawal">Penyaluran</SelectItem>
            </SelectContent>
          </Select>

          {/* Campaign Filter */}
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Campaign</SelectItem>
              {campaigns.map(campaign => (
                <SelectItem key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || typeFilter !== "all" || campaignFilter !== "all"
                ? "Tidak ada transaksi yang sesuai filter"
                : "Belum ada transaksi"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold">Tipe</th>
                  <th className="text-left py-3 px-4 font-semibold">Campaign</th>
                  <th className="text-left py-3 px-4 font-semibold">Jumlah</th>
                  <th className="text-left py-3 px-4 font-semibold">Dari/Ke</th>
                  <th className="text-left py-3 px-4 font-semibold">Detail</th>
                  <th className="text-left py-3 px-4 font-semibold">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction, index) => (
                  <tr key={index} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      {transaction.type === 'donation' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <ArrowDownCircle className="w-3 h-3 mr-1" />
                          Donasi
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-800">
                          <ArrowUpCircle className="w-3 h-3 mr-1" />
                          Penyaluran
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium line-clamp-1">{transaction.campaignTitle}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className={`font-semibold ${transaction.type === 'donation' ? 'text-green-600' : 'text-orange-600'}`}>
                        {ethToIdr(Number(weiToEth(transaction.amount)))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(weiToEth(transaction.amount)).toFixed(4)} ETH
                      </p>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">
                      {transaction.type === 'donation' 
                        ? formatAddress(transaction.from!)
                        : formatAddress(transaction.to!)
                      }
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {transaction.message || transaction.description || "-"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {formatTimestamp(transaction.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary */}
        {filteredTransactions.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredTransactions.length} dari {transactions.length} transaksi
          </div>
        )}
      </CardContent>
    </Card>
  )
}
