"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShieldCheck, CheckCircle2, SearchCode } from "lucide-react"

interface BlockchainVerificationProps {
  campaignId: string
  contractAddress: string
}

export function BlockchainVerification({ campaignId, contractAddress }: BlockchainVerificationProps) {
  return (
    <Card className="relative p-8 bg-white border-4 border-slate-900 rounded-[2.5rem] shadow-[10px_10px_0px_0px_rgba(37,99,235,1)] overflow-hidden">
      {/* DEKORASI STIKER VERIFIKASI */}
      <div className="absolute -top-2 -right-2 bg-yellow-400 border-4 border-slate-900 p-3 rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <ShieldCheck className="w-6 h-6 text-slate-900" />
      </div>

      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 border-2 border-slate-900 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <SearchCode className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
            Verifikasi <span className="text-blue-600">On-Chain</span>
          </h3>
        </div>

        {/* POIN VERIFIKASI */}
        <div className="space-y-4 pt-2">
          {[
            "Tercatat di Ethereum Sepolia Testnet",
            "Transparansi Mutlak & Anti-Manipulasi",
            "Smart Contract Terverifikasi & Aman"
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 group">
              <div className="mt-1 bg-green-400 border-2 border-slate-900 rounded-full p-0.5 group-hover:rotate-12 transition-transform">
                <CheckCircle2 className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-sm font-bold text-slate-600 uppercase italic tracking-tight leading-tight">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* ADDRESS BOX */}
        <div className="relative group mt-4">
          <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-all" />
          <div className="relative bg-slate-50 border-4 border-slate-900 p-4 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Smart Contract Address
            </p>
            <p className="text-xs font-mono font-bold text-blue-600 break-all leading-relaxed">
              {contractAddress}
            </p>
          </div>
        </div>

        {/* CTA BUTTON */}
        <Button
          className="w-full h-14 gap-3 bg-white hover:bg-slate-50 border-4 border-slate-900 text-slate-900 font-black uppercase italic tracking-tighter shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all rounded-2xl"
          onClick={() => {
            window.open(`https://sepolia.etherscan.io/address/${contractAddress}`, "_blank")
          }}
        >
          <ExternalLink className="w-5 h-5 text-blue-600 stroke-[3px]" />
          Lihat di Etherscan
        </Button>
      </div>

      {/* BACKGROUND ACCENT */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
    </Card>
  )
}