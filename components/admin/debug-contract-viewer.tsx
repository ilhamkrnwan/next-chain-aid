'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCampaignSummary, getCampaignDonations, getCampaignWithdrawals, weiToEth } from '@/lib/blockchain'
import { ExternalLink } from 'lucide-react'

export function DebugContractViewer() {
  const [address, setAddress] = useState('')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchData = async () => {
    if (!address || !address.startsWith('0x')) {
      setError('Please enter a valid contract address')
      return
    }

    setLoading(true)
    setError('')
    setData(null)
    
    try {
      console.log('🔍 Fetching data for:', address)
      
      const [summary, donations, withdrawals] = await Promise.all([
        getCampaignSummary(address),
        getCampaignDonations(address),
        getCampaignWithdrawals(address)
      ])
      
      setData({ summary, donations, withdrawals })
      console.log('✅ Data fetched successfully:', { summary, donations, withdrawals })
    } catch (err: any) {
      console.error('❌ Error fetching data:', err)
      setError(err.message || 'Failed to fetch contract data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-yellow-500 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="text-yellow-700 flex items-center gap-2">
          🔧 Debug: Manual Contract Viewer
          <Badge variant="outline" className="text-xs">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Contract address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="font-mono text-xs"
          />
          <Button onClick={fetchData} disabled={loading} size="sm">
            {loading ? 'Loading...' : 'Fetch'}
          </Button>
          {address && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://sepolia.etherscan.io/address/${address}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            ❌ {error}
          </div>
        )}
        
        {data && (
          <div className="space-y-3">
            {/* Summary */}
            <div className="p-3 bg-white border rounded">
              <p className="font-semibold text-sm mb-2">📊 Campaign Summary</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Title:</span>
                  <p className="font-medium">{data.summary.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <p className="font-medium">{data.summary.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <p className="font-medium font-mono">{weiToEth(data.summary.targetAmount)} ETH</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Collected:</span>
                  <p className="font-medium font-mono">{weiToEth(data.summary.collectedAmount)} ETH</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Balance:</span>
                  <p className="font-medium font-mono">{weiToEth(data.summary.balance)} ETH</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="flex gap-1">
                    <Badge variant={data.summary.isActive ? "default" : "secondary"} className="text-xs">
                      {data.summary.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {data.summary.isFrozen && (
                      <Badge variant="destructive" className="text-xs">Frozen</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Donors:</span>
                  <p className="font-medium">{data.summary.donorCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Donations:</span>
                  <p className="font-medium">{data.summary.donationCount}</p>
                </div>
              </div>
            </div>

            {/* Donations */}
            <div className="p-3 bg-white border rounded">
              <p className="font-semibold text-sm mb-2">
                💰 Donations ({data.donations.length})
              </p>
              {data.donations.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-auto">
                  {data.donations.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="text-xs p-2 bg-green-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-mono">{d.donor.slice(0, 10)}...</span>
                        <span className="font-semibold">{weiToEth(d.amount)} ETH</span>
                      </div>
                      {d.message && <p className="text-muted-foreground mt-1">{d.message}</p>}
                    </div>
                  ))}
                  {data.donations.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {data.donations.length - 5} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No donations yet</p>
              )}
            </div>

            {/* Withdrawals */}
            <div className="p-3 bg-white border rounded">
              <p className="font-semibold text-sm mb-2">
                📤 Withdrawals ({data.withdrawals.length})
              </p>
              {data.withdrawals.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-auto">
                  {data.withdrawals.slice(0, 5).map((w: any, i: number) => (
                    <div key={i} className="text-xs p-2 bg-red-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-semibold">{weiToEth(w.amount)} ETH</span>
                        <span className={w.completed ? 'text-green-600' : 'text-yellow-600'}>
                          {w.completed ? '✅' : '⏳'}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-1">{w.description}</p>
                    </div>
                  ))}
                  {data.withdrawals.length > 5 && (
                    <p className="text-xs text-muted-foreground">
                      ... and {data.withdrawals.length - 5} more
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No withdrawals yet</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
