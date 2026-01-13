"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Zap, Shield, LinkIcon, ExternalLink, Activity } from "lucide-react"
import { getBlockchainStats, getAllTransactionsFromBlockchain, getAllCampaignsWithBlockchainData } from "@/lib/admin-blockchain"
import { weiToEth, CONTRACTS } from "@/lib/blockchain"
import type { BlockchainTransaction } from "@/lib/types"
import { toast } from "sonner"
import { DebugContractViewer } from "@/components/admin/debug-contract-viewer"
import { CampaignActions } from "@/components/admin/campaign-actions"
import { getCampaigns } from "@/lib/api"

export default function BlockchainPage() {
  const [stats, setStats] = useState<any>(null)
  const [recentTx, setRecentTx] = useState<BlockchainTransaction[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [networkStatus, setNetworkStatus] = useState<"connected" | "disconnected">("disconnected")

  useEffect(() => {
    loadData()
    checkNetwork()
  }, [])

  const checkNetwork = async () => {
    try {
      // Simple network check
      const response = await fetch(CONTRACTS.RPC_URLS[0])
      setNetworkStatus(response.ok ? "connected" : "disconnected")
    } catch {
      setNetworkStatus("disconnected")
    }
  }

  const loadData = async () => {
    try {
      console.log('🔍 Loading blockchain data...')
      console.log('Factory address:', CONTRACTS.CAMPAIGN_FACTORY)
      
      const [blockchainStats, transactions, blockchainCampaigns, dbCampaigns] = await Promise.all([
        getBlockchainStats(),
        getAllTransactionsFromBlockchain(),
        getAllCampaignsWithBlockchainData(),
        getCampaigns({}, { limit: 100 })
      ])
      
      console.log('📊 Stats:', blockchainStats)
      console.log('💰 Transactions:', transactions.length)
      console.log('📋 Blockchain campaigns:', blockchainCampaigns.length)
      console.log('💾 Database campaigns:', dbCampaigns.data.length)
      
      setStats(blockchainStats)
      setRecentTx(transactions.slice(0, 10))
      
      // Merge blockchain and database data
      const mergedCampaigns = dbCampaigns.data.map(dbCampaign => {
        const blockchainData = blockchainCampaigns.find(
          bc => bc?.contractAddress?.toLowerCase() === dbCampaign.contract_address?.toLowerCase()
        )
        return {
          ...dbCampaign,
          blockchain: blockchainData
        }
      })
      
      setCampaigns(mergedCampaigns)
    } catch (error) {
      console.error('❌ Error loading blockchain data:', error)
      toast.error("Gagal memuat data blockchain")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blockchain Explorer</h1>
        <p className="text-muted-foreground mt-1">Verifikasi dan monitor transaksi blockchain ChainAid</p>
      </div>

      {/* Debug Tool (Development Only) */}
      {process.env.NODE_ENV === 'development' && <DebugContractViewer />}

      {/* Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${networkStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Zap className={`w-5 h-5 ${networkStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jaringan</p>
                <p className="font-semibold text-foreground">Ethereum Sepolia</p>
                <Badge className={`mt-1 ${networkStatus === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {networkStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
                <p className="text-2xl font-bold text-foreground">{stats?.totalCampaigns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1 bg-green-100 text-green-800">Aktif & Terverifikasi</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blockchain Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Statistik Blockchain</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Total Transaksi</label>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.totalTransactions?.toLocaleString('id-ID') || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total Donasi</label>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.totalDonations?.toLocaleString('id-ID') || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total Volume (ETH)</label>
              <p className="text-2xl font-bold text-primary mt-1 font-mono">{stats?.totalAmount || '0'} ETH</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total Donors</label>
              <p className="text-2xl font-bold text-primary mt-1">{stats?.totalDonors?.toLocaleString('id-ID') || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Factory Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Factory Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Contract Address</p>
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <code className="text-xs font-mono flex-1 break-all">
                  {CONTRACTS.CAMPAIGN_FACTORY || 'Not configured'}
                </code>
                {CONTRACTS.CAMPAIGN_FACTORY && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 bg-transparent shrink-0"
                    onClick={() => window.open(`https://sepolia.etherscan.io/address/${CONTRACTS.CAMPAIGN_FACTORY}`, '_blank')}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Etherscan
                  </Button>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">RPC Endpoints</p>
              <div className="space-y-2">
                {CONTRACTS.RPC_URLS.map((url, idx) => (
                  <div key={idx} className="p-2 bg-muted/30 rounded text-xs font-mono break-all">
                    {url}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Transaksi Terbaru
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin/transaksi'}
            >
              Lihat Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTx.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Belum ada transaksi blockchain
            </div>
          ) : (
            <div className="space-y-3">
              {recentTx.map((tx, idx) => {
                const isDonation = !!tx.from
                return (
                  <div key={idx} className={`p-4 border rounded-lg ${isDonation ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${isDonation ? 'bg-green-600' : 'bg-red-600'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={isDonation ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {isDonation ? "Donasi" : "Penyaluran"}
                          </Badge>
                          <span className="font-semibold text-sm text-foreground font-mono">
                            {isDonation ? '+' : '-'}{tx.amount} ETH
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(tx.timestamp)} • {isDonation ? 'From' : 'To'}: {(isDonation ? tx.from : tx.to)?.slice(0, 10)}...
                        </p>
                        {tx.txHash && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 gap-1 h-7 text-xs bg-transparent"
                            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.txHash}`, '_blank')}
                          >
                            <ExternalLink className="w-3 h-3" />
                            Lihat di Etherscan
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaigns List with Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Campaigns ({campaigns.length})</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold text-foreground mb-2">
                Belum Ada Campaign
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Campaign akan muncul setelah dibuat via Remix atau aplikasi
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>✅ Factory Address: {CONTRACTS.CAMPAIGN_FACTORY || 'Not configured'}</p>
                <p>✅ Total Campaigns: {stats?.totalCampaigns || 0}</p>
                <p className="text-yellow-600">⚠️ Pastikan factory address sudah benar di .env.local</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {campaign.title}
                        </h3>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        {campaign.is_frozen && (
                          <Badge variant="destructive">Frozen</Badge>
                        )}
                      </div>
                      
                      {campaign.contract_address && (
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Contract:</span>
                            <code className="font-mono text-xs">
                              {campaign.contract_address.slice(0, 10)}...{campaign.contract_address.slice(-8)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => window.open(`https://sepolia.etherscan.io/address/${campaign.contract_address}`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                          
                          {campaign.blockchain?.summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 p-2 bg-muted/50 rounded">
                              <div>
                                <span className="text-muted-foreground">Collected:</span>
                                <p className="font-semibold font-mono">
                                  {weiToEth(campaign.blockchain.summary.collectedAmount)} ETH
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Balance:</span>
                                <p className="font-semibold font-mono">
                                  {weiToEth(campaign.blockchain.summary.balance)} ETH
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Donors:</span>
                                <p className="font-semibold">
                                  {campaign.blockchain.summary.donorCount}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Blockchain:</span>
                                <div className="flex gap-1">
                                  <Badge variant={campaign.blockchain.summary.isActive ? "default" : "secondary"} className="text-xs">
                                    {campaign.blockchain.summary.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                  {campaign.blockchain.summary.isFrozen && (
                                    <Badge variant="destructive" className="text-xs">Frozen</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!campaign.contract_address && (
                        <p className="text-xs text-yellow-600">
                          ⚠️ No contract address - Campaign not deployed to blockchain
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0">
                      <CampaignActions
                        campaign={campaign}
                        onSuccess={loadData}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Functions Info */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs text-foreground">function donate(string memory message) payable public</p>
              <p className="text-muted-foreground text-xs mt-1">Melakukan donasi untuk campaign dengan pesan opsional</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs text-foreground">function withdraw(uint256 amount, string memory description) public</p>
              <p className="text-muted-foreground text-xs mt-1">Menyalurkan dana kepada penerima (hanya organization owner)</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs text-foreground">function getSummary() view public returns (...)</p>
              <p className="text-muted-foreground text-xs mt-1">Mendapatkan ringkasan campaign termasuk balance dan status</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="font-mono text-xs text-foreground">function getAllDonations() view public returns (Donation[])</p>
              <p className="text-muted-foreground text-xs mt-1">Mendapatkan semua riwayat donasi untuk transparansi penuh</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
