"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, X, Eye } from "lucide-react"
import { getOrganizations } from "@/lib/api"
import type { Organization } from "@/lib/types"

export function PendingOrganizations() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingOrganizations()
  }, [])

  async function loadPendingOrganizations() {
    try {
      const orgs = await getOrganizations('pending')
      setOrganizations(orgs.slice(0, 5)) // Show only first 5
    } catch (error) {
      console.error('Failed to load pending organizations:', error)
    } finally {
      setLoading(false)
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organisasi Menunggu Persetujuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (organizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organisasi Menunggu Persetujuan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Tidak ada organisasi yang menunggu persetujuan</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Organisasi Menunggu Persetujuan</CardTitle>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => router.push('/admin/organisasi/pending')}
        >
          Lihat Semua
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {organizations.map((org) => (
            <div
              key={org.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={org.image_url || `https://api.dicebear.com/7.x/shapes/svg?seed=${org.name}`} />
                  <AvatarFallback>{getInitials(org.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground truncate">{org.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {org.profile?.email || 'No email'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Terdaftar: {formatDate(org.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => router.push(`/admin/organisasi?id=${org.id}`)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Review
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
