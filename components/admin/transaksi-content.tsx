"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, ExternalLink } from "lucide-react"
import { mockTransactions } from "@/lib/mock-transactions"

const statusConfig = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
  failed: { label: "Failed", className: "bg-red-100 text-red-800" },
}

const typeConfig = {
  donation: { label: "Donasi", className: "bg-blue-50 text-blue-700" },
  distribution: { label: "Penyaluran", className: "bg-purple-50 text-purple-700" },
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount)
}

export function TransaksiContent() {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<"all" | "donation" | "distribution">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed" | "failed">("all")

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      tx.campaignTitle.toLowerCase().includes(search.toLowerCase()) ||
      tx.organizationName.toLowerCase().includes(search.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(search.toLowerCase())
    const matchesType = filterType === "all" || tx.type === filterType
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen Transaksi</h1>
        <p className="text-muted-foreground mt-1">Kelola semua transaksi donasi dan penyaluran dana</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Riwayat Transaksi</CardTitle>
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Cari campaign, organisasi, atau TX hash..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">Semua Tipe</option>
                <option value="donation">Donasi</option>
                <option value="distribution">Penyaluran</option>
              </select>
              <select
                className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Semua Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-sm">Tanggal</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Tipe</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Campaign</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Organisasi</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Jumlah</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm">TX Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-foreground">{tx.date}</td>
                    <td className="py-3 px-4">
                      <Badge className={typeConfig[tx.type].className}>{typeConfig[tx.type].label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground max-w-xs truncate">{tx.campaignTitle}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{tx.organizationName}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-foreground">{formatRupiah(tx.amount)}</td>
                    <td className="py-3 px-4">
                      <Badge className={statusConfig[tx.status].className}>{statusConfig[tx.status].label}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {tx.status === "confirmed" ? (
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline font-mono text-xs"
                        >
                          {tx.txHash.slice(0, 10)}...
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">Pending...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Tidak ada transaksi yang sesuai</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
