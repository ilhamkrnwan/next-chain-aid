import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Campaign } from "@/lib/types"
import { Users, Calendar, CheckCircle2 } from "lucide-react"
import { DonationModal } from "@/components/donation/donation-modal"

interface DonationCardProps {
  campaign: Campaign & {
    collected_amount?: number
    donor_count?: number
    target_amount_eth?: number
  }
  percentage: number
}

export function DonationCard({ campaign, percentage }: DonationCardProps) {
  // Calculate days remaining
  const daysRemaining = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600">Terkumpul</span>
          <span className="text-2xl font-bold text-blue-600">{percentage}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3">
          <div className="bg-blue-600 h-3 rounded-full transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {/* Amount */}
      <div className="space-y-2 py-4 border-y border-slate-200">
        {campaign.contract_address ? (
          <>
            <div className="flex justify-between">
              <span className="text-slate-600">Terkumpul</span>
              <span className="font-semibold text-slate-900">{(campaign.collected_amount || 0).toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Target</span>
              <span className="font-semibold text-slate-900">{(campaign.target_amount_eth || 0).toFixed(4)} ETH</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between">
              <span className="text-slate-600">Terkumpul</span>
              <span className="font-semibold text-slate-900">{formatCurrency(campaign.collected_amount || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Target</span>
              <span className="font-semibold text-slate-900">{formatCurrency(campaign.target_amount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">Donatur</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{(campaign.donor_count || 0).toLocaleString("id-ID")}</p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Tersisa</span>
          </div>
          <p className="text-xl font-bold text-slate-900">{daysRemaining} hari</p>
        </div>
      </div>

      {/* CTA Button */}
      <DonationModal campaign={campaign} />

      {/* Organization Info */}
      <Card className="p-4 bg-slate-50 space-y-3">
        <h3 className="font-semibold text-slate-900">Organisasi Pengelola</h3>
        <div className="space-y-2">
          <p className="text-slate-700 font-medium">{campaign.organization?.name || 'Organisasi'}</p>
          {campaign.organization?.is_verified && (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Terverifikasi</span>
            </div>
          )}
        </div>
      </Card>
    </Card>
  )
}