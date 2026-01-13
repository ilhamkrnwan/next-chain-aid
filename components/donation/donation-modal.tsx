"use client"

import { useState } from "react"
import { donateToCampaign } from "@/lib/blockchain" // Memanggil fungsi Ethers kamu
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AmountSelection } from "@/components/donation/amount-selection"
import { toast } from "sonner"
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react"

export function DonationModal({ campaign }: { campaign: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [txHash, setTxHash] = useState("")

  const handleDonationSubmit = async (data: { amount: number; isAnonymous: boolean; message: string }) => {
    // 1. Validasi Alamat
    if (!campaign.contract_address || campaign.contract_address === "0x0") {
      toast.error("Alamat Smart Contract kampanye tidak valid")
      return
    }

    try {
      setStatus("loading")
      setErrorMsg("")

      // 2. Tentukan pesan (sesuai logika anonim)
      const donationMessage = data.isAnonymous ? "Anonim" : (data.message || "Donasi ChainAid")

      // 3. Eksekusi fungsi dari blockchain.ts (Memicu MetaMask)
      const receipt = await donateToCampaign(
        campaign.contract_address,
        data.amount.toString(),
        donationMessage
      )

      // 4. Jika berhasil sampai sini, berarti transaksi sukses di-mine
      setTxHash(receipt.hash)
      setStatus("success")
      toast.success("Donasi berhasil dikirim!")
      
    } catch (err: any) {
      console.error("Donation Error Detail:", err)
      setStatus("error")
      
      // Deteksi error umum
      if (err.message?.includes("user rejected")) {
        setErrorMsg("Transaksi dibatalkan di MetaMask.")
      } else if (err.message?.includes("insufficient funds")) {
        setErrorMsg("Saldo Sepolia ETH tidak cukup.")
      } else {
        setErrorMsg("Gagal berinteraksi dengan blockchain. Pastikan Anda di Network Sepolia.")
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
      if (!open) setTimeout(() => setStatus("idle"), 500) // Reset saat tutup
    }}>
      <DialogTrigger asChild>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold rounded-xl shadow-lg">
          Donasi Sekarang
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md p-0 bg-white overflow-hidden border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Donasi ETH - {campaign.title}</DialogTitle>
          <DialogDescription>Kirim dukungan ETH melalui jaringan Sepolia</DialogDescription>
        </DialogHeader>

        <div className="p-1">
          {status === "loading" ? (
            <div className="p-12 text-center space-y-6 flex flex-col items-center min-h-[400px] justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
              <div className="space-y-2">
                <p className="text-xl font-bold text-slate-900">Memproses Donasi</p>
                <p className="text-sm text-slate-500">Konfirmasi di MetaMask dan tunggu hingga transaksi selesai...</p>
              </div>
            </div>
          ) : status === "success" ? (
            <div className="p-12 text-center space-y-6 flex flex-col items-center min-h-[400px] justify-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Berhasil!</h2>
              <p className="text-sm text-slate-500">Donasi Anda telah tercatat di blockchain.</p>
              {txHash && (
                <a 
                  href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                  target="_blank" 
                  className="text-xs text-blue-600 underline"
                >
                  Lihat di Etherscan
                </a>
              )}
              <Button onClick={() => setIsOpen(false)} className="w-full">Tutup</Button>
            </div>
          ) : (
            <>
              <AmountSelection 
                campaign={campaign}
                onSubmit={handleDonationSubmit}
                onBack={() => setIsOpen(false)}
              />
              {status === "error" && (
                <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex gap-2 items-center text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p className="text-[11px] font-medium leading-tight">{errorMsg}</p>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}   