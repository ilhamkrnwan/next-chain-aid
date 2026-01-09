"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Zap, Shield, LinkIcon, ExternalLink } from "lucide-react"

export default function BlockchainPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Blockchain Explorer</h1>
        <p className="text-muted-foreground mt-1">Verifikasi dan monitor transaksi blockchain ChainAid</p>
      </div>

      {/* Network Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jaringan</p>
                <p className="font-semibold text-foreground">Ethereum Sepolia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Contract Address</p>
              <p className="font-mono text-xs text-foreground mt-1 break-all">
                0x7c8f9e3d4c2b1a5f9e3d4c2b1a5f7c8f9e3d4c2b
              </p>
              <Button variant="outline" size="sm" className="mt-2 gap-1 w-full bg-transparent">
                <ExternalLink className="w-3 h-3" />
                Lihat di Etherscan
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="mt-1 bg-green-100 text-green-800">Aktif & Terverifikasi</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Smart Contract</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-foreground">Total Transaksi Verified</label>
              <p className="text-2xl font-bold text-primary mt-1">4,284</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Total Volume</label>
              <p className="text-2xl font-bold text-primary mt-1">Rp 1.24 Miliar</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Gas Used (Total)</label>
              <p className="text-2xl font-bold text-primary mt-1">8,423,942</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Contract Balance</label>
              <p className="text-2xl font-bold text-primary mt-1">0.234 ETH</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            Verifikasi Transaksi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">
                    TX: 0x7c8f9e3d4c2b1a5f9e3d4c2b1a5f7c8f9e3d4c2b
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Donasi Rp 1.500.000 • Block #19304567 • 5 Confirmations
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 gap-1 bg-transparent">
                    <ExternalLink className="w-3 h-3" />
                    Lihat Detail
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-foreground">TX: 0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Donasi Rp 2.000.000 • Pending... • 0 Confirmations
                  </p>
                  <Button variant="outline" size="sm" className="mt-2 gap-1 bg-transparent">
                    <ExternalLink className="w-3 h-3" />
                    Lihat Detail
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Functions */}
      <Card>
        <CardHeader>
          <CardTitle>Smart Contract Functions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs">
              <p className="text-foreground">function donate(uint256 campaignId) payable public</p>
              <p className="text-muted-foreground mt-1">Melakukan donasi untuk campaign tertentu</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs">
              <p className="text-foreground">
                function distributeFunds(uint256 campaignId, uint256 amount) onlyAdmin public
              </p>
              <p className="text-muted-foreground mt-1">Menyalurkan dana kepada organisasi penerima</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg font-mono text-xs">
              <p className="text-foreground">function verifyTransaction(bytes32 txHash) view public returns (bool)</p>
              <p className="text-muted-foreground mt-1">Memverifikasi status transaksi di blockchain</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
