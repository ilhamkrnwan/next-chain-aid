"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { ChevronLeft, Wallet } from "lucide-react"

interface AmountSelectionProps {
  campaign: any 
  // Fungsi ini adalah "jembatan" ke DonationModal
  onSubmit: (data: { amount: number; isAnonymous: boolean; message: string }) => void
  onBack: () => void
}

export function AmountSelection({ campaign, onSubmit, onBack }: AmountSelectionProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [message, setMessage] = useState("")

  // Menghitung angka final untuk dikirim ke parent
  const finalAmount = selectedAmount || parseFloat(customAmount) || 0

  const handleSubmit = () => {
    // Validasi input sebelum dikirim ke parent
    if (finalAmount <= 0) {
      alert("Silakan masukkan jumlah ETH yang valid")
      return
    }

    // MEMANGGIL FUNGSI DARI PARENT (DonationModal)
    // Data ini akan ditangkap oleh handleDonationSubmit di modal
    onSubmit({
      amount: finalAmount,
      isAnonymous,
      message: message.trim(),
    })
  }

  const handleCustomInputChange = (value: string) => {
    // Hanya izinkan angka dan satu titik desimal
    const sanitized = value.replace(/[^0-9.]/g, '')
    setCustomAmount(sanitized)
    setSelectedAmount(null)
  }

  const getOrganizationName = (org: any) => {
    if (!org) return "Organisasi"
    if (typeof org === "object") return org.name
    return org
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-2">
        <button onClick={onBack} className="text-slate-600 hover:text-slate-900 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-blue-950">Detail Donasi</h1>
        <div className="w-6" />
      </div>

      {/* Campaign Summary */}
      <Card className="p-4 mx-2 bg-slate-50 border-none shadow-none flex gap-3 items-center">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={campaign.image_url || campaign.image || "/placeholder.svg"}
            alt={campaign.title}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-900 text-sm truncate">{campaign.title}</h3>
          <p className="text-xs text-slate-500">{getOrganizationName(campaign.organization)}</p>
        </div>
      </Card>

      <div className="px-4 space-y-6">
        {/* Unit Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-bold text-slate-700">Pilih Nominal ETH</Label>
          <div className="grid grid-cols-2 gap-2">
            {PRESET_AMOUNTS.map((preset) => (
              <Button
                key={preset.value}
                onClick={() => {
                  setSelectedAmount(preset.value)
                  setCustomAmount("")
                }}
                variant={selectedAmount === preset.value ? "default" : "outline"}
                className={`h-12 font-bold ${selectedAmount === preset.value ? "bg-blue-600" : "text-slate-600"}`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <div className="relative">
            <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Jumlah ETH lainnya..."
              value={customAmount}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              className="pl-10 h-12 font-mono"
            />
          </div>
        </div>

        {/* Message & Privacy */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-700">Pesan (On-chain)</Label>
            <Textarea
              placeholder="Tulis doa atau dukungan..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <Checkbox
              id="anon"
              checked={isAnonymous}
              onCheckedChange={(val) => setIsAnonymous(!!val)}
            />
            <Label htmlFor="anon" className="text-xs text-slate-600 cursor-pointer">
              Sembunyikan alamat wallet saya di publik (Anonim)
            </Label>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={finalAmount <= 0}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-blue-200"
        >
          Konfirmasi di MetaMask
        </Button>
      </div>
    </div>
  )
}

const PRESET_AMOUNTS = [
  { label: "0.001 ETH", value: 0.001 },
  { label: "0.01 ETH", value: 0.01 },
  { label: "0.05 ETH", value: 0.05 },
  { label: "0.1 ETH", value: 0.1 },
]