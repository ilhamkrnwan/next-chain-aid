"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Building2, CheckCircle, XCircle, Ban, Snowflake } from "lucide-react"
import { getAdminActivityLog } from "@/lib/api"
import type { AdminAction } from "@/lib/types"

const actionIcons: Record<string, any> = {
  approve_organization: CheckCircle,
  reject_organization: XCircle,
  ban_organization: Ban,
  unban_organization: CheckCircle,
  approve_campaign: CheckCircle,
  reject_campaign: XCircle,
  freeze_campaign: Snowflake,
  unfreeze_campaign: CheckCircle,
}

const actionColors: Record<string, string> = {
  approve_organization: "text-green-600 bg-green-100",
  reject_organization: "text-red-600 bg-red-100",
  ban_organization: "text-red-600 bg-red-100",
  unban_organization: "text-green-600 bg-green-100",
  approve_campaign: "text-green-600 bg-green-100",
  reject_campaign: "text-red-600 bg-red-100",
  freeze_campaign: "text-orange-600 bg-orange-100",
  unfreeze_campaign: "text-green-600 bg-green-100",
}

const actionLabels: Record<string, string> = {
  approve_organization: "Menyetujui Organisasi",
  reject_organization: "Menolak Organisasi",
  ban_organization: "Memblokir Organisasi",
  unban_organization: "Membuka Blokir Organisasi",
  approve_campaign: "Menyetujui Campaign",
  reject_campaign: "Menolak Campaign",
  freeze_campaign: "Membekukan Campaign",
  unfreeze_campaign: "Membuka Bekukan Campaign",
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<AdminAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    try {
      const logs = await getAdminActivityLog(10)
      setActivities(logs)
    } catch (error) {
      console.error('Failed to load activity log:', error)
    } finally {
      setLoading(false)
    }
  }

  function getTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'Baru saja'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Admin Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Admin Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Belum ada aktivitas admin</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktivitas Admin Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, idx) => {
            const Icon = actionIcons[activity.action_type] || Building2
            const colorClass = actionColors[activity.action_type] || "text-blue-600 bg-blue-100"
            const label = actionLabels[activity.action_type] || activity.action_type

            return (
              <div key={activity.id} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {idx !== activities.length - 1 && <div className="w-0.5 h-16 bg-border mt-2" />}
                </div>
                <div className="pt-1 flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{label}</h4>
                  <p className="text-sm text-muted-foreground">
                    oleh {activity.admin?.full_name || 'Admin'}
                  </p>
                  {activity.details?.reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Alasan: {activity.details.reason}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(activity.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
