"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, ArrowUpRight, ShieldCheck, Wallet, Receipt } from "lucide-react"
import { getCampaignWithdrawals, weiToEth, formatAddress } from "@/lib/blockchain"
import type { Withdrawal } from "@/lib/types"

interface FundsDistributionProps {
  campaignId: string
  contractAddress?: string | null
}

export function FundsDistribution({ campaignId, contractAddress }: FundsDistributionProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (contractAddress) {
      loadWithdrawals()
    } else {
      setLoading(false)
    }
  }, [contractAddress])

  const loadWithdrawals = async () => {
    if (!contractAddress) return
    try {
      const data = await getCampaignWithdrawals(contractAddress)
      setWithdrawals(data)
    } catch (error) {
      console.error('Failed to load withdrawals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <div key={i} className="border-4 border-slate-900 rounded-3xl p-6 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-6 w-32 bg-slate-200" />
              <Skeleton className="h-6 w-24 bg-slate-200" />
            </div>
            <Skeleton className="h-12 w-full bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (!contractAddress || withdrawals.length === 0) {
    return (
      <Card className="p-12 border-4 border-dashed border-slate-300 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center text-center">
        <div className="bg-white p-4 border-2 border-slate-900 rounded-2xl mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-3">
          <Receipt className="w-8 h-8 text-slate-300" />
        </div>
        <p className="text-xl font-black text-slate-400 uppercase italic tracking-tighter">
          BELUM ADA PENYALURAN DANA
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* HEADER LOG */}
      <div className="flex items-center gap-3 px-2">
        <div className="bg-red-500 p-2 border-2 border-slate-900 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ArrowUpRight className="w-4 h-4 text-white stroke-[3px]" />
        </div>
        <h3 className="font-black uppercase italic tracking-widest text-sm text-slate-900">Distribusi Dana On-Chain</h3>
      </div>

      {withdrawals.map((withdrawal, idx) => (
        <div key={idx} className="group relative">
          {/* STACKED EFFECT */}
          <div className="absolute inset-0 bg-slate-900 rounded-[2rem] translate-x-1.5 translate-y-1.5" />
          
          <Card className="relative overflow-hidden border-4 border-slate-900 rounded-[2rem] bg-white group-hover:-translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
            <div className="p-6 md:p-8 space-y-6">
              
              {/* TOP ROW: DATE & AMOUNT */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b-4 border-dashed border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 border-2 border-slate-900 rounded-xl">
                    <Calendar className="w-5 h-5 text-slate-900" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tanggal Penyaluran</p>
                    <p className="font-black text-slate-900 uppercase italic text-sm">
                      {new Date(withdrawal.timestamp * 1000).toLocaleDateString("id-ID", {
                        day: "2-digit", month: "long", year: "numeric"
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="bg-red-50 border-4 border-red-500 px-6 py-2 rounded-2xl shadow-[4px_4px_0px_0px_#ef4444]">
                  <p className="text-[10px] font-black text-red-500 uppercase text-center mb-1">DANA KELUAR</p>
                  <p className="text-2xl font-black text-red-600 italic tracking-tighter">
                    -{weiToEth(withdrawal.amount)} ETH
                  </p>
                </div>
              </div>

              {/* DESCRIPTION SECTION */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Tujuan Penyaluran</h4>
                  <p className="text-xl font-bold text-slate-900 leading-tight uppercase italic tracking-tight">
                    {withdrawal.description}
                  </p>
                </div>

                {/* RECIPIENT & STATUS */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-mono text-[10px] shadow-[3px_3px_0px_0px_rgba(37,99,235,1)]">
                    <Wallet className="w-3.5 h-3.5 text-blue-400" />
                    {formatAddress(withdrawal.recipient)}
                  </div>

                  {withdrawal.completed && (
                    <div className="flex items-center gap-2 bg-green-400 border-2 border-slate-900 px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <ShieldCheck className="w-4 h-4 text-slate-900" />
                      <span className="text-[10px] font-black uppercase italic tracking-tighter">Verified Success</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* DECORATIVE AUDIT STAMP */}
            <div className="absolute -bottom-2 -right-2 bg-slate-50 border-t-2 border-l-2 border-slate-900 px-4 py-1 font-black text-[9px] text-slate-300 italic uppercase">
              Blockchain Audit Trail • ID-{idx + 100}
            </div>
          </Card>
        </div>
      ))}
    </div>
  )
}