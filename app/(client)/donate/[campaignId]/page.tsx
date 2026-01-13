"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { campaignsData } from "@/lib/mock-campaigns"
import { AmountSelection } from "@/components/donation/amount-selection"
import { QrisPayment } from "@/components/donation/qris-payment"
import { ProcessingPayment } from "@/components/donation/processing-payment"
import { SuccessScreen } from "@/components/donation/success-screen"

export type DonationStep = "amount" | "payment" | "processing" | "success"

interface DonationData {
  amount: number
  isAnonymous: boolean
  message: string
}

export default function DonatePage({ params }: { params: { campaignId: string } }) {
  const router = useRouter()
  const campaign = campaignsData.find((c) => c.id === params.campaignId)
  const [step, setStep] = useState<DonationStep>("amount")
  const [donationData, setDonationData] = useState<DonationData>({
    amount: 0,
    isAnonymous: false,
    message: "",
  })
  const [receiptNumber, setReceiptNumber] = useState("")
  const [txHash, setTxHash] = useState("")

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Campaign tidak ditemukan</p>
      </div>
    )
  }

  const handleAmountSubmit = (data: DonationData) => {
    setDonationData(data)
    setStep("payment")
  }

  const handlePaymentSubmit = () => {
    setStep("processing")

    // Simulate payment processing
    setTimeout(() => {
      const receipt = `CHD-${Date.now()}`
      const hash = `0x${Math.random().toString(16).slice(2, 66)}`
      setReceiptNumber(receipt)
      setTxHash(hash)
      setStep("success")
    }, 3000)
  }

  const handleBack = () => {
    if (step === "amount") {
      router.back()
    } else if (step === "payment") {
      setStep("amount")
    } else {
      router.back()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step === "amount" && <AmountSelection campaign={campaign} onSubmit={handleAmountSubmit} onBack={handleBack} />}
        {step === "payment" && (
          <QrisPayment
            campaign={campaign}
            donationData={donationData}
            onSubmit={handlePaymentSubmit}
            onBack={() => setStep("amount")}
          />
        )}
        {step === "processing" && <ProcessingPayment />}
        {step === "success" && (
          <SuccessScreen
            campaign={campaign}
            donationData={donationData}
            receiptNumber={receiptNumber}
            txHash={txHash}
            onDone={() => router.push(`/campaigns/${campaign.id}`)}
          />
        )}
      </div>
    </main>
  )
}
