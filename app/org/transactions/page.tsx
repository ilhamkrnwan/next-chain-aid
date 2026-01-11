"use client"

import { TransactionTable } from "@/components/org/transaction-table"

export default function TransactionsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Riwayat Transaksi</h1>
        <p className="text-muted-foreground mt-1">
          Semua transaksi donasi dan penyaluran dana dari campaign Anda
        </p>
      </div>

      <TransactionTable />
    </div>
  )
}
